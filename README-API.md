## Backend Architecture Overview

The backend of your Smart Todo List application is built with Django and Django REST Framework (DRF), providing a robust API for the frontend to consume. Here's a comprehensive explanation of the backend architecture:

### Core Technologies

1. **Django (5.2.1)**: The main web framework providing the foundation, URL routing, and database ORM
2. **Django REST Framework (3.16.0)**: Builds upon Django to create RESTful APIs with serialization, authentication, and viewsets
3. **PostgreSQL**: The database system (configured via dj-database-url)
4. **Gunicorn (21.2.0)**: WSGI HTTP server for production deployment

### Application Structure

The backend follows a typical Django project structure:

```
backend/
├── backend/             # Project settings folder
│   ├── __init__.py
│   ├── settings.py      # Main settings configuration
│   ├── urls.py          # Top-level URL routing
│   └── wsgi.py          # WSGI application entry point
│
├── todo_api/            # Main application folder
│   ├── migrations/      # Database migrations
│   ├── management/      # Custom management commands
│   │   └── commands/
│   │       └── update_todo_statuses.py  # Automatic status updater
│   ├── models.py        # Todo data model definition
│   ├── serializers.py   # Data serialization/deserialization
│   ├── views.py         # API endpoint implementations
│   ├── urls.py          # API URL routing
│   └── tests.py         # Unit tests
│
└── manage.py            # Django command-line utility
```

### Data Models

The core data model is the `Todo` model, which includes:

- **id**: UUID primary key
- **title**: Task name (required)
- **description**: Detailed task description
- **deadline**: Target completion date/time
- **status**: Current state (ongoing, success, failure)
- **priority**: Importance level (low, medium, high)
- **tags**: Array of string labels for categorization
- **createdAt/updatedAt**: Timestamps for tracking changes

### API Endpoints

The backend exposes several RESTful endpoints for interacting with todos:

#### Todo Management
- `GET /api/todos/`: List all todos with optional pagination
- `POST /api/todos/`: Create a new todo
- `GET /api/todos/{id}/`: Retrieve a specific todo
- `PATCH /api/todos/{id}/`: Update a todo
- `DELETE /api/todos/{id}/`: Delete a todo
- `PATCH /api/todos/{id}/mark_complete/`: Special endpoint to mark completion

#### Filtering and Sorting
- `GET /api/todos/filter/`: Filter todos by priority and tags
- `GET /api/todos/ongoing/`: Get only ongoing tasks
- `GET /api/todos/success/`: Get completed tasks
- `GET /api/todos/failure/`: Get failed tasks
- `GET /api/todos/tags/`: Get all unique tags

#### Analytics
- `GET /api/analytics/completion-stats/`: Task completion statistics
- `GET /api/analytics/productivity-patterns/`: Insights on productivity
- `GET /api/analytics/duration-analysis/`: Task duration analysis
- `GET /api/analytics/priority-breakdown/`: Analysis by priority
- `GET /api/analytics/tags-usage/`: Statistics on tag usage

### Key Features Implemented

1. **Automated Status Transitions**: Custom management command (`update_todo_statuses`) to automatically transition tasks from "ongoing" to "failure" when deadlines pass
2. **Priority System**: Tasks can be assigned low, medium, or high priority
3. **Custom Tags**: Flexible tag system for categorizing todos
4. **Rich Filtering**: API endpoints support filtering by various criteria
5. **Analytics Engine**: Backend calculates various metrics about task completion and productivity

### Authentication and Security

The API uses Django's security features and DRF authentication mechanisms:

- CORS headers for secure cross-origin requests
- Token or session-based authentication
- Permission classes to control access
- Django's built-in security protections

### Scheduled Tasks

The application uses django-crontab to run periodic tasks:

- `update_todo_statuses`: Runs regularly to check deadlines and update task statuses

### Containerization

The backend is containerized using Docker:

- **Dockerfile**: Defines the environment, dependencies, and runtime configuration
- **docker-compose.yml**: Orchestrates the backend service
- **.dockerignore**: Optimizes the Docker build by excluding unnecessary files

This containerization makes deployment consistent across different environments and simplifies the deployment process.

### Environment Configuration

The application uses django-environ for flexible configuration:

- Environment variables for sensitive settings (SECRET_KEY, DATABASE_URL)
- Different configurations for development/production
- Database connection parameters via DATABASE_URL

### Database

While the development environment uses SQLite, the production setup is configured for PostgreSQL:

- ORM-based models make database operations straightforward
- Migrations track schema changes
- Indexes are used for performance optimization

This comprehensive backend architecture provides a solid foundation for the Todo application, with robust API endpoints, automated status management, and detailed analytics capabilities to enhance productivity tracking.
