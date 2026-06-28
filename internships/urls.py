from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OrganizationViewSet,
    InternshipPositionViewSet,
    ApplicationViewSet,
    PlacementViewSet,
    PartnerPortalViewSet,
)


router = DefaultRouter()
router.register(r"organizations", OrganizationViewSet, basename="organization")
router.register(r"positions", InternshipPositionViewSet, basename="position")
router.register(r"applications", ApplicationViewSet, basename="application")
router.register(r"placements", PlacementViewSet, basename="placement")
router.register(r"partner", PartnerPortalViewSet, basename="partner")

urlpatterns = [
    path("", include(router.urls)),
]
