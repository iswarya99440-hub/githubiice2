from django.db import models
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from auditlogs.audit_log_utils import log_action
from .models import ProgressLog, Milestone
from .serializers import ProgressLogSerializer, MilestoneSerializer


class ProgressLogViewSet(viewsets.ModelViewSet):
    serializer_class = ProgressLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ProgressLog.objects.select_related("student", "supervisor").order_by("-date")
        if self.request.user.is_staff or self.request.user.role in ["Admin", "Coordinator"]:
            return queryset
        if hasattr(self.request.user, "supervisorprofile"):
            return queryset.filter(supervisor=self.request.user.supervisorprofile)
        if hasattr(self.request.user, "studentprofile"):
            return queryset.filter(student=self.request.user.studentprofile)
        return queryset.none()

    def perform_create(self, serializer):
        if self.request.user.role == "Supervisor":
            raise ValidationError("Supervisors cannot create progress logs.")
        if (self.request.user.is_staff or self.request.user.role in ["Admin", "Coordinator"]) and serializer.validated_data.get("student"):
            serializer.save()
            return
        if hasattr(self.request.user, "studentprofile"):
            serializer.save(student=self.request.user.studentprofile)
            return
        raise ValidationError("Student profile not found for current user.")

    def update(self, request, *args, **kwargs):
        log = self.get_object()
        if request.user.role in ["Admin", "Coordinator"] or request.user.is_staff:
            return super().update(request, *args, **kwargs)
        if hasattr(request.user, "studentprofile") and log.student == request.user.studentprofile:
            return super().update(request, *args, **kwargs)
        if hasattr(request.user, "supervisorprofile") and log.supervisor == request.user.supervisorprofile:
            return super().update(request, *args, **kwargs)
        return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        log = self.get_object()
        if request.user.role not in ["Supervisor", "Admin", "Coordinator"] and not request.user.is_staff:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        log.approved = True
        log.save(update_fields=["approved"])
        log_action(
            request,
            action="PROGRESS_LOG_APPROVED",
            target_user=log.student.user if hasattr(log.student, "user") else None,
            additional_data={"progress_log_id": log.id},
        )
        return Response({"message": "Progress log approved."})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        log = self.get_object()
        if request.user.role not in ["Supervisor", "Admin", "Coordinator"] and not request.user.is_staff:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        log.approved = False
        log.save(update_fields=["approved"])
        log_action(
            request,
            action="PROGRESS_LOG_REJECTED",
            target_user=log.student.user if hasattr(log.student, "user") else None,
            additional_data={"progress_log_id": log.id},
        )
        return Response({"message": "Progress log marked as not approved."})

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        if request.user.role not in ["Admin", "Coordinator"] and not request.user.is_staff:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        total_logs = ProgressLog.objects.count()
        total_hours = ProgressLog.objects.aggregate(total=models.Sum("hours_completed"))
        by_student = ProgressLog.objects.values("student").annotate(total_hours=models.Sum("hours_completed"))
        return Response(
            {
                "total_logs": total_logs,
                "total_hours": total_hours.get("total"),
                "hours_by_student": list(by_student),
            }
        )


class MilestoneViewSet(viewsets.ModelViewSet):
    serializer_class = MilestoneSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Milestone.objects.all().order_by("due_date")
        if self.request.user.is_staff or self.request.user.role in ["Admin", "Coordinator"]:
            return queryset
        if hasattr(self.request.user, "studentprofile"):
            return queryset.filter(student=self.request.user.studentprofile)
        return queryset.none()

    def perform_create(self, serializer):
        if self.request.user.role not in ["Admin", "Coordinator"] and not self.request.user.is_staff:
            raise ValidationError("Only admins or coordinators can create milestones.")
        if (self.request.user.is_staff or self.request.user.role in ["Admin", "Coordinator"]) and serializer.validated_data.get("student"):
            serializer.save()
            return
        if hasattr(self.request.user, "studentprofile"):
            serializer.save(student=self.request.user.studentprofile)
            return
        raise ValidationError("Student profile not found for current user.")

    def update(self, request, *args, **kwargs):
        milestone = self.get_object()
        if request.user.role in ["Admin", "Coordinator"] or request.user.is_staff:
            return super().update(request, *args, **kwargs)
        if hasattr(request.user, "studentprofile") and milestone.student == request.user.studentprofile:
            return super().update(request, *args, **kwargs)
        return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

# Create your views here.
