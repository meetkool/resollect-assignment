# Todo API Documentation

This document provides an overview of the Todo API and instructions for using the Postman collection.

## API Overview

The Todo API provides endpoints for managing todo items. It supports the following operations:

- List all todos
- Get a specific todo by ID
- Create a new todo
- Update an existing todo
- Delete a todo
- Mark a todo as complete
- Filter todos by status (ongoing, success, failure)

## Base URL

The API is accessible at `http://localhost:8000/api/`

## Using the Postman Collection

### Setup

1. Download and install [Postman](https://www.postman.com/downloads/)
2. Import the collection:
   - Open Postman
   - Click "Import" in the top left
   - Select the `postman_collection.json` file
3. Import the environment:
   - Click "Import" again
   - Select the `postman_environment.json` file
4. Select the environment:
   - In the top right corner, select "Todo API - Local" from the environment dropdown

### Available Endpoints

#### Get All Todos

- Endpoint: `GET /todos/`
- Query parameters:
  - `no_page=true` - Disable pagination and get all results

#### Get Todo by ID

- Endpoint: `GET /todos/{id}/`
- Path parameters:
  - `id` - The UUID of the todo item

#### Create Todo

- Endpoint: `POST /todos/`
- Body (JSON):
  ```json
  {
    "title": "Task title",
    "description": "Task description",
    "deadline": "2024-12-31T23:59:59Z"
  }
  ```

#### Update Todo

- Endpoint: `PATCH /todos/{id}/`
- Path parameters:
  - `id` - The UUID of the todo item
- Body (JSON) - Include only the fields you want to update:
  ```json
  {
    "title": "Updated title",
    "description": "Updated description",
    "status": "ongoing"
  }
  ```

#### Delete Todo

- Endpoint: `DELETE /todos/{id}/`
- Path parameters:
  - `id` - The UUID of the todo item

#### Mark Todo as Complete

- Endpoint: `PATCH /todos/{id}/mark_complete/`
- Path parameters:
  - `id` - The UUID of the todo item

#### Get Todos by Status

- Ongoing todos: `GET /todos/ongoing/`
- Completed todos: `GET /todos/success/`
- Failed todos: `GET /todos/failure/`

## Data Model

### Todo

```json
{
  "id": "uuid-string",
  "title": "Task title",
  "description": "Task description",
  "deadline": "2024-05-25T12:00:00Z",
  "status": "ongoing|success|failure",
  "createdAt": "2024-05-24T10:00:00Z",
  "updatedAt": "2024-05-24T11:00:00Z"
}
```

### Status Values

- `ongoing` - Task is still active and not past deadline
- `success` - Task has been marked as complete
- `failure` - Task has passed its deadline without being completed 