from django.shortcuts import render
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from rest_framework.pagination import PageNumberPagination
from .models import Todo
from .serializers import TodoSerializer
from .cron import update_todo_statuses
from django.db.models import Count, Avg, F, ExpressionWrapper, fields, Q
import datetime
# Create a pagination class that can be disabled
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000
# Create your views here.
class TodoViewSet(viewsets.ModelViewSet):
    queryset = Todo.objects.all()
    serializer_class = TodoSerializer
    pagination_class = StandardResultsSetPagination
    def get_queryset(self):
        # Check for expired tasks before returning results
        update_todo_statuses()
        queryset = Todo.objects.all()
        # If 'no_page' is in query params, disable pagination
        if 'no_page' in self.request.query_params:
            self.pagination_class = None
        return queryset
    @action(detail=True, methods=['patch'])
    def mark_complete(self, request, pk=None):
        todo = self.get_object()
        todo.status = 'success'
        todo.save()
        serializer = self.get_serializer(todo)
        return Response(serializer.data)
    @action(detail=False, methods=['get'])
    def ongoing(self, request):
        # Check for expired tasks before filtering
        update_todo_statuses()
        todos = Todo.objects.filter(status='ongoing')
        serializer = self.get_serializer(todos, many=True)
        return Response(serializer.data)
    @action(detail=False, methods=['get'])
    def success(self, request):
        todos = Todo.objects.filter(status='success')
        serializer = self.get_serializer(todos, many=True)
        return Response(serializer.data)
    @action(detail=False, methods=['get'])
    def failure(self, request):
        # Check for expired tasks before filtering
        update_todo_statuses()
        todos = Todo.objects.filter(status='failure')
        serializer = self.get_serializer(todos, many=True)
        return Response(serializer.data)
# Analytics API endpoints
@api_view(['GET'])
def task_completion_stats(request):
    # Get counts by status
    status_counts = Todo.objects.values('status').annotate(count=Count('status'))
    # Get completion rate over time (by week)
    now = timezone.now()
    start_date = now - datetime.timedelta(days=90)  # Last 90 days
    # Group todos by week and count by status
    weekly_data = []
    current = start_date
    while current <= now:
        week_end = current + datetime.timedelta(days=7)
        # Get todos created in this week
        week_todos = Todo.objects.filter(createdAt__gte=current, createdAt__lt=week_end)
        total = week_todos.count()
        # Count completed todos
        success = week_todos.filter(status='success').count()
        failed = week_todos.filter(status='failure').count()
        if total > 0:
            completion_rate = (success / total) * 100
        else:
            completion_rate = 0
        weekly_data.append({
            'week_start': current.strftime('%Y-%m-%d'),
            'week_end': week_end.strftime('%Y-%m-%d'),
            'total_tasks': total,
            'completed_tasks': success,
            'failed_tasks': failed,
            'completion_rate': round(completion_rate, 2)
        })
        current = week_end
    return Response({
        'status_distribution': status_counts,
        'weekly_completion': weekly_data
    })
@api_view(['GET'])
def productivity_patterns(request):
    todos = Todo.objects.all()
    # Creation time patterns (hour of day) - fix the SQL syntax for SQLite
    # Use strftime instead of EXTRACT for SQLite compatibility
    creation_hours = []
    for hour in range(24):  # 0-23 hours
        count = todos.filter(createdAt__hour=hour).count()
        if count > 0:  # Only include hours with tasks
            creation_hours.append({'hour': hour, 'count': count})
    # Calculate average time to complete tasks
    # Only consider successful tasks
    completed_todos = todos.filter(status='success')
    completion_time_data = []
    if completed_todos.exists():
        # Calculate completion time (updatedAt - createdAt)
        for todo in completed_todos:
            delta = todo.updatedAt - todo.createdAt
            hours = delta.total_seconds() / 3600  # Convert to hours
            completion_time_data.append({
                'id': str(todo.id),
                'title': todo.title,
                'completion_time_hours': round(hours, 2)
            })
    # Calculate average completion time in hours
    avg_completion_time = 0
    if completion_time_data:
        avg_completion_time = sum(item['completion_time_hours'] for item in completion_time_data) / len(completion_time_data)
    return Response({
        'creation_hour_distribution': creation_hours,
        'avg_completion_time_hours': round(avg_completion_time, 2),
        'completion_time_data': completion_time_data
    })
@api_view(['GET'])
def task_duration_analysis(request):
    todos = Todo.objects.all()
    # Calculate planned duration for each task
    duration_data = []
    for todo in todos:
        if todo.deadline and todo.createdAt:
            delta = todo.deadline - todo.createdAt
            days = delta.total_seconds() / (24 * 3600)  # Convert to days
            status = todo.status
            duration_data.append({
                'id': str(todo.id),
                'title': todo.title,
                'planned_duration_days': round(days, 2),
                'status': status
            })
    # Group by duration ranges - using a large but finite number instead of infinity
    max_days = 365 * 10  # 10 years is a practical "infinity" for tasks
    duration_ranges = {
        'short': {'min': 0, 'max': 1, 'count': 0},  # 0-1 days
        'medium': {'min': 1, 'max': 7, 'count': 0},  # 1-7 days
        'long': {'min': 7, 'max': max_days, 'count': 0}  # >7 days
    }
    for item in duration_data:
        duration = item['planned_duration_days']
        if duration <= duration_ranges['short']['max']:
            duration_ranges['short']['count'] += 1
        elif duration <= duration_ranges['medium']['max']:
            duration_ranges['medium']['count'] += 1
        else:
            duration_ranges['long']['count'] += 1
    return Response({
        'duration_data': duration_data,
        'duration_ranges': duration_ranges
    })
