from django.db import models


class ProgressLog(models.Model):
    student = models.ForeignKey("authapi.StudentProfile", on_delete=models.CASCADE)
    date = models.DateField()
    hours_completed = models.DecimalField(max_digits=5, decimal_places=2)
    summary = models.TextField()
    supervisor = models.ForeignKey("authapi.SupervisorProfile", on_delete=models.SET_NULL, null=True, blank=True)
    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.date}"


class Milestone(models.Model):
    student = models.ForeignKey("authapi.StudentProfile", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateField()
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title
