# Smart Todo List App

A dynamic, full-stack todo list application with time-based automated task categorization.

## Features

- **Create, Update, Delete Tasks**: Full CRUD functionality for managing tasks
- **Mark Tasks Complete**: Easily mark tasks as complete
- **Automatic Status Transitions**:
  - **Ongoing**: Tasks before their deadline
  - **Success**: Tasks marked complete before deadline
  - **Failure**: Tasks past deadline without completion
- **Real-time Status Updates**: Status updates automatically based on deadlines
- **Responsive Design**: Works on mobile and desktop devices

## Tech Stack

### Frontend
- **Next.js**: React framework for building the UI
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework

### Backend
- **Django**: Python web framework
- **Django REST Framework**: For building the API
- **SQLite**: Database (can be replaced with PostgreSQL for production)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Python (v3.9+ recommended)
- npm or yarn

### Installation

#### Frontend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### Running the Status Update Task
To update task statuses automatically based on deadlines:

```bash
python manage.py update_todo_statuses
```

You can set this up as a cron job or scheduled task to run periodically.

## API Endpoints

- `GET /api/todos/` - List all todos
- `POST /api/todos/` - Create a new todo
- `GET /api/todos/{id}/` - Get a specific todo
- `PATCH /api/todos/{id}/` - Update a todo
- `DELETE /api/todos/{id}/` - Delete a todo
- `PATCH /api/todos/{id}/mark_complete/` - Mark a todo as complete
- `GET /api/todos/ongoing/` - Get all ongoing todos
- `GET /api/todos/success/` - Get all completed todos
- `GET /api/todos/failure/` - Get all failed todos

## License

MIT

## Author

Created as an assignment for Resollect.

For queries reach out to: soumaya@resollect.com
