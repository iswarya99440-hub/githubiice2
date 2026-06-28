from rest_framework import serializers
from .models import Report
from auth.models import User, StudentProfile


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "profile_picture", "first_name", "last_name", "phone"]


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = ["id", "student_id", "program", "year_of_study", "graduation_date", "skills", "user"]


class ReportSerializer(serializers.ModelSerializer):
    student_details = StudentProfileSerializer(source="student", read_only=True)
    supervisor_approved_by_details = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            "id",
            "student",
            "student_details",
            "type",
            "file",
            "feedback",
            "coordinator_feedback",
            "coordinator_approved",
            "coordinator_approved_at",
            "coordinator_approved_by",
            "supervisor_approved",
            "supervisor_approved_at",
            "supervisor_approved_by",
            "supervisor_approved_by_details",
            "submitted_at",
        ]
        read_only_fields = [
            "id",
            "submitted_at",
            "coordinator_feedback",
            "coordinator_approved",
            "coordinator_approved_at",
            "coordinator_approved_by",
            "supervisor_approved",
            "supervisor_approved_at",
            "supervisor_approved_by",
        ]
        extra_kwargs = {
            "student": {"required": False},
        }

    def get_supervisor_approved_by_details(self, obj):
        supervisor = getattr(obj, "supervisor_approved_by", None)
        if not supervisor:
            return None
        return {
            "id": supervisor.id,
            "organization": supervisor.organization,
            "position": supervisor.position,
            "user": UserBasicSerializer(supervisor.user).data if supervisor.user_id else None,
        }
