'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Todo, CreateTodoPayload } from '@/types/todo';
import { todoApi } from '@/services/todoApi';
import { websocketService } from '@/services/websocketService';
import TodoForm from '@/components/TodoForm';
import TodoTabs from '@/components/TodoTabs';
import { Loader2, Mail, Plus } from 'lucide-react';

const DEBUG_MODE = false;

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastCheckRef = useRef<number>(0);
  const [showForm, setShowForm] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch todos from the REST API
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

  // Set up polling as fallback if WebSockets aren't available
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (!isConnected) {
      intervalId = setInterval(() => {
        if (!isConnected) {
          if (DEBUG_MODE) console.log("Polling for todo updates");
          fetchTodos();
        }
      }, 10000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchTodos, isConnected]);

  useEffect(() => {
    websocketService.connect();

    const connectUnsubscribe = websocketService.subscribe('connect', () => {
      setIsConnected(true);
      setIsLoading(false);
      setError(null); 
      

      websocketService.requestTodos();
    });

    const disconnectUnsubscribe = websocketService.subscribe('disconnect', () => {
      if (isConnected) {
        setIsConnected(false);
        fetchTodos();
      }
    });

    const todoListUnsubscribe = websocketService.subscribe('todo_list', (data) => {
      if (DEBUG_MODE) console.log('Received todo list:', data);
      if (Array.isArray(data.todos)) {
        setTodos(data.todos);
        setIsLoading(false);
      }
    });

    const todoCreateUnsubscribe = websocketService.subscribe('todo_create', (data) => {
      if (DEBUG_MODE) console.log('Todo created:', data);
      setTodos(prevTodos => {
        if (!Array.isArray(prevTodos)) return [data.todo];
        return [data.todo, ...prevTodos];
      });
    });

    const todoUpdateUnsubscribe = websocketService.subscribe('todo_update', (data) => {
      if (DEBUG_MODE) console.log('Todo updated:', data);
      setTodos(prevTodos => {
        if (!Array.isArray(prevTodos)) return [data.todo];
        return prevTodos.map(todo => 
          todo.id === data.todo.id ? data.todo : todo
        );
      });
    });

    const todoDeleteUnsubscribe = websocketService.subscribe('todo_delete', (data) => {
      if (DEBUG_MODE) console.log('Todo deleted:', data);
      setTodos(prevTodos => {
        if (!Array.isArray(prevTodos)) return [];
        return prevTodos.filter(todo => todo.id !== data.todo_id);
      });
    });

    const errorUnsubscribe = websocketService.subscribe('error', (data) => {
      console.error('WebSocket error:', data);
      
      if (!isConnected) {
        fetchTodos();
      }
    });

    return () => {
      connectUnsubscribe();
      disconnectUnsubscribe();
      todoListUnsubscribe();
      todoCreateUnsubscribe();
      todoUpdateUnsubscribe();
      todoDeleteUnsubscribe();
      errorUnsubscribe();
      websocketService.disconnect();
    };
  }, [fetchTodos, isConnected]);

  // Fetch todos on initial render
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCreateTodo = async (todoData: CreateTodoPayload) => {
    try {
      const newTodo = await todoApi.createTodo(todoData);
      console.log("Created todo:", newTodo);
      

      if (!isConnected) {
        setTodos(prevTodos => Array.isArray(prevTodos) ? [newTodo, ...prevTodos] : [newTodo]);
      }
      
      if (window.innerWidth < 1024) {
        setShowForm(false); 
      }
    } catch (error) {
      console.error('Failed to create todo:', error);
      throw error; 
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await todoApi.deleteTodo(id);

      if (!isConnected) {
        setTodos(prevTodos => {
          if (!Array.isArray(prevTodos)) return [];
          return prevTodos.filter(todo => todo.id !== id);
        });
      }
    } catch (error) {
      console.error(`Failed to delete todo with id ${id}:`, error);
    }
  };


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
          
          {/* Connection status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: isConnected ? 'var(--success)' : 'var(--error)',
              display: 'inline-block'
            }}></span>
            <span style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-tertiary)',
              display: 'inline-block',
              marginRight: '1rem'
            }}>
              {isConnected ? 'Real-time' : 'Periodic Updates'}
            </span>
            
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
          </div>
        </header>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row',
          height: 'calc(100% - 64px)',
          overflow: 'hidden'
        }}>

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
