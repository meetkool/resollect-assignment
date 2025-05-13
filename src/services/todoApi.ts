import { CreateTodoPayload, Todo, UpdateTodoPayload } from '@/types/todo';
// Use the Django backend instead of the local mock API
const API_URL = 'http://localhost:8000/api';
// Interface for paginated response from Django REST Framework
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
export const todoApi = {
  async getTodos(): Promise<Todo[]> {
    // Add no_page=true to get unpaginated results
    const response = await fetch(`${API_URL}/todos/?no_page=true`);
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }
    const data = await response.json();
    // Handle both array responses and paginated responses
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object' && 'results' in data) {
      // This is a paginated response from Django REST Framework
      return (data as PaginatedResponse<Todo>).results;
    } else {
      console.error('Unexpected response format:', data);
      return []; // Return empty array as fallback
    }
  },
  async getTodo(id: string): Promise<Todo> {
    const response = await fetch(`${API_URL}/todos/${id}/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch todo with id ${id}`);
    }
    return response.json();
  },
  async createTodo(todo: CreateTodoPayload): Promise<Todo> {
    const response = await fetch(`${API_URL}/todos/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      throw new Error('Failed to create todo');
    }
    return response.json();
  },
  async updateTodo(id: string, todo: UpdateTodoPayload): Promise<Todo> {
    const response = await fetch(`${API_URL}/todos/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      throw new Error(`Failed to update todo with id ${id}`);
    }
    return response.json();
  },
  async deleteTodo(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/todos/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete todo with id ${id}`);
    }
  },
  async markTodoComplete(id: string): Promise<Todo> {
    const response = await fetch(`${API_URL}/todos/${id}/mark_complete/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to mark todo with id ${id} as complete`);
    }
    return response.json();
  },
}; 