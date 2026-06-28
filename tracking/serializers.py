from rest_framework import serializers
from .models import ProgressLog, Milestone
from auth.models import User, StudentProfile


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "profile_picture"]


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = ["id", "student_id", "program", "year_of_study", "graduation_date", "skills", "user"]


class ProgressLogSerializer(serializers.ModelSerializer):
    student_details = StudentProfileSerializer(source="student", read_only=True)

    class Meta:
        model = ProgressLog
        fields = [
            "id",
            "student",
            "student_details",
            "date",
            "hours_completed",
            "summary",
            "supervisor",
            "approved",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "student": {"required": False},
        }


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ["id", "student", "title", "description", "due_date", "completed", "completed_at"]
        extra_kwargs = {
            "student": {"required": False},
        }
