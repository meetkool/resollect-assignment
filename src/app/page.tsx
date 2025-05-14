'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Todo, CreateTodoPayload } from '@/types/todo';
import { todoApi } from '@/services/todoApi';
import TodoForm from '@/components/TodoForm';
import TodoTabs from '@/components/TodoTabs';
import { Loader2, Mail, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Set to false to disable excessive console logs
const DEBUG_MODE = false;

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastCheckRef = useRef<number>(0);
  const [showForm, setShowForm] = useState(false);

  const fetchTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await todoApi.getTodos();
      
      if (DEBUG_MODE) console.log("API response data:", data);
      
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
  }, []);

  const forceCheckExpiredTasks = useCallback(async () => {
    // Only check expired tasks if it's been at least 30 seconds since the last check
    const now = Date.now();
    if (now - lastCheckRef.current < 30000) return;
    
    if (DEBUG_MODE) console.log("Force checking all tasks for expired status...");
    if (!Array.isArray(todos) || todos.length === 0) return;
    
    lastCheckRef.current = now;
    const currentDate = new Date();
    const updatedTodos = [...todos];
    let hasChanges = false;
    
    for (let i = 0; i < updatedTodos.length; i++) {
      const todo = updatedTodos[i];
      const deadline = new Date(todo.deadline);
      
      if (deadline < currentDate && todo.status === 'ongoing') {
        if (DEBUG_MODE) console.log(`Found expired task: ${todo.id}, marking as failure`);
        
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
      if (DEBUG_MODE) console.log("Updated expired tasks, refreshing state");
      setTodos(updatedTodos);
    }
  }, [todos]);

  useEffect(() => {
    // Only fetch on initial render, not on every render
    fetchTodos();
    
    // Set up a reasonable polling interval (every 60 seconds)
    // to periodically update task statuses
    const intervalId = setInterval(fetchTodos, 60000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchTodos]); // Add fetchTodos as a dependency since it's used in useEffect

  // Run forceCheckExpiredTasks in a separate useEffect that depends on todos.length
  useEffect(() => {
    if (todos.length > 0) {
      forceCheckExpiredTasks();
    }
  }, [todos.length, forceCheckExpiredTasks]);

  const handleCreateTodo = async (todoData: CreateTodoPayload) => {
    try {
      const newTodo = await todoApi.createTodo(todoData);
      console.log("Created todo:", newTodo);
      setTodos(prevTodos => Array.isArray(prevTodos) ? [newTodo, ...prevTodos] : [newTodo]);
      if (window.innerWidth < 1024) {
        setShowForm(false); // Close form after submitting on mobile
      }
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

  // Toggle form visibility on mobile
  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen" style={{ maxWidth: '1400px' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 100px)',
        backgroundColor: 'var(--background)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden'
      }}>
        <header style={{ 
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--background)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Mail size={24} style={{ color: 'var(--primary)' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>Task Manager</h1>
          </div>
          
          {/* Mobile "Compose" button */}
          <button
            onClick={toggleForm}
            className="lg:hidden"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--primary-light)', 
              color: 'var(--primary)',
              borderRadius: '50%',
              padding: '0.5rem',
              width: '2.5rem',
              height: '2.5rem'
            }}
          >
            <Plus size={18} />
          </button>
        </header>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row',
          height: 'calc(100% - 64px)',
          overflow: 'hidden'
        }}>
          {/* Sidebar with form */}
          <div 
            className={`${showForm ? 'block' : 'hidden'} lg:block`}
            style={{ 
              width: '100%', 
              maxWidth: '400px',
              borderRight: '1px solid var(--border)',
              overflowY: 'auto',
              backgroundColor: 'var(--background-alt)',
              height: '100%',
              padding: '1.5rem'
            }}
          >
            <TodoForm onSubmit={handleCreateTodo} />
          </div>
          
          {/* Main content area */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            height: '100%'
          }}>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <div style={{ animation: 'spin 1s linear infinite' }}>
                  <Loader2 style={{ width: '40px', height: '40px', color: 'var(--primary)' }} />
                </div>
              </div>
            ) : error ? (
              <div style={{ 
                padding: '1rem', 
                margin: '1rem',
                backgroundColor: 'var(--error-light)', 
                color: 'var(--error)', 
                borderRadius: 'var(--radius)' 
              }}>
                {error}
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
    </div>
  );
}
