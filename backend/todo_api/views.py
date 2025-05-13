from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from .models import Todo
from .serializers import TodoSerializer

# Create a pagination class that can be disabled
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000

# Create your views here.
class TodoViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing todo items.
    """
    queryset = Todo.objects.all()
    serializer_class = TodoSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
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
        todos = Todo.objects.filter(status='failure')
        serializer = self.get_serializer(todos, many=True)
        return Response(serializer.data)
