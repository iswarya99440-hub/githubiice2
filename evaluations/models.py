from django.db import models


class Evaluation(models.Model):
    class EvaluationType(models.TextChoices):
        MIDTERM = "MIDTERM"
        FINAL = "FINAL"

    student = models.ForeignKey("authapi.StudentProfile", on_delete=models.CASCADE)
    supervisor = models.ForeignKey("authapi.SupervisorProfile", on_delete=models.SET_NULL, null=True)
    evaluation_type = models.CharField(max_length=20, choices=EvaluationType.choices)
    score = models.PositiveSmallIntegerField()
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.evaluation_type}"


class EvaluationCriterion(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    max_score = models.PositiveSmallIntegerField(default=5)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class EvaluationRating(models.Model):
    evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE, related_name="ratings")
    criterion = models.ForeignKey(EvaluationCriterion, on_delete=models.PROTECT)
    score = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)

    def __str__(self):
        return f"{self.evaluation_id} - {self.criterion}"
