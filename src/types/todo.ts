export type TodoStatus = 'ongoing' | 'success' | 'failure';
export type TodoPriority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  description: string;
  deadline: string; 
  status: TodoStatus;
  priority: TodoPriority;
  tags: string[];
  createdAt: string; 
  updatedAt: string; 
}

export interface CreateTodoPayload {
  title: string;
  description: string;
  deadline: string;
  priority: TodoPriority;
  tags: string[];
}

export interface UpdateTodoPayload {
  title?: string;
  description?: string;
  deadline?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
} 