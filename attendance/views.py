from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.db import models
from .models import AttendanceRecord
from .serializers import AttendanceRecordSerializer


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = AttendanceRecord.objects.select_related("student", "student__user", "supervisor")
        if self.request.user.is_staff or self.request.user.role in ["Admin", "Coordinator"]:
            return queryset
        if self.request.user.role == "Partner":
            from internships.models import Placement
            org = getattr(self.request.user, "partner_organization", None)
            if not org:
                return queryset.none()
            student_ids = Placement.objects.filter(
                application__position__organization=org
            ).values_list("application__student_id", flat=True)
            return queryset.filter(student_id__in=student_ids)
        if hasattr(self.request.user, "supervisorprofile"):
            return queryset.filter(supervisor=self.request.user.supervisorprofile)
        if hasattr(self.request.user, "studentprofile"):
            return queryset.filter(student=self.request.user.studentprofile)
        return queryset.none()

    def perform_create(self, serializer):
        if self.request.user.role not in ["Supervisor", "Admin", "Coordinator", "Partner"] and not self.request.user.is_staff:
            raise ValidationError("Only supervisors, partners, or admins can create attendance records.")
        if self.request.user.role == "Partner":
            from internships.models import Placement
            org = getattr(self.request.user, "partner_organization", None)
            student = serializer.validated_data.get("student")
            if not org or not Placement.objects.filter(application__position__organization=org, application__student=student).exists():
                raise ValidationError("You can only record attendance for students assigned to your organization.")
        if self.request.user.role == "Supervisor" and hasattr(self.request.user, "supervisorprofile"):
            serializer.save(supervisor=self.request.user.supervisorprofile)
            return
        serializer.save()

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        if request.user.role not in ["Admin", "Coordinator", "Supervisor", "Partner"] and not request.user.is_staff:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        queryset = self.get_queryset()
        by_status = queryset.values("status").annotate(count=models.Count("id"))
        return Response({"total": queryset.count(), "by_status": list(by_status)})
