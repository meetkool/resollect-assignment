import { Todo, TodoStatus } from '@/types/todo';
import { useState, useEffect, useMemo } from 'react';
import TodoItem from './TodoItem';
import { Search, Check, AlertTriangle, X, Inbox, Star, Mail, RefreshCw } from 'lucide-react';

// Set to false to disable excessive console logs (should match value in page.tsx)
const DEBUG_MODE = false;

interface TodoTabsProps {
  todos: Todo[];
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

type TabType = 'all' | 'important' | TodoStatus;

export default function TodoTabs({ todos, onUpdate, onDelete }: TodoTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('ongoing');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const todoArray = useMemo(() => Array.isArray(todos) ? todos : [], [todos]);
  
  useEffect(() => {
    const filtered = todoArray.filter(todo => {
      // Special case for important tab
      if (activeTab === 'important') {
        return todo.priority === 'high' && 
               (searchTerm === '' || 
                todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                todo.description.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      
      const matchesTab = activeTab === 'all' || todo.status === activeTab;
      const matchesSearch = searchTerm === '' || 
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
    setFilteredTodos(filtered);
  }, [todoArray, activeTab, searchTerm]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onUpdate();
    // Simulate a refresh delay for better UX
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const tabCounts = {
    all: todoArray.length,
    ongoing: todoArray.filter(todo => todo.status === 'ongoing').length,
    success: todoArray.filter(todo => todo.status === 'success').length,
    failure: todoArray.filter(todo => todo.status === 'failure').length,
    important: todoArray.filter(todo => todo.priority === 'high').length,
  };
  
  if (DEBUG_MODE) {
    console.log("Current todo counts:", { 
      all: tabCounts.all,
      ongoing: tabCounts.ongoing,
      success: tabCounts.success,
      failure: tabCounts.failure,
      important: tabCounts.important,
      todosWithExpiredDeadline: todoArray.filter(todo => new Date(todo.deadline) < new Date()).length,
      statusCounts: todoArray.reduce((counts, todo) => {
        counts[todo.status] = (counts[todo.status] || 0) + 1;
        return counts;
      }, {} as Record<string, number>)
    });
  }
  
  return (
    <div className="space-y-6" style={{ backgroundColor: 'var(--background)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
      <div style={{ padding: '1.5rem 1.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Ongoing</h2>
          <button 
            onClick={handleRefresh}
            className="secondary"
            style={{ 
              padding: '0.5rem',
              borderRadius: '50%',
              width: '2.25rem',
              height: '2.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isRefreshing ? 'var(--secondary)' : 'transparent'
            }}
          >
            <RefreshCw 
              size={18} 
              className={isRefreshing ? 'animate-spin' : ''} 
              style={{ color: 'var(--text-secondary)' }}
            />
          </button>
        </div>
      
        <div className="search-container">
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', width: '1rem', height: '1rem' }} />
          <input
            type="text"
            placeholder="Search in tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ width: '100%', padding: '0.625rem 2.5rem 0.625rem 2.5rem' }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
              style={{ 
                position: 'absolute', 
                right: '0.5rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: '0.25rem',
                cursor: 'pointer',
                color: 'var(--text-tertiary)'
              }}
            >
              <X style={{ width: '1rem', height: '1rem' }} />
            </button>
          )}
        </div>
        
        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'ongoing' ? 'active' : ''}`}
            onClick={() => setActiveTab('ongoing')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Inbox style={{ width: '1rem', height: '1rem' }} />
              <span>Ongoing</span>
              <span className="badge badge-primary" style={{ marginLeft: '0.25rem' }}>
                {tabCounts.ongoing}
              </span>
            </div>
          </div>
          
          <div 
            className={`tab ${activeTab === 'important' ? 'active' : ''}`}
            onClick={() => setActiveTab('important')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star style={{ width: '1rem', height: '1rem' }} />
              <span>Important</span>
              <span className="badge badge-warning" style={{ marginLeft: '0.25rem', backgroundColor: 'var(--important-light)', color: 'var(--important)' }}>
                {tabCounts.important}
              </span>
            </div>
          </div>
          
          <div 
            className={`tab ${activeTab === 'success' ? 'active' : ''}`}
            onClick={() => setActiveTab('success')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check style={{ width: '1rem', height: '1rem' }} />
              <span>Completed</span>
              <span className="badge badge-success" style={{ marginLeft: '0.25rem' }}>
                {tabCounts.success}
              </span>
            </div>
          </div>
          
          <div 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail style={{ width: '1rem', height: '1rem' }} />
              <span>All tasks</span>
              <span className="badge" style={{ marginLeft: '0.25rem', backgroundColor: 'var(--secondary)', color: 'var(--text-secondary)' }}>
                {tabCounts.all}
              </span>
            </div>
          </div>
          
          <div 
            className={`tab ${activeTab === 'failure' ? 'active' : ''}`}
            onClick={() => setActiveTab('failure')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle style={{ width: '1rem', height: '1rem' }} />
              <span>Failed</span>
              <span className="badge badge-error" style={{ marginLeft: '0.25rem' }}>
                {tabCounts.failure}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ padding: '0' }}>
        {renderTodoList()}
      </div>
    </div>
  );
  
  function renderTodoList() {
    if (filteredTodos.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 1rem',
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--background-alt)',
          borderBottom: '1px solid var(--border)'
        }}>
          {searchTerm ? (
            <>
              <Search style={{ margin: '0 auto 1rem', width: '2rem', height: '2rem', color: 'var(--text-tertiary)' }} />
              <p style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>No tasks match your search</p>
              <p style={{ marginBottom: '1.25rem' }}>Try adjusting your search or filter criteria</p>
              <button
                onClick={() => setSearchTerm('')}
                className="secondary"
                style={{ padding: '0.5rem 1.25rem' }}
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <Inbox style={{ margin: '0 auto 1rem', width: '2rem', height: '2rem', color: 'var(--text-tertiary)' }} />
              <p style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>No tasks found in this category</p>
              <p>Add a new task to see it in this folder</p>
            </>
          )}
        </div>
      );
    }
    
    return (
      <div>
        {filteredTodos.map(todo => (
          <TodoItem 
            key={todo.id} 
            todo={todo} 
            onUpdate={onUpdate}
            onDelete={() => onDelete(todo.id)}
          />
        ))}
      </div>
    );
  }
} 