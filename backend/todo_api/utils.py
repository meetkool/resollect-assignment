from rest_framework.response import Response
from rest_framework import status
import functools

def create_response(data=None, message="", success=True, status_code=status.HTTP_200_OK):
    """
    Creates a standardized API response
    
    Args:
        data: The data to return (can be None)
        message: A message describing the result
        success: Whether the operation was successful
        status_code: The HTTP status code to return
        
    Returns:
        Response object with standardized format
    """
    return Response(
        {
            'status': 'success' if success else 'error',
            'message': message,
            'data': data
        },
        status=status_code
    )

def success_response(data=None, message="Operation successful", status_code=status.HTTP_200_OK):
    """
    Creates a standardized success response
    
    Args:
        data: The data to return (can be None)
        message: A success message
        status_code: The HTTP status code to return
        
    Returns:
        Response object with standardized success format
    """
    return create_response(data, message, True, status_code)

def error_response(message="An error occurred", data=None, status_code=status.HTTP_400_BAD_REQUEST):
    """
    Creates a standardized error response
    
    Args:
        message: An error message
        data: The error data to return (can be None)
        status_code: The HTTP status code to return
        
    Returns:
        Response object with standardized error format
    """
    return create_response(data, message, False, status_code)

def handle_exception(func):
    """
    Decorator to handle exceptions in API views
    Catches exceptions and returns standardized error responses
    
    Args:
        func: The function to wrap
        
    Returns:
        Wrapped function with exception handling
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            return error_response(str(e))
    return wrapper 