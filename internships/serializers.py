from rest_framework import serializers
from .models import Organization, InternshipPosition, Application, Placement
from auth.models import StudentProfile, SupervisorProfile, User


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "profile_picture", "first_name", "last_name", "phone"]


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = ["id", "student_id", "program", "year_of_study", "graduation_date", "skills", "user"]


class SupervisorProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = SupervisorProfile
        fields = ["id", "organization", "position", "user"]


class OrganizationSerializer(serializers.ModelSerializer):
    partner_user_details = UserBasicSerializer(source="partner_user", read_only=True)

    class Meta:
        model = Organization
        fields = [
            "id",
            "partner_user",
            "partner_user_details",
            "name",
            "address",
            "contact_email",
            "contact_phone",
            "industry",
            "website",
            "description",
            "capacity",
            "status",
            "settings",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class InternshipPositionSerializer(serializers.ModelSerializer):
    organization_details = OrganizationSerializer(source="organization", read_only=True)
    occupied_capacity = serializers.SerializerMethodField()
    available_capacity = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()

    class Meta:
        model = InternshipPosition
        fields = [
            "id",
            "title",
            "organization",
            "organization_details",
            "description",
            "required_skills",
            "capacity",
            "occupied_capacity",
            "available_capacity",
            "is_full",
            "requirements",
            "location",
            "start_date",
            "end_date",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "organization": {"required": False},
        }

    def _occupied(self, obj):
        annotated = getattr(obj, "occupied_capacity_count", None)
        if annotated is not None:
            return annotated
        return Placement.objects.filter(application__position=obj, confirmed=True).count()

    def get_occupied_capacity(self, obj):
        return self._occupied(obj)

    def get_available_capacity(self, obj):
        return max((obj.capacity or 0) - self._occupied(obj), 0)

    def get_is_full(self, obj):
        return (obj.capacity or 0) > 0 and self._occupied(obj) >= (obj.capacity or 0)


class ApplicationSerializer(serializers.ModelSerializer):
    student_details = StudentProfileSerializer(source="student", read_only=True)
    position_details = InternshipPositionSerializer(source="position", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "student",
            "student_details",
            "position",
            "position_details",
            "cover_letter",
            "cv",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "student": {"required": False},
        }


class PlacementSerializer(serializers.ModelSerializer):
    student_details = serializers.SerializerMethodField()
    supervisor_details = SupervisorProfileSerializer(source="supervisor", read_only=True)
    application_details = ApplicationSerializer(source="application", read_only=True)

    class Meta:
        model = Placement
        fields = [
            "id",
            "application",
            "application_details",
            "student_details",
            "supervisor",
            "supervisor_details",
            "start_date",
            "end_date",
            "confirmed",
        ]

    def get_student_details(self, obj):
        student = getattr(obj.application, "student", None)
        if not student:
            return None
        return StudentProfileSerializer(student).data

    def validate_supervisor(self, value):
        if value is None:
            return value

        if isinstance(value, SupervisorProfile):
            return value

        supervisor_profile = SupervisorProfile.objects.filter(pk=value).first()
        if supervisor_profile:
            return supervisor_profile

        user = User.objects.filter(pk=value, role=User.Role.SUPERVISOR).first()
        if user:
            supervisor_profile, _ = SupervisorProfile.objects.get_or_create(
                user=user,
                defaults={"organization": "", "position": ""},
            )
            return supervisor_profile

        raise serializers.ValidationError("Selected supervisor does not exist.")
