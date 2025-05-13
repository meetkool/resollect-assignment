export type TodoStatus = 'ongoing' | 'success' | 'failure';
export interface Todo {
  id: string;
  title: string;
  description: string;
  deadline: string; 
  status: TodoStatus;
  createdAt: string; 
  updatedAt: string; 
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