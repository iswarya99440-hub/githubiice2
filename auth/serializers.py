from rest_framework import serializers
from .models import CoordinatorProfile, StudentProfile, SupervisorProfile, User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


class StudentProfileInputSerializer(serializers.Serializer):
    student_id = serializers.CharField(max_length=50)
    program = serializers.CharField(max_length=100)
    year_of_study = serializers.IntegerField(min_value=1)
    graduation_date = serializers.DateField()
    skills = serializers.CharField(required=False, allow_blank=True)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    student_profile = StudentProfileInputSerializer(required=False)

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password",
            "role",
            "first_name",
            "last_name",
            "phone",
            "student_profile",
        )

    def validate_role(self, value):
        if not value:
            raise serializers.ValidationError("Role is required.")

        normalized = value.strip().lower()
        role_map = {
            "admin": User.Role.ADMIN,
            "administrator": User.Role.ADMIN,
            "supervisor": User.Role.SUPERVISOR,
            "coordinator": User.Role.COORDINATOR,
            "student": User.Role.STUDENT,
            "partner": User.Role.PARTNER,
            "partner organization": User.Role.PARTNER,
        }
        if normalized not in role_map:
            raise serializers.ValidationError("Invalid role.")
        return role_map[normalized]

    def create(self, validated_data):
        student_profile = validated_data.pop("student_profile", None)
        first_name = validated_data.pop("first_name", "")
        last_name = validated_data.pop("last_name", "")
        phone = validated_data.pop("phone", "")

        user = User.objects.create_user(
            username=validated_data.get("username"),
            email=validated_data["email"],
            password=validated_data["password"],
            role=validated_data["role"],
        )
        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name
        if phone:
            user.phone = phone
        user.save(update_fields=["first_name", "last_name", "phone"])

        if user.role == User.Role.STUDENT and student_profile:
            StudentProfile.objects.create(
                user=user,
                student_id=student_profile.get("student_id", ""),
                program=student_profile.get("program", ""),
                year_of_study=student_profile.get("year_of_study", 1),
                graduation_date=student_profile.get("graduation_date"),
                skills=student_profile.get("skills", ""),
            )
            self._send_institution_email_verification(user)
        elif user.role == User.Role.SUPERVISOR:
            SupervisorProfile.objects.get_or_create(
                user=user,
                defaults={"organization": "", "position": ""},
            )
        elif user.role == User.Role.COORDINATOR:
            CoordinatorProfile.objects.get_or_create(
                user=user,
                defaults={"department": ""},
            )
        return user

    def _send_institution_email_verification(self, user):
        verification_base_url = getattr(
            settings,
            "BACKEND_VERIFY_EMAIL_URL",
            "http://127.0.0.1:8000/api/auth/verify-institution-email",
        )
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        verify_link = f"{verification_base_url}/{uid}/{token}/"
        send_mail(
            subject="Verify your institutional email",
            message=(
                f"Hello {user.first_name or user.username},\n\n"
                "Please confirm that this institutional email belongs to you by clicking the link below:\n\n"
                f"{verify_link}\n\n"
                "No code or password is required. This link only verifies ownership of your email address."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )


class AdminUserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "email", "role", "status")
        extra_kwargs = {
            "status": {"required": False},
        }

    def create(self, validated_data):
        password = User.generate_random_password()
        user = User.objects.create_user(
            username=validated_data.get("username"),
            email=validated_data["email"],
            password=password,
            role=validated_data["role"],
            status=validated_data.get("status", User.Status.ACTIVE),
        )
        if user.role == User.Role.SUPERVISOR:
            SupervisorProfile.objects.get_or_create(
                user=user,
                defaults={"organization": "", "position": ""},
            )
        elif user.role == User.Role.COORDINATOR:
            CoordinatorProfile.objects.get_or_create(
                user=user,
                defaults={"department": ""},
            )
        user.temporary_password = password
        return user


class UserSerializer(serializers.ModelSerializer):
    student_profile_id = serializers.SerializerMethodField()
    supervisor_profile_id = serializers.SerializerMethodField()
    coordinator_profile_id = serializers.SerializerMethodField()
    student_profile = serializers.SerializerMethodField()
    supervisor_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "role",
            "status",
            "is_active",
            "profile_picture",
            "first_name",
            "last_name",
            "phone",
            "institution_email_verified",
            "student_profile_id",
            "student_profile",
            "supervisor_profile_id",
            "supervisor_profile",
            "coordinator_profile_id",
        )
        read_only_fields = ("is_active",)

    def get_student_profile_id(self, obj):
        profile = getattr(obj, "studentprofile", None)
        return profile.id if profile else None

    def get_student_profile(self, obj):
        profile = getattr(obj, "studentprofile", None)
        if not profile:
            return None
        return {
            "id": profile.id,
            "student_id": profile.student_id,
            "program": profile.program,
            "year_of_study": profile.year_of_study,
            "graduation_date": profile.graduation_date,
            "skills": profile.skills,
        }

    def get_supervisor_profile_id(self, obj):
        profile = getattr(obj, "supervisorprofile", None)
        if not profile and obj.role == User.Role.SUPERVISOR:
            profile, _ = SupervisorProfile.objects.get_or_create(
                user=obj,
                defaults={"organization": "", "position": ""},
            )
        return profile.id if profile else None

    def get_supervisor_profile(self, obj):
        profile = getattr(obj, "supervisorprofile", None)
        if not profile:
            return None
        return {
            "id": profile.id,
            "organization": profile.organization,
            "position": profile.position,
        }

    def get_coordinator_profile_id(self, obj):
        profile = getattr(obj, "coordinatorprofile", None)
        return profile.id if profile else None


class ProfileUpdateSerializer(serializers.ModelSerializer):
    new_password = serializers.CharField(
        write_only=True, required=False, validators=[validate_password]
    )
    current_password = serializers.CharField(write_only=True, required=False)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ["username", "current_password", "new_password", "profile_picture"]

    def validate(self, data):
        user = self.context["request"].user

        if "new_password" in data:
            if not user.check_password(data.get("current_password")):
                raise serializers.ValidationError(
                    {"current_password": "Current password is incorrect."}
                )
        return data

    def update(self, instance, validated_data):
        if "username" in validated_data:
            instance.username = validated_data["username"]

        if "new_password" in validated_data:
            instance.set_password(validated_data["new_password"])

        if "profile_picture" in validated_data:
            if instance.profile_picture:
                instance.profile_picture.delete(save=False)
            instance.profile_picture = validated_data["profile_picture"]

        instance.save()
        return instance
