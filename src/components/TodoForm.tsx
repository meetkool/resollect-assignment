import { CreateTodoPayload, TodoPriority } from '@/types/todo';
import { useState } from 'react';
import { PlusCircle, Tag, X, Check, Paperclip, Clock } from "lucide-react";

interface TodoFormProps {
  onSubmit: (todo: CreateTodoPayload) => Promise<void>;
}

export default function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Subject is required');
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
        priority,
        tags,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setTitle('');
      setDescription('');
      setDeadline('');
      setPriority('medium');
      setTags([]);
      setTagInput('');
    } catch (error) {
      console.error('Failed to create todo:', error);
      setError('Failed to create task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return 'var(--urgent)';
      case 'medium':
        return 'var(--important)';
      case 'low':
        return 'var(--personal)';
      default:
        return 'var(--text-secondary)';
    }
  };

  return (
    <div className="compose-email">
      <div style={{ 
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        backgroundColor: 'var(--background)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.25rem' }}>
            {error && (
              <div style={{ 
                backgroundColor: 'var(--error-light)', 
                color: 'var(--error)', 
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                marginBottom: '1rem'
              }}>
                {error}
              </div>
            )}
            
            {showSuccess && (
              <div style={{ 
                backgroundColor: 'var(--success-light)', 
                color: 'var(--success)', 
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Check style={{ width: '16px', height: '16px' }} />
                <span>Task created and added to your inbox!</span>
              </div>
            )}
            
            <div style={{ marginBottom: '1rem' }}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                style={{ 
                  width: '100%',
                  border: 'none', 
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '1rem',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--border)'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description and details..."
                rows={6}
                style={{ 
                  width: '100%',
                  border: 'none', 
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '0.875rem',
                  padding: '0.5rem 0',
                  resize: 'none',
                  minHeight: '120px'
                }}
              />
            </div>

            <div style={{ 
              borderTop: '1px solid var(--border)',
              paddingTop: '1rem',
              fontSize: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <label htmlFor="deadline" style={{ 
                    display: 'block', 
                    fontSize: '0.75rem', 
                    color: 'var(--text-tertiary)',
                    marginBottom: '0.25rem' 
                  }}>
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    id="deadline"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    style={{ 
                      border: 'none',
                      borderBottom: '1px solid var(--border)',
                      padding: '0.25rem 0',
                      fontSize: '0.875rem',
                      width: '100%',
                      backgroundColor: 'transparent'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Paperclip size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <label htmlFor="priority" style={{ 
                    display: 'block', 
                    fontSize: '0.75rem', 
                    color: 'var(--text-tertiary)',
                    marginBottom: '0.25rem' 
                  }}>
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TodoPriority)}
                    style={{ 
                      border: 'none',
                      borderBottom: '1px solid var(--border)',
                      padding: '0.25rem 0',
                      fontSize: '0.875rem',
                      width: '100%',
                      backgroundColor: 'transparent',
                      color: getPriorityColor()
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Tag size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <label htmlFor="tags" style={{ 
                    display: 'block', 
                    fontSize: '0.75rem', 
                    color: 'var(--text-tertiary)',
                    marginBottom: '0.25rem' 
                  }}>
                    Tags
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Add tags (press Enter)"
                      style={{ 
                        flex: 1,
                        border: 'none',
                        borderBottom: '1px solid var(--border)',
                        padding: '0.25rem 0',
                        fontSize: '0.875rem',
                        backgroundColor: 'transparent'
                      }}
                    />
                    <button 
                      type="button"
                      onClick={handleAddTag}
                      style={{ 
                        width: '24px', 
                        height: '24px',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: tagInput.trim() ? 'var(--primary-light)' : 'transparent',
                        color: tagInput.trim() ? 'var(--primary)' : 'var(--text-tertiary)',
                        border: 'none',
                        borderRadius: '50%'
                      }}
                    >
                      <PlusCircle size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="tag tag-meeting"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        padding: '0', 
                        cursor: 'pointer', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px'
                      }}
                    >
                      <X style={{ width: '12px', height: '12px' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ 
            padding: '0.75rem 1.25rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            backgroundColor: 'var(--background-alt)'
          }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 