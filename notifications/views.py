from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Notification.objects.all().order_by("-created_at")
        if self.request.user.is_staff or self.request.user.role in ["Admin", "Coordinator"]:
            return queryset
        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        if (self.request.user.is_staff or self.request.user.role in ["Admin", "Coordinator"]) and serializer.validated_data.get("user"):
            serializer.save()
        else:
            serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        notification = self.get_object()
        if not (request.user.is_staff or request.user.role in ["Admin", "Coordinator"]) and notification.user != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        notification = self.get_object()
        if not (request.user.is_staff or request.user.role in ["Admin", "Coordinator"]) and notification.user != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        if notification.user != request.user and not (request.user.is_staff or request.user.role in ["Admin", "Coordinator"]):
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=["is_read"])
        return Response({"message": "Notification marked as read."})

# Create your views here.
