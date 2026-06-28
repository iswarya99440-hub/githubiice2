import uuid

from django.conf import settings
from django.db import models

class Organization(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        PENDING = "PENDING", "Pending"
        SUSPENDED = "SUSPENDED", "Suspended"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    partner_user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="partner_organization",
    )
    name = models.CharField(max_length=255)
    address = models.TextField()
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=30, blank=True)
    industry = models.CharField(max_length=120, blank=True)
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)
    capacity = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
class InternshipPosition(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    description = models.TextField()
    required_skills = models.TextField()
    capacity = models.IntegerField()
    requirements = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class Application(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PARTNER_ACCEPTED = "PARTNER_ACCEPTED", "Partner Accepted"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey("authapi.StudentProfile", on_delete=models.CASCADE)
    position = models.ForeignKey(InternshipPosition, on_delete=models.CASCADE)
    cover_letter = models.TextField()
    cv = models.FileField(upload_to="cvs/")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.position}"
    
class Placement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.OneToOneField(Application, on_delete=models.CASCADE)
    supervisor = models.ForeignKey("authapi.SupervisorProfile", on_delete=models.SET_NULL, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    confirmed = models.BooleanField(default=False)

    def __str__(self):
        return str(self.application)
