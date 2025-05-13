from django.core.management.base import BaseCommand
from django.utils import timezone
from todo_api.models import Todo
class Command(BaseCommand):
    help = 'Updates todo statuses based on deadlines'
    def handle(self, *args, **kwargs):
        # Get current time
        now = timezone.now()
        # Find all ongoing todos with deadlines in the past
        expired_todos = Todo.objects.filter(
            status='ongoing',
            deadline__lt=now
        )
        # Update their status to 'failure'
        count = expired_todos.update(status='failure')
        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {count} expired todos to failure status')
        ) 