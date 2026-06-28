from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EvaluationViewSet, EvaluationCriterionViewSet, EvaluationRatingViewSet


router = DefaultRouter()
router.register(r"evaluations", EvaluationViewSet, basename="evaluation")
router.register(r"evaluation-criteria", EvaluationCriterionViewSet, basename="evaluation-criterion")
router.register(r"evaluation-ratings", EvaluationRatingViewSet, basename="evaluation-rating")

urlpatterns = [
    path("", include(router.urls)),
]
