from django.contrib import admin
from .models import AttendanceRecord


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "date", "status", "supervisor", "created_at")
    list_filter = ("status", "date")
    search_fields = ("student__user__username", "student__user__email")
