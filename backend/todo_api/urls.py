from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TodoViewSet, task_completion_stats, productivity_patterns, task_duration_analysis
router = DefaultRouter()
router.register(r'todos', TodoViewSet)
urlpatterns = [
    path('', include(router.urls)),
    # Analytics endpoints
    path('analytics/completion-stats/', task_completion_stats, name='task-completion-stats'),
    path('analytics/productivity-patterns/', productivity_patterns, name='productivity-patterns'),
    path('analytics/duration-analysis/', task_duration_analysis, name='task-duration-analysis'),
] 