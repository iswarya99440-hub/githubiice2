from rest_framework import serializers
from .models import AttendanceRecord
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


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_details = StudentProfileSerializer(source="student", read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            "id",
            "student",
            "student_details",
            "supervisor",
            "date",
            "status",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_student(self, value):
        if value is None:
            raise serializers.ValidationError("Student is required.")

        if isinstance(value, StudentProfile):
            return value

        student_profile = StudentProfile.objects.filter(pk=value).first()
        if student_profile:
            return student_profile

        user = User.objects.filter(pk=value, role=User.Role.STUDENT).first()
        if user:
            student_profile = getattr(user, "studentprofile", None)
            if student_profile:
                return student_profile

        raise serializers.ValidationError("Selected student does not exist.")
