# Smart Todo List App

A dynamic, full-stack todo list application with time-based task management, analytics, and productivity insights.

## live links 
1. backend links :- https://resollect-assignment-254j.onrender.com
2.  

## Features

### Todo Management
- **Create, Update, Delete Tasks**: Full CRUD functionality
- **Mark Tasks Complete**: Easily track completed tasks
- **Automatic Status Transitions**:
  - **Ongoing**: Tasks before their deadline
  - **Success**: Tasks marked complete before deadline
  - **Failure**: Tasks past deadline without completion
- **Priority Levels**: Assign Low, Medium, or High priority to tasks
- **Custom Tags**: Add custom tags to categorize and organize tasks
- **Real-time Status Updates**: Status updates automatically based on deadlines
- **Responsive Design**: Works on mobile and desktop devices

### Advanced Analytics
- **Completion Rate Tracking**: Weekly trends of task completion rates
- **Status Distribution**: Visual breakdown of task statuses (ongoing, success, failure)
- **Productivity Patterns**: Analysis of when tasks are created throughout the day
- **Task Duration Analysis**: Insights into planned vs. actual task duration
- **Performance Metrics**: Success rate, total tasks, average completion time

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Chart.js**: Interactive data visualization

### Backend
- **Django**: Python web framework
- **Django REST Framework**: For building the API
- **Postgress**: Database (can be replaced with PostgreSQL for production)

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

## Application Structure

### Main Views
- **Todo List**: Main interface for managing tasks
- **Analytics Dashboard**: Data-driven insights about task performance

### Analytics Components
- **Completion Rate Chart**: Weekly trends of task completion
- **Status Distribution Chart**: Breakdown of task statuses
- **Productivity By Hour Chart**: When tasks are created throughout the day
- **Task Duration Chart**: Analysis of task duration and performance

## API Endpoints

### Todo Management
- `GET /api/todos/` - List all todos
- `POST /api/todos/` - Create a new todo
- `GET /api/todos/{id}/` - Get a specific todo
- `PATCH /api/todos/{id}/` - Update a todo
- `DELETE /api/todos/{id}/` - Delete a todo
- `PATCH /api/todos/{id}/mark_complete/` - Mark a todo as complete
- `GET /api/todos/ongoing/` - Get all ongoing todos
- `GET /api/todos/success/` - Get all completed todos
- `GET /api/todos/failure/` - Get all failed todos

### Priority and Tags
- `GET /api/todos/filter/` - Filter todos by priority (low, medium, high)
- `GET /api/todos/tags/` - Get all unique tags used in todos
- `POST /api/todos/{id}/tags/` - Add tags to an existing todo

### Analytics
- `GET /api/analytics/completion-stats/` - Get task completion statistics
- `GET /api/analytics/productivity-patterns/` - Get productivity pattern data
- `GET /api/analytics/duration-analysis/` - Get task duration analysis
- `GET /api/analytics/priority-breakdown/` - Get tasks breakdown by priority
- `GET /api/analytics/tags-usage/` - Get statistics on tag usage

## Task Data Structure

Each task contains the following information:

- **Title**: Name of the task
- **Description**: Optional detailed description
- **Deadline**: Date and time by which the task should be completed
- **Status**: Ongoing, Success, or Failure
- **Priority**: Low, Medium, or High importance level
- **Tags**: Custom labels to categorize tasks (e.g., "work", "personal", "urgent")
- **Created/Updated Timestamps**: When the task was created and last modified

### Priority Values
```json
{
  "priority": "low" | "medium" | "high"
}
```

### Tags Format
```json
{
  "tags": ["work", "urgent", "project", "meeting", "personal"]
}
```

## Analytics Data Structure

The analytics feature provides the following data:

- **Status Distribution**: Count of tasks in each status category
- **Weekly Completion Rate**: Percentage of tasks completed successfully by week
- **Productivity Patterns**: Distribution of task creation by hour of day
- **Task Duration Analysis**: Breakdown of task duration and completion success rate


## File Structure

```
resollect-assignment/
├── backend/                   # Django backend
│   ├── todo_api/              # Main Django app
│   │   ├── migrations/        # Database migrations
│   │   ├── management/        # Custom management commands
│   │   │   └── commands/
│   │   │       └── update_todo_statuses.py
│   │   ├── models.py          # Data models
│   │   ├── serializers.py     # API serializers
│   │   ├── views.py           # API views
│   │   ├── urls.py            # API routing
│   │   └── tests.py           # Unit tests
│   ├── todo_project/          # Django project settings
│   │   ├── settings.py        # Project configuration
│   │   ├── urls.py            # URL routing
│   │   └── wsgi.py            # WSGI config
│   ├── .env                   # Environment variables
│   ├── db.sqlite3             # Development database
│   ├── manage.py              # Django CLI
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile             # Docker configuration
│   └── docker-compose.yml     # Docker Compose config
│
├── src/                       # Next.js frontend
│   ├── app/                   # Application pages
│   │   ├── page.tsx           # Homepage (Todo list)
│   │   ├── analytics/         # Analytics dashboard
│   │   │   └── page.tsx       # Analytics page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # React components
│   │   ├── TodoItem.tsx       # Todo item component
│   │   ├── TodoForm.tsx       # Todo creation form
│   │   ├── TodoTabs.tsx       # Todo status tabs
│   │   ├── Navbar.tsx         # Navigation bar
│   │   ├── LoadingSpinner.tsx # Loading indicator
│   │   ├── analytics/         # Analytics components
│   │   │   ├── CompletionRateChart.tsx
│   │   │   ├── StatusDistributionChart.tsx
│   │   │   ├── ProductivityByHourChart.tsx
│   │   │   └── TaskDurationChart.tsx
│   │   └── ui/                # UI components
│   │
│   ├── services/              # API services
│   │   ├── todoApi.ts         # Todo API client
│   │   └── analyticsApi.ts    # Analytics API client
│   │
│   ├── types/                 # TypeScript type definitions
│   │   ├── todo.ts            # Todo types
│   │   └── analytics.ts       # Analytics types
│   │
│   └── utils/                 # Utility functions
│
├── public/                    # Static assets
├── node_modules/              # Node.js dependencies
├── package.json               # Node.js package config
├── tsconfig.json              # TypeScript config
├── tailwind.config.js         # Tailwind CSS config
├── next.config.js             # Next.js config
├── postman_collection.json    # Postman API collection
├── README.md                  # Project documentation
└── README-API.md              # API documentation
```
