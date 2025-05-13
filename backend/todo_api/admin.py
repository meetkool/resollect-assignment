from django.contrib import admin
from .models import Todo

@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ('title', 'deadline', 'status', 'createdAt', 'updatedAt')
    list_filter = ('status',)
    search_fields = ('title', 'description')
    readonly_fields = ('id', 'createdAt', 'updatedAt')
