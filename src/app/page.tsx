'use client';

import { useEffect, useState } from 'react';
import { Todo, CreateTodoPayload } from '@/types/todo';
import { todoApi } from '@/services/todoApi';
import { getAutoStatus } from '@/utils/todoUtils';
import TodoForm from '@/components/TodoForm';
import TodoTabs from '@/components/TodoTabs';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndUpdate = async () => {
      await fetchTodos();
      await forceCheckExpiredTasks();
    };
    
    fetchAndUpdate();
    
    const intervalId = setInterval(updateTaskStatuses, 10000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const forceCheckExpiredTasks = async () => {
    console.log("Force checking all tasks for expired status...");
    if (!Array.isArray(todos) || todos.length === 0) return;
    
    const now = new Date();
    const updatedTodos = [...todos];
    let hasChanges = false;
    
    for (let i = 0; i < updatedTodos.length; i++) {
      const todo = updatedTodos[i];
      const deadline = new Date(todo.deadline);
      
      if (deadline < now && todo.status === 'ongoing') {
        console.log(`Found expired task: ${todo.id}, marking as failure`);
        
        try {
          const updatedTodo = await todoApi.updateTodo(todo.id, { status: 'failure' });
          updatedTodos[i] = updatedTodo;
          hasChanges = true;
        } catch (error) {
          console.error(`Failed to update status for expired todo ${todo.id}:`, error);
        }
      }
    }
    
    if (hasChanges) {
      console.log("Updated expired tasks, refreshing state");
      setTodos(updatedTodos);
    }
  };

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await todoApi.getTodos();
      
      console.log("API response data:", data);
      
      if (Array.isArray(data)) {
        setTodos(data);
      } else {
        console.error('Expected array of todos but got:', data);
        setTodos([]);
        setError('Received invalid data format from API');
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      setError('Failed to load tasks. Please try refreshing the page.');
      setTodos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatuses = async () => {
    if (!Array.isArray(todos) || todos.length === 0) return;
    
    const updatedTodos = [...todos]; 
    let hasChanges = false;
    
    for (let i = 0; i < updatedTodos.length; i++) {
      const todo = updatedTodos[i];
      const autoStatus = getAutoStatus(todo);
      
      if (todo.status !== autoStatus) {
        console.log(`Updating todo ${todo.id} from ${todo.status} to ${autoStatus}`);
        
        try {
          const updatedTodo = await todoApi.updateTodo(todo.id, { status: autoStatus });
          updatedTodos[i] = updatedTodo; 
          hasChanges = true;
        } catch (error) {
          console.error(`Failed to update status for todo ${todo.id}:`, error);
        }
      }
    }
    
    if (hasChanges) {
      setTodos(updatedTodos);
    }
  };

  const handleCreateTodo = async (todoData: CreateTodoPayload) => {
    try {
      const newTodo = await todoApi.createTodo(todoData);
      console.log("Created todo:", newTodo);
      setTodos(prevTodos => Array.isArray(prevTodos) ? [newTodo, ...prevTodos] : [newTodo]);
    } catch (error) {
      console.error('Failed to create todo:', error);
      throw error; 
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await todoApi.deleteTodo(id);
      setTodos(prevTodos => {
        if (!Array.isArray(prevTodos)) return [];
        return prevTodos.filter(todo => todo.id !== id);
      });
    } catch (error) {
      console.error(`Failed to delete todo with id ${id}:`, error);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 16px' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>Smart Todo List</h1>
        <p style={{ color: '#4b5563', fontSize: '1.125rem' }}>
          Tasks automatically transition based on deadlines
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div>
          <TodoForm onSubmit={handleCreateTodo} />
        </div>
        
        <div>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <div style={{ 
                width: '3.5rem', 
                height: '3.5rem', 
                borderRadius: '9999px',
                borderTop: '2px solid #3b82f6',
                borderBottom: '2px solid #3b82f6',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : error ? (
            <div style={{ 
              backgroundColor: '#fee2e2', 
              color: '#dc2626', 
              padding: '1.25rem', 
              borderRadius: '0.75rem', 
              border: '1px solid #fecaca' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontWeight: '500' }}>{error}</span>
              </div>
            </div>
          ) : (
            <TodoTabs 
              todos={todos} 
              onUpdate={fetchTodos}
              onDelete={handleDeleteTodo} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
