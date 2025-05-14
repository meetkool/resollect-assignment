import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Todo
from .serializers import TodoSerializer
import logging

logger = logging.getLogger(__name__)

class TodoConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time todo updates
    Manages connections, disconnections, and message handling
    """
    
    async def connect(self):
        """
        Connect to the WebSocket and join the todos group
        Send initial todo list upon connection
        """
        try:
            logger.info("WebSocket connection attempt")
            # Join the todos group
            await self.channel_layer.group_add(
                "todos",
                self.channel_name
            )
            await self.accept()
            
            logger.info("WebSocket connected")
            
            # Send initial todo list on connect
            todos = await self.get_todos()
            await self.send(text_data=json.dumps({
                'type': 'todo_list',
                'todos': todos
            }))
        except Exception as e:
            logger.error(f"Error in WebSocket connect: {str(e)}")
            # Still try to accept the connection to send an error
            if not self.accepted:
                await self.accept()
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Connection error'
                }))
    
    async def disconnect(self, close_code):
        """
        Leave the todos group on disconnect
        """
        try:
            logger.info(f"WebSocket disconnected with code {close_code}")
            await self.channel_layer.group_discard(
                "todos",
                self.channel_name
            )
        except Exception as e:
            logger.error(f"Error in WebSocket disconnect: {str(e)}")
    
    async def receive(self, text_data):
        """
        Receive message from WebSocket
        Handle different message types (like requesting todos)
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type', '')
            logger.info(f"Received WebSocket message type: {message_type}")
            
            if message_type == 'request_todos':
                # Client is requesting the todo list
                todos = await self.get_todos()
                await self.send(text_data=json.dumps({
                    'type': 'todo_list',
                    'todos': todos
                }))
        except Exception as e:
            logger.error(f"Error in WebSocket receive: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Message processing error: {str(e)}'
            }))
    
    async def todo_update(self, event):
        """
        Receive todo_update event from group and send to WebSocket
        """
        try:
            # Send the todo update to the WebSocket
            await self.send(text_data=json.dumps({
                'type': 'todo_update',
                'todo': event['todo']
            }))
        except Exception as e:
            logger.error(f"Error in todo_update: {str(e)}")
    
    async def todo_create(self, event):
        """
        Receive todo_create event from group and send to WebSocket
        """
        try:
            # Send the new todo to the WebSocket
            await self.send(text_data=json.dumps({
                'type': 'todo_create',
                'todo': event['todo']
            }))
        except Exception as e:
            logger.error(f"Error in todo_create: {str(e)}")
    
    async def todo_delete(self, event):
        """
        Receive todo_delete event from group and send to WebSocket
        """
        try:
            # Send the deleted todo ID to the WebSocket
            await self.send(text_data=json.dumps({
                'type': 'todo_delete',
                'todo_id': event['todo_id']
            }))
        except Exception as e:
            logger.error(f"Error in todo_delete: {str(e)}")
    
    @database_sync_to_async
    def get_todos(self):
        """
        Get all todos from the database
        """
        try:
            todos = Todo.objects.all()
            return TodoSerializer(todos, many=True).data
        except Exception as e:
            logger.error(f"Error getting todos: {str(e)}")
            return [] 