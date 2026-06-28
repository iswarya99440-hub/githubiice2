from django.urls import path
from .views import AuditLogListView, MyAuditLogListView

urlpatterns = [
    path('audit-logs/', AuditLogListView.as_view(), name='audit-log-list'),
    path('audit-logs/me/', MyAuditLogListView.as_view(), name='audit-log-my-list'),
]
