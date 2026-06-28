from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("auth.urls")),
    path("api/", include("communication.urls")),
    path("api/", include("auditlogs.urls")),
    path("api/", include("documents.urls")),
    path("api/", include("notifications.urls")),
    path("api/", include("reports.urls")),
    path("api/", include("internships.urls")),
    path("api/", include("evaluations.urls")),
    path("api/", include("tracking.urls")),
    path("api/", include("attendance.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
