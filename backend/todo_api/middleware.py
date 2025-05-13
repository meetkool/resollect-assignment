from .cron import update_todo_statuses
import time

class UpdateExpiredTodosMiddleware:
    last_update_time = 0
    update_interval = 60  # Only update once per minute

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only update expired todos if enough time has passed since last update
        current_time = time.time()
        if current_time - self.__class__.last_update_time > self.__class__.update_interval:
            if not request.path.startswith('/admin/'):
                update_todo_statuses()
                self.__class__.last_update_time = current_time
                
        response = self.get_response(request)
        return response 