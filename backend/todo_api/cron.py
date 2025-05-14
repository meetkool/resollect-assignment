from django.utils import timezone
from .models import Todo
from .serializers import TodoSerializer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
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
        
        # If any todos were updated, notify WebSocket clients
        if count > 0:
            # Get the updated todos
            updated_todos = Todo.objects.filter(
                status='failure',
                deadline__lt=now
            ).order_by('-updatedAt')[:count]
            
            # Serialize the todos
            serializer = TodoSerializer(updated_todos, many=True)
            todo_data = serializer.data
            
            # Notify WebSocket clients about each updated todo
            channel_layer = get_channel_layer()
            for todo in todo_data:
                async_to_sync(channel_layer.group_send)(
                    "todos",
                    {
                        "type": "todo_update",
                        "todo": todo
                    }
                )
        
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