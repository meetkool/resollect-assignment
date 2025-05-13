export type TodoStatus = 'ongoing' | 'success' | 'failure';

export interface Todo {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO timestamp
  status: TodoStatus;
  createdAt: string; // timestamp
  updatedAt: string; // timestamp
}

export interface CreateTodoPayload {
  title: string;
  description: string;
  deadline: string; // ISO timestamp
}

export interface UpdateTodoPayload {
  title?: string;
  description?: string;
  deadline?: string;
  status?: TodoStatus;
} 