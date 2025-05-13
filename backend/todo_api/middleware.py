from .cron import update_todo_statuses
class UpdateExpiredTodosMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    def __call__(self, request):
        # Run the task checker before processing the request
        if not request.path.startswith('/admin/'):  # Skip admin requests
            update_todo_statuses()
        response = self.get_response(request)
        return response 