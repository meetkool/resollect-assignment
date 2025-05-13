import { Todo } from '@/types/todo';
import { formatDeadline, getTimeRemainingText } from '@/utils/todoUtils';
import { useState } from 'react';
import { todoApi } from '@/services/todoApi';

// Set to false to disable excessive console logs
const DEBUG_MODE = false;

interface TodoItemProps {
  todo: Todo;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (DEBUG_MODE) {
    console.log(`TodoItem: ${todo.id}, title: ${todo.title}, status: ${todo.status}, deadline: ${todo.deadline}, isExpired: ${new Date(todo.deadline) < new Date()}`);
  }

  const handleMarkComplete = async () => {
    if (todo.status === 'success') return;
    try {
      setIsLoading(true);
      await todoApi.markTodoComplete(todo.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to mark todo as complete:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await todoApi.deleteTodo(todo.id);
      onDelete();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (todo.status) {
      case 'success':
        return (
          <span className="badge badge-green">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '12px', height: '12px', marginRight: '4px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Completed
          </span>
        );
      case 'failure':
        return (
          <span className="badge badge-red">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '12px', height: '12px', marginRight: '4px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Failed
          </span>
        );
      default:
        return (
          <span className="badge badge-blue">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '12px', height: '12px', marginRight: '4px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ongoing
          </span>
        );
    }
  };

  const getPriorityBadge = () => {
    const priorityColors = {
      low: { bg: '#f3f4f6', text: '#4b5563' },
      medium: { bg: '#fef3c7', text: '#d97706' },
      high: { bg: '#fee2e2', text: '#dc2626' }
    };
    
    return (
      <span style={{ 
        backgroundColor: priorityColors[todo.priority]?.bg || '#f3f4f6',
        color: priorityColors[todo.priority]?.text || '#4b5563',
        fontSize: '0.675rem',
        fontWeight: '600',
        padding: '0.125rem 0.5rem',
        borderRadius: '9999px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {todo.priority}
      </span>
    );
  };

  return (
    <div style={{ 
      padding: '1.25rem',
      border: '1px solid',
      borderColor: todo.status === 'success' ? '#bbf7d0' : 
                  todo.status === 'failure' ? '#fecaca' : '#dbeafe',
      backgroundColor: todo.status === 'success' ? '#f0fdf4' : 
                      todo.status === 'failure' ? '#fef2f2' : '#ffffff',
      borderRadius: '0.75rem',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ flex: '1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontWeight: '600', fontSize: '1.125rem' }}>{todo.title}</h3>
            {getStatusBadge()}
            {getPriorityBadge()}
          </div>
          
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <span style={{ color: '#6b7280', display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '6px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
              </svg>
              {formatDeadline(todo.deadline)}
            </span>
            <span style={{ 
              color: todo.status === 'success' ? '#16a34a' : 
                    new Date(todo.deadline) < new Date() ? '#dc2626' : '#2563eb',
              fontWeight: '500', 
              display: 'flex', 
              alignItems: 'center'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '6px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {getTimeRemainingText(todo.deadline)}
            </span>
          </div>
          
          {/* Display tags if they exist */}
          {todo.tags && todo.tags.length > 0 && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {todo.tags.map((tag, index) => (
                <span 
                  key={index}
                  style={{ 
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '10px', height: '10px', marginRight: '4px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {todo.description && (
            <div style={{ marginTop: '0.75rem' }}>
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                style={{ 
                  fontSize: '0.875rem',
                  color: '#4b5563',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  padding: '0'
                }}
              >
                {isExpanded ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '6px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg>
                    Hide details
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '6px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                    Show details
                  </>
                )}
              </button>
              {isExpanded && (
                <p style={{ 
                  color: '#4b5563', 
                  marginTop: '0.75rem', 
                  fontSize: '0.875rem', 
                  backgroundColor: '#f9fafb', 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem',
                  border: '1px solid #f3f4f6'
                }}>
                  {todo.description}
                </p>
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {todo.status !== 'success' && todo.status !== 'failure' && (
            <button
              onClick={handleMarkComplete}
              disabled={isLoading}
              style={{ 
                backgroundColor: '#16a34a',
                color: 'white',
                borderRadius: '0.375rem',
                padding: '0.375rem 0.75rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '4px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Complete
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isLoading}
            style={{ 
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '0.375rem',
              padding: '0.375rem 0.75rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '4px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 