from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProgressLogViewSet, MilestoneViewSet


router = DefaultRouter()
router.register(r"progress-logs", ProgressLogViewSet, basename="progress-log")
router.register(r"milestones", MilestoneViewSet, basename="milestone")

urlpatterns = [
    path("", include(router.urls)),
]
