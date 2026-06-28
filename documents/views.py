from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Document
from .serializers import DocumentSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Document.objects.all().order_by("-uploaded_at")
        if self.request.user.is_staff or self.request.user.role in ["Admin", "Coordinator"]:
            return queryset
        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        if (self.request.user.is_staff or self.request.user.role in ["Admin", "Coordinator"]) and serializer.validated_data.get("user"):
            serializer.save()
        else:
            serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not (request.user.is_staff or request.user.role in ["Admin", "Coordinator"]) and instance.user != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if not (request.user.is_staff or request.user.role in ["Admin", "Coordinator"]) and instance.user != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

# Create your views here.
