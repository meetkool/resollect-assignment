from django.utils import timezone
from .models import Todo
def update_todo_statuses():
    now = timezone.now()
    # Find all ongoing todos with deadlines in the past
    expired_todos = Todo.objects.filter(
        status='ongoing',
        deadline__lt=now
    )
    # Update their status to 'failure'
    count = expired_todos.update(status='failure')
    print(f'Updated {count} expired todos to failure status')
    return count 