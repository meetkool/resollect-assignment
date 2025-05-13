import uuid
from django.db import models
class Todo(models.Model):
    STATUS_CHOICES = [
        ('ongoing', 'Ongoing'),
        ('success', 'Success'),
        ('failure', 'Failure'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    deadline = models.DateTimeField()
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='ongoing'
    )
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['-createdAt']  # Sort by created date, newest first
    def __str__(self):
        return self.title
