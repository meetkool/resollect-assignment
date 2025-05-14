from django.utils import timezone
from .models import Todo
import logging

logger = logging.getLogger(__name__)

def update_todo_statuses():
    """
    Updates expired todos (status='ongoing', deadline < now) to 'failure' status
    Returns a dict with operation status information
    """
    try:
        now = timezone.now()
        expired_todos = Todo.objects.filter(
            status='ongoing',
            deadline__lt=now
        )
        count = expired_todos.update(status='failure')
        logger.info(f'Updated {count} expired todos to failure status')
        
        return {
            'status': 'success',
            'message': f'Updated {count} expired todos to failure status',
            'data': {
                'count': count
            }
        }
    except Exception as e:
        logger.error(f'Error updating todo statuses: {str(e)}')
        return {
            'status': 'error',
            'message': f'Error updating todo statuses: {str(e)}',
            'data': None
        } 