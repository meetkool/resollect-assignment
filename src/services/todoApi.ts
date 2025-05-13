import { CreateTodoPayload, Todo, UpdateTodoPayload } from '@/types/todo';

// During development, always use the relative API URL path
// This will work with Next.js API rewrites
// const API_URL = 'http://localhost:8000/api';

const API_URL = 'https://resollect-assignment-254j.onrender.com/api';

console.log('Using API URL:', API_URL);

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
export const todoApi = {
  async getTodos(): Promise<Todo[]> {
    // Add no_page=true to get unpaginated results
    const response = await fetch(`${API_URL}/todos/?no_page=true`, {
      mode: 'cors',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }
    const data = await response.json();
    console.log('Todo data received:', data);
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object' && 'results' in data) {
      return (data as PaginatedResponse<Todo>).results;
    } else {
      console.error('Unexpected response format:', data);
      return []; 
    }
  },
  async getTodo(id: string): Promise<Todo> {
    const response = await fetch(`${API_URL}/todos/${id}/`, {
      mode: 'cors',
      credentials: 'omit',
    });
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
      mode: 'cors',
      credentials: 'omit',
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
      mode: 'cors',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new Error(`Failed to update todo with id ${id}`);
    }
    return response.json();
  },
  async deleteTodo(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/todos/${id}/`, {
      method: 'DELETE',
      mode: 'cors',
      credentials: 'omit',
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
      mode: 'cors',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new Error(`Failed to mark todo with id ${id} as complete`);
    }
    return response.json();
  },
}; 