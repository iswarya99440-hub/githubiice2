from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Admin"


class IsSupervisor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Supervisor"


class IsCoordinator(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Coordinator"


class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Student"


class IsAdminOrSupervisor(permissions.BasePermission):
    def has_permission(self, request, view):
        return IsAdmin().has_permission(request, view) or IsSupervisor().has_permission(
            request, view
        )


class IsAdminOrCoordinator(permissions.BasePermission):
    def has_permission(self, request, view):
        return IsAdmin().has_permission(request, view) or IsCoordinator().has_permission(
            request, view
        )


class IsAdminSupervisorOrStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            IsAdmin().has_permission(request, view)
            or IsSupervisor().has_permission(request, view)
            or IsStudent().has_permission(request, view)
        )


class IsAdminCoordinatorOrSupervisor(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            IsAdmin().has_permission(request, view)
            or IsCoordinator().has_permission(request, view)
            or IsSupervisor().has_permission(request, view)
        )


class IsAdminCoordinatorSupervisorOrStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            IsAdmin().has_permission(request, view)
            or IsCoordinator().has_permission(request, view)
            or IsSupervisor().has_permission(request, view)
            or IsStudent().has_permission(request, view)
        )
