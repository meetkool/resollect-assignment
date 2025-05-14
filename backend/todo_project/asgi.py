"""
ASGI config for todo_project project.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import todo_api.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'todo_project.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            todo_api.routing.websocket_urlpatterns
        )
    ),
})
