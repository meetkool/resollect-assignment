from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TodoViewSet, AnalyticsViewSet

router = DefaultRouter()
router.register(r'todos', TodoViewSet)
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('', include(router.urls)),
] 