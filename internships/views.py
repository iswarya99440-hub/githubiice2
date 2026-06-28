from django.db import models
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Organization, InternshipPosition, Application, Placement
from auth.models import SupervisorProfile, User
from .serializers import (
    OrganizationSerializer,
    InternshipPositionSerializer,
    ApplicationSerializer,
    PlacementSerializer,
    SupervisorProfileSerializer,
)


def is_admin_or_coordinator(user):
    return user.is_staff or user.role in ["Admin", "Coordinator"]


def is_partner(user):
    return user.role == "Partner"


def get_partner_organization(user):
    organization = getattr(user, "partner_organization", None)
    if organization:
        return organization
    return Organization.objects.filter(contact_email__iexact=user.email).first()


def confirmed_placements_count(position, exclude_application=None):
    queryset = Placement.objects.filter(application__position=position, confirmed=True)
    if exclude_application:
        queryset = queryset.exclude(application=exclude_application)
    return queryset.count()


def position_has_capacity(position, exclude_application=None):
    return confirmed_placements_count(position, exclude_application=exclude_application) < (position.capacity or 0)


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all().order_by("name")
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Organization.objects.all().order_by("name")
        if is_admin_or_coordinator(self.request.user):
            return queryset
        if is_partner(self.request.user):
            org = get_partner_organization(self.request.user)
            return queryset.filter(pk=org.pk) if org else queryset.none()
        return queryset

    def create(self, request, *args, **kwargs):
        if not is_admin_or_coordinator(request.user) and not is_partner(request.user):
            raise ValidationError("Only admins, coordinators, or partner organizations can create organizations.")
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        if is_partner(self.request.user):
            if get_partner_organization(self.request.user):
                raise ValidationError("Your partner account already has an organization profile.")
            serializer.save(partner_user=self.request.user, contact_email=self.request.user.email)
            return
        serializer.save()

    def update(self, request, *args, **kwargs):
        if is_partner(request.user):
            org = self.get_object()
            if org != get_partner_organization(request.user):
                raise ValidationError("You can only update your own organization.")
        elif not is_admin_or_coordinator(request.user):
            raise ValidationError("Only admins or coordinators can update organizations.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not is_admin_or_coordinator(request.user):
            raise ValidationError("Only admins or coordinators can delete organizations.")
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        org = get_partner_organization(request.user)
        if request.method == "GET":
            if not org:
                return Response(None, status=status.HTTP_200_OK)
            return Response(self.get_serializer(org).data)

        if not is_partner(request.user):
            return Response({"detail": "Only partner organizations can update this profile."}, status=status.HTTP_403_FORBIDDEN)
        if not org:
            serializer = self.get_serializer(data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save(partner_user=request.user, contact_email=request.user.email)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        serializer = self.get_serializer(org, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class InternshipPositionViewSet(viewsets.ModelViewSet):
    queryset = InternshipPosition.objects.select_related("organization").all()
    serializer_class = InternshipPositionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = InternshipPosition.objects.select_related("organization").annotate(
            occupied_capacity_count=models.Count(
                "application__placement",
                filter=models.Q(application__placement__confirmed=True),
                distinct=True,
            )
        ).all().order_by("-created_at")
        if is_admin_or_coordinator(self.request.user):
            return queryset
        if hasattr(self.request.user, "studentprofile"):
            return queryset.filter(is_active=True, occupied_capacity_count__lt=models.F("capacity"))
        if is_partner(self.request.user):
            org = get_partner_organization(self.request.user)
            return queryset.filter(organization=org) if org else queryset.none()
        if hasattr(self.request.user, "supervisorprofile"):
            return queryset
        return queryset

    def create(self, request, *args, **kwargs):
        if not is_admin_or_coordinator(request.user) and not is_partner(request.user):
            raise ValidationError("Only admins, coordinators, or partner organizations can create positions.")
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        if is_partner(self.request.user):
            org = get_partner_organization(self.request.user)
            if not org:
                raise ValidationError("Create your organization profile before adding positions.")
            serializer.save(organization=org)
            return
        serializer.save()

    def update(self, request, *args, **kwargs):
        if is_partner(request.user):
            position = self.get_object()
            if position.organization != get_partner_organization(request.user):
                raise ValidationError("You can only update positions for your organization.")
        elif not is_admin_or_coordinator(request.user):
            raise ValidationError("Only admins or coordinators can update positions.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if is_partner(request.user):
            position = self.get_object()
            if position.organization != get_partner_organization(request.user):
                raise ValidationError("You can only delete positions for your organization.")
        elif not is_admin_or_coordinator(request.user):
            raise ValidationError("Only admins or coordinators can delete positions.")
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get"])
    def recommendations(self, request):
        student = getattr(request.user, "studentprofile", None)
        student_id = request.query_params.get("student_id")
        if student_id and request.user.role in ["Admin", "Coordinator"]:
            try:
                from auth.models import StudentProfile

                student = StudentProfile.objects.get(id=student_id)
            except StudentProfile.DoesNotExist:
                return Response({"detail": "Student not found."}, status=status.HTTP_404_NOT_FOUND)
        if not student:
            return Response({"detail": "Student profile required."}, status=status.HTTP_400_BAD_REQUEST)

        student_skills = {s.strip().lower() for s in (student.skills or "").split(",") if s.strip()}
        recommendations = []
        positions = InternshipPosition.objects.select_related("organization").annotate(
            occupied_capacity_count=models.Count(
                "application__placement",
                filter=models.Q(application__placement__confirmed=True),
                distinct=True,
            )
        ).filter(is_active=True, occupied_capacity_count__lt=models.F("capacity"))
        for position in positions:
            required_skills = {s.strip().lower() for s in (position.required_skills or "").split(",") if s.strip()}
            if not required_skills:
                score = 0
            else:
                score = len(student_skills & required_skills) / len(required_skills)
            recommendations.append(
                {
                    "position": position,
                    "match_score": round(score, 2),
                    "matched_skills": sorted(student_skills & required_skills),
                }
            )

        recommendations.sort(key=lambda x: x["match_score"], reverse=True)
        top_n = int(request.query_params.get("top", 10))
        serializer = InternshipPositionSerializer([r["position"] for r in recommendations[:top_n]], many=True)
        for idx, data in enumerate(serializer.data):
            data["match_score"] = recommendations[idx]["match_score"]
            data["matched_skills"] = recommendations[idx]["matched_skills"]
        return Response(serializer.data)


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Application.objects.select_related("student", "student__user", "position", "position__organization").order_by("-created_at")
        if is_admin_or_coordinator(self.request.user):
            return queryset
        if is_partner(self.request.user):
            org = get_partner_organization(self.request.user)
            return queryset.filter(position__organization=org) if org else queryset.none()
        if self.request.user.role == "Supervisor":
            return queryset
        if hasattr(self.request.user, "studentprofile"):
            return queryset.filter(student=self.request.user.studentprofile)
        return queryset.none()

    def perform_create(self, serializer):
        if self.request.user.role in ["Supervisor", "Coordinator"]:
            raise ValidationError("Only students or admins can submit applications.")
        if (self.request.user.is_staff or self.request.user.role == "Admin") and serializer.validated_data.get("student"):
            serializer.save()
            return
        if hasattr(self.request.user, "studentprofile"):
            position = serializer.validated_data.get("position")
            if position and not position.is_active:
                raise ValidationError("This internship position is closed and no longer accepts applications.")
            if position and not position_has_capacity(position):
                raise ValidationError("This position has reached its maximum capacity and is no longer available for registration.")
            serializer.save(student=self.request.user.studentprofile)
            return
        raise ValidationError("Student profile not found for current user.")

    def update(self, request, *args, **kwargs):
        if is_partner(request.user):
            application = self.get_object()
            if application.position.organization != get_partner_organization(request.user):
                raise ValidationError("You can only update applications sent to your organization.")
        elif not is_admin_or_coordinator(request.user):
            raise ValidationError("Only admins, coordinators, or partner organizations can update applications.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not is_admin_or_coordinator(request.user):
            raise ValidationError("Only admins or coordinators can delete applications.")
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        application = self.get_object()
        if not is_admin_or_coordinator(request.user):
            org = get_partner_organization(request.user)
            if not is_partner(request.user) or application.position.organization != org:
                return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        if is_admin_or_coordinator(request.user):
            application.status = Application.Status.APPROVED
        else:
            application.status = Application.Status.PARTNER_ACCEPTED
        application.save(update_fields=["status"])
        return Response(self.get_serializer(application).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        application = self.get_object()
        if not is_admin_or_coordinator(request.user):
            org = get_partner_organization(request.user)
            if not is_partner(request.user) or application.position.organization != org:
                return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        application.status = Application.Status.REJECTED
        application.save(update_fields=["status"])
        return Response(self.get_serializer(application).data)

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        if request.user.role not in ["Admin", "Coordinator"] and not request.user.is_staff:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        total = Application.objects.count()
        by_status = Application.objects.values("status").annotate(count=models.Count("id"))
        return Response({"total": total, "by_status": list(by_status)})

    @action(detail=False, methods=["post"])
    def bulk_status(self, request):
        if request.user.role not in ["Admin", "Coordinator"] and not request.user.is_staff:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        ids = request.data.get("ids", [])
        status_value = request.data.get("status")
        if not ids or not status_value:
            return Response({"detail": "ids and status are required."}, status=status.HTTP_400_BAD_REQUEST)
        updated = Application.objects.filter(id__in=ids).update(status=status_value)
        return Response({"updated": updated})


class PlacementViewSet(viewsets.ModelViewSet):
    queryset = Placement.objects.select_related("application", "supervisor").all()
    serializer_class = PlacementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Placement.objects.select_related("application", "application__position", "application__position__organization", "supervisor", "application__student", "application__student__user").all()
        if is_admin_or_coordinator(self.request.user):
            return queryset
        if is_partner(self.request.user):
            org = get_partner_organization(self.request.user)
            return queryset.filter(application__position__organization=org) if org else queryset.none()
        if hasattr(self.request.user, "supervisorprofile"):
            return queryset.filter(supervisor=self.request.user.supervisorprofile)
        if hasattr(self.request.user, "studentprofile"):
            return queryset.filter(application__student=self.request.user.studentprofile)
        return queryset.none()

    def create(self, request, *args, **kwargs):
        if not is_admin_or_coordinator(request.user) and not is_partner(request.user):
            raise ValidationError("Only admins, coordinators, or partner organizations can create placements.")
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        application = serializer.validated_data.get("application")
        confirmed = serializer.validated_data.get("confirmed", False)
        if confirmed and application and not position_has_capacity(application.position):
            raise ValidationError("This position has reached its maximum capacity and cannot accept more confirmed placements.")
        serializer.save()

    def update(self, request, *args, **kwargs):
        if is_partner(request.user):
            placement = self.get_object()
            if placement.application.position.organization != get_partner_organization(request.user):
                raise ValidationError("You can only update placements for your organization.")
        elif not is_admin_or_coordinator(request.user):
            raise ValidationError("Only admins, coordinators, or partner organizations can update placements.")
        placement = self.get_object()
        requested_confirmed = request.data.get("confirmed")
        if requested_confirmed in [True, "true", "True", "1", 1] and not placement.confirmed:
            if not position_has_capacity(placement.application.position, exclude_application=placement.application):
                raise ValidationError("This position has reached its maximum capacity and cannot accept more confirmed placements.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not is_admin_or_coordinator(request.user):
            raise ValidationError("Only admins or coordinators can delete placements.")
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["post"])
    def assign_supervisor(self, request):
        if not is_admin_or_coordinator(request.user) and not is_partner(request.user):
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        application_id = request.data.get("application")
        supervisor_id = request.data.get("supervisor")
        start_date = request.data.get("start_date") or timezone.now().date()
        end_date = request.data.get("end_date") or start_date
        if not application_id or not supervisor_id:
            return Response({"detail": "application and supervisor are required."}, status=status.HTTP_400_BAD_REQUEST)
        application = Application.objects.select_related("position", "position__organization").filter(pk=application_id).first()
        if not application:
            return Response({"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND)
        if is_partner(request.user) and application.position.organization != get_partner_organization(request.user):
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        supervisor = SupervisorProfile.objects.filter(pk=supervisor_id).first()
        if not supervisor:
            return Response({"detail": "Supervisor not found."}, status=status.HTTP_404_NOT_FOUND)
        existing = Placement.objects.filter(application=application).first()
        if not position_has_capacity(application.position, exclude_application=application if existing else None):
            return Response(
                {"detail": "This position has reached its maximum capacity and cannot accept more confirmed placements."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        placement, _ = Placement.objects.update_or_create(
            application=application,
            defaults={
                "supervisor": supervisor,
                "start_date": start_date,
                "end_date": end_date,
                "confirmed": True,
            },
        )
        if is_partner(request.user):
            application.status = Application.Status.PARTNER_ACCEPTED
        else:
            application.status = Application.Status.APPROVED
        application.save(update_fields=["status"])
        return Response(self.get_serializer(placement).data)

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        if not is_admin_or_coordinator(request.user) and not is_partner(request.user):
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        queryset = self.get_queryset()
        total = queryset.count()
        confirmed = queryset.filter(confirmed=True).count()
        by_supervisor = queryset.values("supervisor").annotate(count=models.Count("id"))
        return Response({"total": total, "confirmed": confirmed, "by_supervisor": list(by_supervisor)})


class PartnerPortalViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def _org(self, request, required=True):
        org = get_partner_organization(request.user)
        if not org and required and not is_admin_or_coordinator(request.user):
            raise ValidationError({"detail": "Partner organization profile not found."})
        return org

    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        org = self._org(request, required=False)
        if not org:
            return Response(
                {
                    "organization": None,
                    "metrics": {
                        "positions": 0,
                        "active_positions": 0,
                        "applications": 0,
                        "pending_applications": 0,
                        "assigned_students": 0,
                        "supervisors": 0,
                        "reports_pending_feedback": 0,
                        "average_evaluation_score": None,
                        "attendance_present": 0,
                        "attendance_absent": 0,
                    },
                    "application_status": [],
                    "placement_statistics": {"confirmed": 0, "unconfirmed": 0},
                    "supervisors": [],
                    "recent_applications": [],
                    "assigned_students": [],
                }
            )
        positions = InternshipPosition.objects.filter(organization=org)
        applications = Application.objects.filter(position__organization=org)
        placements = Placement.objects.filter(application__position__organization=org)
        assigned_student_ids = placements.values_list("application__student_id", flat=True)

        from attendance.models import AttendanceRecord
        from evaluations.models import Evaluation
        from reports.models import Report

        attendance = AttendanceRecord.objects.filter(student_id__in=assigned_student_ids)
        evaluations = Evaluation.objects.filter(student_id__in=assigned_student_ids)
        reports = Report.objects.filter(student_id__in=assigned_student_ids, supervisor_approved=True)
        supervisors = SupervisorProfile.objects.filter(organization__iexact=org.name)

        return Response(
            {
                "organization": OrganizationSerializer(org).data if org else None,
                "metrics": {
                    "positions": positions.count(),
                    "active_positions": positions.filter(is_active=True).count(),
                    "applications": applications.count(),
                    "pending_applications": applications.filter(status=Application.Status.PENDING).count(),
                    "awaiting_admin_confirmation": applications.filter(status=Application.Status.PARTNER_ACCEPTED).count(),
                    "assigned_students": placements.count(),
                    "supervisors": supervisors.count(),
                    "reports_pending_feedback": reports.filter(feedback="").count(),
                    "average_evaluation_score": evaluations.aggregate(avg=models.Avg("score"))["avg"],
                    "attendance_present": attendance.filter(status="PRESENT").count(),
                    "attendance_absent": attendance.filter(status="ABSENT").count(),
                },
                "application_status": list(applications.values("status").annotate(count=models.Count("id"))),
                "placement_statistics": {
                    "confirmed": placements.filter(confirmed=True).count(),
                    "unconfirmed": placements.filter(confirmed=False).count(),
                },
                "supervisors": SupervisorProfileSerializer(supervisors, many=True).data,
                "recent_applications": ApplicationSerializer(applications.order_by("-created_at")[:8], many=True).data,
                "assigned_students": PlacementSerializer(placements.order_by("-start_date")[:12], many=True).data,
            }
        )

    @action(detail=False, methods=["get"])
    def supervisors(self, request):
        org = self._org(request, required=False)
        if not org:
            return Response([])
        supervisors = SupervisorProfile.objects.filter(organization__iexact=org.name).select_related("user")
        return Response(SupervisorProfileSerializer(supervisors, many=True).data)

    @action(detail=False, methods=["post"])
    def create_supervisor(self, request):
        org = self._org(request)
        if not is_partner(request.user) and not is_admin_or_coordinator(request.user):
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        username = (request.data.get("username") or "").strip()
        email = (request.data.get("email") or "").strip().lower()
        position = (request.data.get("position") or "Internship Supervisor").strip()
        phone = (request.data.get("phone") or "").strip()

        if not username or not email:
            return Response({"detail": "Supervisor name and email are required."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email__iexact=email).exists():
            return Response({"detail": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        password = User.generate_random_password()
        supervisor_user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=User.Role.SUPERVISOR,
            status=User.Status.ACTIVE,
        )
        if phone:
            supervisor_user.phone = phone
            supervisor_user.save(update_fields=["phone"])

        supervisor_profile, _ = SupervisorProfile.objects.update_or_create(
            user=supervisor_user,
            defaults={"organization": org.name, "position": position},
        )

        email_sent = True
        try:
            frontend_login_url = getattr(settings, "FRONTEND_LOGIN_URL", "http://localhost:3000/auth")
            send_mail(
                subject="Your Supervisor Account Has Been Created",
                message=(
                    f"Hello {supervisor_user.username},\n\n"
                    f"{org.name} has created a supervisor account for you on the Internship Placement and Tracking System.\n\n"
                    f"Email: {supervisor_user.email}\n"
                    f"Temporary Password: {password}\n"
                    f"Role: Supervisor\n"
                    f"Organization: {org.name}\n\n"
                    f"Please log in at {frontend_login_url} and change your password immediately."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[supervisor_user.email],
                fail_silently=False,
            )
        except Exception:
            email_sent = False

        return Response(
            {
                "message": "Supervisor created.",
                "email_sent": email_sent,
                "supervisor": SupervisorProfileSerializer(supervisor_profile).data,
            },
            status=status.HTTP_201_CREATED,
        )

# Create your views here.
