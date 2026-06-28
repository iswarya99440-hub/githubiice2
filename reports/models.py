from django.db import models


class Report(models.Model):
    class Type(models.TextChoices):
        WEEKLY = "WEEKLY"
        FINAL = "FINAL"

    student = models.ForeignKey("authapi.StudentProfile", on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=Type.choices)
    file = models.FileField(upload_to="reports/")
    feedback = models.TextField(blank=True)
    coordinator_feedback = models.TextField(blank=True)
    coordinator_approved = models.BooleanField(default=False)
    coordinator_approved_at = models.DateTimeField(null=True, blank=True)
    coordinator_approved_by = models.ForeignKey(
        "authapi.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="coordinator_approved_reports",
    )
    supervisor_approved = models.BooleanField(default=False)
    supervisor_approved_at = models.DateTimeField(null=True, blank=True)
    supervisor_approved_by = models.ForeignKey(
        "authapi.SupervisorProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_reports",
    )
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.type}"
