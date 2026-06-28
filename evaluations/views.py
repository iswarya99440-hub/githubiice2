from django.db import models
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import Evaluation, EvaluationCriterion, EvaluationRating
from .serializers import (
    EvaluationSerializer,
    EvaluationSummarySerializer,
    EvaluationCriterionSerializer,
    EvaluationRatingSerializer,
)


class EvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def _build_summaries(self, queryset):
        students = {}
        for evaluation in queryset.select_related("student__user", "supervisor").order_by("student_id", "-created_at"):
            summary = students.setdefault(
                evaluation.student_id,
                {
                    "student": evaluation.student,
                    "midterm": None,
                    "final": None,
                },
            )
            if evaluation.evaluation_type == Evaluation.EvaluationType.MIDTERM and summary["midterm"] is None:
                summary["midterm"] = evaluation
            if evaluation.evaluation_type == Evaluation.EvaluationType.FINAL and summary["final"] is None:
                summary["final"] = evaluation

        payload = []
        for summary in students.values():
            midterm = summary["midterm"]
            final = summary["final"]
            midterm_score = midterm.score if midterm else None
            final_score = final.score if final else None
            total_score = (midterm_score or 0) + (final_score or 0)
            is_complete = midterm is not None and final is not None
            payload.append({
                "student": summary["student"],
                "midterm": midterm,
                "final": final,
                "midterm_score": midterm_score,
                "final_score": final_score,
                "total_score": total_score,
                "total_max_score": 100,
                "final_score_out_of_20": round(total_score / 5, 2) if is_complete else None,
                "is_complete": is_complete,
            })
        return payload

    def get_queryset(self):
        queryset = Evaluation.objects.select_related("student", "supervisor").order_by("-created_at")
        if self.request.user.is_staff or self.request.user.role in ["Admin", "Coordinator"]:
            return queryset
        if self.request.user.role == "Partner":
            from internships.models import Placement
            org = getattr(self.request.user, "partner_organization", None)
            if not org:
                return queryset.none()
            student_ids = Placement.objects.filter(
                application__position__organization=org
            ).values_list("application__student_id", flat=True)
            return queryset.filter(student_id__in=student_ids)
        if self.request.user.role == "Supervisor":
            return queryset.filter(supervisor=self.request.user.supervisorprofile)
        if hasattr(self.request.user, "studentprofile"):
            return queryset.filter(student=self.request.user.studentprofile)
        return queryset.none()

    def perform_create(self, serializer):
        if self.request.user.role not in ["Supervisor", "Admin", "Coordinator", "Partner"] and not self.request.user.is_staff:
            raise ValidationError("Only supervisors, partners, or admins can create evaluations.")
        if self.request.user.role == "Partner":
            from internships.models import Placement
            org = getattr(self.request.user, "partner_organization", None)
            student = serializer.validated_data.get("student")
            if not org or not Placement.objects.filter(application__position__organization=org, application__student=student).exists():
                raise ValidationError("You can only evaluate students assigned to your organization.")
        if self.request.user.role == "Supervisor" and hasattr(self.request.user, "supervisorprofile"):
            serializer.save(supervisor=self.request.user.supervisorprofile)
            return
        serializer.save()

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        if request.user.role not in ["Admin", "Coordinator", "Partner"] and not request.user.is_staff:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        queryset = self.get_queryset()
        total = queryset.count()
        by_type = queryset.values("evaluation_type").annotate(count=models.Count("id"))
        avg_score = queryset.aggregate(avg=models.Avg("score"))
        summaries = self._build_summaries(queryset)
        completed_scores = [
            item["final_score_out_of_20"]
            for item in summaries
            if item["final_score_out_of_20"] is not None
        ]
        avg_score_out_of_20 = (
            round(sum(completed_scores) / len(completed_scores), 2)
            if completed_scores else None
        )
        return Response({
            "total": total,
            "by_type": list(by_type),
            "avg_score": avg_score.get("avg"),
            "avg_score_out_of_20": avg_score_out_of_20,
            "completed_students": len(completed_scores),
        })

    @action(detail=False, methods=["get"])
    def summaries(self, request):
        serializer = EvaluationSummarySerializer(
            self._build_summaries(self.get_queryset()),
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)


class EvaluationCriterionViewSet(viewsets.ModelViewSet):
    queryset = EvaluationCriterion.objects.all().order_by("name")
    serializer_class = EvaluationCriterionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if request.user.role not in ["Admin", "Coordinator"] and not request.user.is_staff:
            raise ValidationError("Only admins or coordinators can create criteria.")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if request.user.role not in ["Admin", "Coordinator"] and not request.user.is_staff:
            raise ValidationError("Only admins or coordinators can update criteria.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.role not in ["Admin", "Coordinator"] and not request.user.is_staff:
            raise ValidationError("Only admins or coordinators can delete criteria.")
        return super().destroy(request, *args, **kwargs)


class EvaluationRatingViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluationRatingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = EvaluationRating.objects.select_related("evaluation", "criterion").all()
        if self.request.user.is_staff or self.request.user.role in ["Admin", "Coordinator"]:
            return queryset
        if self.request.user.role == "Partner":
            from internships.models import Placement
            org = getattr(self.request.user, "partner_organization", None)
            if not org:
                return queryset.none()
            student_ids = Placement.objects.filter(
                application__position__organization=org
            ).values_list("application__student_id", flat=True)
            return queryset.filter(evaluation__student_id__in=student_ids)
        if self.request.user.role == "Supervisor":
            return queryset.filter(evaluation__supervisor=self.request.user.supervisorprofile)
        if hasattr(self.request.user, "studentprofile"):
            return queryset.filter(evaluation__student=self.request.user.studentprofile)
        return queryset.none()

    def perform_create(self, serializer):
        if self.request.user.role not in ["Supervisor", "Admin", "Coordinator", "Partner"] and not self.request.user.is_staff:
            raise ValidationError("Only supervisors, partners, or admins can create ratings.")
        serializer.save()

# Create your views here.
