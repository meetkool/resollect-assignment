from rest_framework import serializers
from .models import Todo
class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ['id', 'title', 'description', 'deadline', 'status', 'createdAt', 'updatedAt']
        read_only_fields = ['id', 'createdAt', 'updatedAt'] 