import { CreateTodoPayload } from '@/types/todo';
import { useState } from 'react';

interface TodoFormProps {
  onSubmit: (todo: CreateTodoPayload) => Promise<void>;
}

export default function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!deadline) {
      setError('Deadline is required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        deadline: new Date(deadline).toISOString(),
      });
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDeadline('');
    } catch (error) {
      console.error('Failed to create todo:', error);
      setError('Failed to create todo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card bg-white shadow-lg border-t-4 border-t-primary" style={{ padding: '1.5rem' }}>
      <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px', marginRight: '8px', color: '#3b82f6' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add New Task
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && (
          <div style={{ padding: '0.875rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '0.5rem', border: '1px solid #fecaca', display: 'flex', alignItems: 'flex-start' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px', marginRight: '8px', flexShrink: 0, marginTop: '2px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}
        
        {showSuccess && (
          <div style={{ padding: '0.875rem', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '0.5rem', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'flex-start' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px', marginRight: '8px', flexShrink: 0, marginTop: '2px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Task added successfully!
          </div>
        )}
        
        <div>
          <label htmlFor="title" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.375rem' }}>
            Title <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}
            placeholder="What needs to be done?"
          />
        </div>
        
        <div>
          <label htmlFor="description" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.375rem' }}>
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}
            placeholder="Add more details about this task"
            rows={3}
          />
        </div>
        
        <div>
          <label htmlFor="deadline" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.375rem' }}>
            Deadline <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="datetime-local"
            id="deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          style={{ 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            padding: '0.625rem', 
            borderRadius: '0.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.5rem',
            fontWeight: '500',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {isLoading ? (
            <>
              <svg style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: '0.25' }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: '0.75' }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Task
            </>
          )}
        </button>
      </form>
    </div>
  );
} 