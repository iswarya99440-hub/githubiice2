from django.contrib.auth.models import AbstractUser
from django.db import models
import secrets
import string


class User(AbstractUser):
    """
    Custom user built on top of Django's AbstractUser.
    Email is the login field; role and status capture our domain needs.
    """

    username = models.CharField(max_length=150, unique=False, blank=True)
    email = models.EmailField(unique=True)

    class Role(models.TextChoices):
        ADMIN = ("Admin", "Administrator")
        SUPERVISOR = ("Supervisor", "Supervisor")
        COORDINATOR = ("Coordinator", "Coordinator")
        STUDENT = ("Student", "Student")
        PARTNER = ("Partner", "Partner Organization")

    role = models.CharField(max_length=20, choices=Role.choices)

    class Status(models.TextChoices):
        ACTIVE = ("Active", "Active")
        INACTIVE = ("Inactive", "Inactive")

    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.ACTIVE
    )
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        blank=True,
        null=True,
        help_text="Upload a profile picture",
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Optional phone number for account contact",
    )
    institution_email_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username or self.email} ({self.role})"

    def get_profile_picture_url(self):
        """Return the URL of the profile picture or None if not set"""
        if self.profile_picture:
            return self.profile_picture.url
        return None

    @classmethod
    def generate_random_password(cls):
        """Generate a secure random password"""
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        return "".join(secrets.choice(alphabet) for _ in range(12))

    def save(self, *args, **kwargs):
        """
        Keep `status` and `is_active` in sync.
        - Explicit status controls truth of is_active.
        - If is_active was toggled directly, mirror it back to status.
        """
        if self.is_active is False:
            self.status = self.Status.INACTIVE
        if self.status == self.Status.INACTIVE:
            self.is_active = False
        else:
            self.status = self.Status.ACTIVE
            self.is_active = True

        super().save(*args, **kwargs)

    def activate(self):
        """Activate the user"""
        self.status = self.Status.ACTIVE
        self.is_active = True
        self.save(update_fields=["status", "is_active"])

    def deactivate(self):
        """Deactivate the user"""
        self.status = self.Status.INACTIVE
        self.is_active = False
        self.save(update_fields=["status", "is_active"])

    @property
    def is_user_active(self):
        """Check if user is active (using status field as source of truth)"""
        return self.status == self.Status.ACTIVE
    
class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    student_id = models.CharField(max_length=50)
    program = models.CharField(max_length=100)
    year_of_study = models.IntegerField()
    graduation_date = models.DateField()
    skills = models.TextField(blank=True)

    def __str__(self):
        return self.user.username
    
class SupervisorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    organization = models.CharField(max_length=255)
    position = models.CharField(max_length=100)

    def __str__(self):
        return self.user.username
    
class CoordinatorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    department = models.CharField(max_length=255)

    def __str__(self):
        return self.user.username
