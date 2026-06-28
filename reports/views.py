from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Report
from .serializers import ReportSerializer
from auditlogs.audit_log_utils import log_action


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Report.objects.select_related(
            "student",
            "student__user",
            "supervisor_approved_by",
            "supervisor_approved_by__user",
        ).order_by("-submitted_at")
        if self.request.user.is_staff or self.request.user.role in ["Admin", "Coordinator"]:
            return queryset.filter(supervisor_approved=True)
        if self.request.user.role == "Partner":
            from internships.models import Placement
            org = getattr(self.request.user, "partner_organization", None)
            if not org:
                return queryset.none()
            student_ids = Placement.objects.filter(
                application__position__organization=org
            ).values_list("application__student_id", flat=True)
            return queryset.filter(student_id__in=student_ids, supervisor_approved=True)
        if self.request.user.role == "Supervisor":
            from internships.models import Placement
            supervisor_profile = getattr(self.request.user, "supervisorprofile", None)
            if not supervisor_profile:
                return queryset.none()
            student_ids = Placement.objects.filter(
                supervisor=supervisor_profile
            ).values_list("application__student_id", flat=True)
            return queryset.filter(student_id__in=student_ids)
        if hasattr(self.request.user, "studentprofile"):
            return queryset.filter(student=self.request.user.studentprofile)
        return queryset.none()

    def perform_create(self, serializer):
        if self.request.user.role == "Supervisor":
            raise ValidationError("Supervisors cannot submit reports.")
        if (self.request.user.is_staff or self.request.user.role in ["Admin", "Coordinator"]) and serializer.validated_data.get("student"):
            serializer.save()
            return
        if hasattr(self.request.user, "studentprofile"):
            serializer.save(student=self.request.user.studentprofile)
            return
        raise ValidationError("Student profile not found for current user.")

    @action(detail=True, methods=["post"])
    def set_feedback(self, request, pk=None):
        report = self.get_object()
        if request.user.role not in ["Supervisor", "Admin", "Coordinator", "Partner"] and not request.user.is_staff:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        feedback = request.data.get("feedback", "")
        report.feedback = feedback
        report.save(update_fields=["feedback"])
        log_action(
            request,
            action="REPORT_FEEDBACK_SET",
            target_user=report.student.user if hasattr(report.student, "user") else None,
            additional_data={"report_id": report.id},
        )
        return Response({"message": "Feedback updated.", "feedback": report.feedback})

    @action(detail=True, methods=["post"])
    def set_coordinator_feedback(self, request, pk=None):
        report = self.get_object()
        if request.user.role not in ["Admin", "Coordinator"] and not request.user.is_staff:
            return Response({"detail": "Only admins or coordinators can add coordinator feedback."}, status=status.HTTP_403_FORBIDDEN)
        feedback = request.data.get("feedback", "")
        report.coordinator_feedback = feedback
        report.save(update_fields=["coordinator_feedback"])
        log_action(
            request,
            action="REPORT_COORDINATOR_FEEDBACK_SET",
            target_user=report.student.user if hasattr(report.student, "user") else None,
            additional_data={"report_id": report.id},
        )
        return Response({"message": "Coordinator feedback updated.", "coordinator_feedback": report.coordinator_feedback})

    @action(detail=True, methods=["post"])
    def coordinator_approve(self, request, pk=None):
        report = self.get_object()
        if request.user.role not in ["Admin", "Coordinator"] and not request.user.is_staff:
            return Response({"detail": "Only admins or coordinators can approve reports."}, status=status.HTTP_403_FORBIDDEN)
        feedback = request.data.get("feedback")
        if feedback is not None:
            report.coordinator_feedback = feedback
        report.coordinator_approved = True
        report.coordinator_approved_at = timezone.now()
        report.coordinator_approved_by = request.user
        report.save(update_fields=["coordinator_feedback", "coordinator_approved", "coordinator_approved_at", "coordinator_approved_by"])
        log_action(
            request,
            action="REPORT_COORDINATOR_APPROVED",
            target_user=report.student.user if hasattr(report.student, "user") else None,
            additional_data={"report_id": report.id},
        )
        return Response(self.get_serializer(report).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        report = self.get_object()
        supervisor_profile = getattr(request.user, "supervisorprofile", None)
        if request.user.role != "Supervisor" or not supervisor_profile:
            return Response({"detail": "Only assigned supervisors can approve reports."}, status=status.HTTP_403_FORBIDDEN)

        from internships.models import Placement
        assigned = Placement.objects.filter(
            supervisor=supervisor_profile,
            application__student=report.student,
        ).exists()
        if not assigned:
            return Response({"detail": "You can only approve reports submitted by your assigned interns."}, status=status.HTTP_403_FORBIDDEN)

        feedback = request.data.get("feedback")
        if feedback is not None:
            report.feedback = feedback
        report.supervisor_approved = True
        report.supervisor_approved_at = timezone.now()
        report.supervisor_approved_by = supervisor_profile
        report.save(update_fields=["feedback", "supervisor_approved", "supervisor_approved_at", "supervisor_approved_by"])
        log_action(
            request,
            action="REPORT_SUPERVISOR_APPROVED",
            target_user=report.student.user if hasattr(report.student, "user") else None,
            additional_data={"report_id": report.id},
        )
        return Response(self.get_serializer(report).data)

# Create your views here.
