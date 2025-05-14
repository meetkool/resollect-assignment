import { Todo, TodoPriority, UpdateTodoPayload } from '@/types/todo';
import { formatDeadline } from '@/utils/todoUtils';
import { useState, useEffect } from 'react';
import { todoApi } from '@/services/todoApi';
import { Clock, AlertTriangle, Star, Mail, Edit, Save, X, PlusCircle } from 'lucide-react';

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
  const [isRead, setIsRead] = useState(todo.status !== 'ongoing');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit mode state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editPriority, setEditPriority] = useState<TodoPriority>(todo.priority);
  const [editTagInput, setEditTagInput] = useState('');
  const [editTags, setEditTags] = useState<string[]>([...todo.tags]);

  // Initialize edit values when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditTitle(todo.title);
      setEditDescription(todo.description);
      // Format the date for datetime-local input (YYYY-MM-DDThh:mm)
      const deadlineDate = new Date(todo.deadline);
      setEditDeadline(deadlineDate.toISOString().slice(0, 16));
      setEditPriority(todo.priority);
      setEditTags([...todo.tags]);
    }
  }, [isEditing, todo]);

  // Update the current time every second for real-time countdown
  useEffect(() => {
    // Only set up the interval for ongoing tasks to avoid unnecessary updates
    if (todo.status === 'ongoing') {
      const intervalId = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [todo.status]);

  if (DEBUG_MODE) {
    console.log(`TodoItem: ${todo.id}, title: ${todo.title}, status: ${todo.status}, deadline: ${todo.deadline}, isExpired: ${new Date(todo.deadline) < new Date()}`);
  }

  const handleMarkComplete = async () => {
    if (todo.status === 'success') return;
    try {
      setIsLoading(true);
      await todoApi.markTodoComplete(todo.id);
      onUpdate();
      setIsRead(true);
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

  const handleToggleRead = () => {
    setIsRead(!isRead);
  };
  
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setIsExpanded(true); // Expand when entering edit mode
    }
  };
  
  const handleSaveEdit = async () => {
    try {
      // Validate title is not empty
      if (!editTitle.trim()) {
        alert('Task title cannot be empty');
        return;
      }
      
      setIsLoading(true);
      
      // Create update payload
      const updatePayload: UpdateTodoPayload = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        tags: editTags
      };
      
      // Only include deadline if it's changed
      if (editDeadline) {
        updatePayload.deadline = new Date(editDeadline).toISOString();
        
        // Special logic for failed tasks: if the new deadline is in the future,
        // change status back to ongoing
        if (todo.status === 'failure') {
          const newDeadline = new Date(editDeadline);
          const now = new Date();
          
          if (newDeadline > now) {
            updatePayload.status = 'ongoing';
          }
        }
      }
      
      // Send update to backend
      await todoApi.updateTodo(todo.id, updatePayload);
      
      // Exit edit mode and refresh data
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = editTagInput.trim();
    if (trimmedTag && !editTags.includes(trimmedTag)) {
      setEditTags([...editTags, trimmedTag]);
      setEditTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editTagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Get time ago text (e.g., "2 months ago")
  const getTimeAgo = () => {
    const deadlineDate = new Date(todo.deadline);
    const now = new Date();
    
    // Calculate difference in milliseconds
    const diff = now.getTime() - deadlineDate.getTime();
    
    // Convert to appropriate unit
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    
    if (months > 0) {
      return `${months} month${months === 1 ? '' : 's'} ago`;
    } else if (days > 0) {
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else {
      return 'Just now';
    }
  };

  // Calculate real-time remaining time
  const getRealTimeRemaining = () => {
    const deadlineDate = new Date(todo.deadline);
    const now = currentTime;
    
    // If task is already completed or failed, don't show a countdown
    if (todo.status === 'success') {
      return "Completed";
    } else if (todo.status === 'failure') {
      return "Failed";
    }
    
    // If deadline is in the past, we'll show "Overdue" with time since
    if (deadlineDate < now) {
      return getTimeAgo() + " (Overdue)";
    }
    
    // Calculate difference in milliseconds
    const diff = deadlineDate.getTime() - now.getTime();
    
    // Convert to appropriate units
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h remaining`;
    } else if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m remaining`;
    } else if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s remaining`;
    } else {
      return `${seconds}s remaining`;
    }
  };

  // Get priority tag class
  const getPriorityTagClass = (priority: TodoPriority) => {
    switch (priority) {
      case 'high':
        return 'tag-urgent';
      case 'medium':
        return 'tag-important';
      default:
        return 'tag-personal';
    }
  };

  // Get status tag class
  const getStatusTagClass = () => {
    switch (todo.status) {
      case 'success':
        return 'tag-personal';
      case 'failure':
        return 'tag-urgent';
      default:
        return 'tag-meeting';
    }
  };
  
  // Generate a fake sender name based on the task and current date
  const generateSenderName = () => {
    // Use first word of title and a fixed last name based on priority
    const firstWord = todo.title.split(' ')[0];
    const lastName = todo.priority === 'high' ? 'Johnson' : 
                     todo.priority === 'medium' ? 'Smith' : 'Davis';
    
    return `${firstWord} ${lastName}`;
  };

  const deadlineDate = new Date(todo.deadline);
  const isPastDeadline = deadlineDate < currentTime && todo.status === 'ongoing';
  const isCloseToDeadline = !isPastDeadline && 
                           todo.status === 'ongoing' &&
                           ((deadlineDate.getTime() - currentTime.getTime()) < 24 * 60 * 60 * 1000); // Less than 24 hours

  // Get countdown display class
  const getCountdownClass = () => {
    if (todo.status !== 'ongoing') return '';
    if (isPastDeadline) return 'overdue';
    if (isCloseToDeadline) return 'warning';
    return '';
  };

  return (
    <div 
      className={`email-todo-item ${!isRead ? 'unread' : ''}`} 
      onClick={() => { if (!isRead && !isEditing) setIsRead(true); }}
    >
      {isEditing ? (
        // Edit mode for the whole item
        <div onClick={(e) => e.stopPropagation()} style={{ padding: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                marginBottom: '0.25rem'
              }}>
                Title
              </label>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Task title"
                style={{ 
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                marginBottom: '0.25rem'
              }}>
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Task description"
                rows={3}
                style={{ 
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                marginBottom: '0.25rem'
              }}>
                Deadline
              </label>
              <input
                type="datetime-local"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                marginBottom: '0.25rem'
              }}>
                Priority
              </label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as TodoPriority)}
                style={{ 
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                marginBottom: '0.25rem'
              }}>
                Tags
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  value={editTagInput}
                  onChange={(e) => setEditTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tag and press Enter"
                  style={{ 
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem'
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  style={{ 
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <PlusCircle size={16} />
                </button>
              </div>
              
              {editTags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {editTags.map((tag, index) => (
                    <div
                      key={index}
                      className="tag tag-meeting"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          padding: '0', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center' 
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--secondary)',
                  color: 'var(--text-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isLoading}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Save size={16} />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Normal view mode
        <>
          <div className="email-todo-header">
            <div className="email-sender" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {todo.priority === 'high' && (
                <Star size={14} fill="var(--important)" color="var(--important)" />
              )}
              {generateSenderName()}
            </div>
            <div className={`email-date ${getCountdownClass()}`}>
              {getRealTimeRemaining()}
            </div>
          </div>
          
          <div className="email-subject">{todo.title}</div>
          
          <div className="email-preview">
            {todo.description || `${formatDeadline(todo.deadline)} - ${getRealTimeRemaining()}`}
          </div>
          
          {isExpanded && (
            <div style={{ 
              marginTop: '0.75rem', 
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--background-alt)',
              border: '1px solid var(--border)',
              lineHeight: '1.5'
            }}>
              {todo.description && (
                <div>{todo.description}</div>
              )}
              <div className={`countdown-display ${getCountdownClass()}`} style={{marginTop: '0.75rem'}}>
                <Clock size={14} />
                Deadline: {formatDeadline(todo.deadline)} ({getRealTimeRemaining()})
              </div>
            </div>
          )}
          
          <div className="email-footer">
            <div className="email-tags">
              <div className={`tag ${getPriorityTagClass(todo.priority)}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {todo.priority === 'high' ? <AlertTriangle size={12} /> : 
                 todo.priority === 'medium' ? <Clock size={12} /> : 
                 <Mail size={12} />}
                {todo.priority}
              </div>
              
              <div className={`tag ${getStatusTagClass()}`}>
                {todo.status === 'success' ? 'Completed' : 
                 todo.status === 'failure' ? 'Failed' : 'Ongoing'}
              </div>
              
              {todo.tags && todo.tags.length > 0 && todo.tags.map((tag, index) => (
                <div key={index} className="tag tag-meeting">
                  {tag}
                </div>
              ))}
            </div>
            
            <div className="email-actions">
              {!isRead && (
                <button 
                  type="button"
                  className="secondary"
                  onClick={(e) => { e.stopPropagation(); handleToggleRead(); }}
                  style={{
                    background: 'none', 
                    border: 'none',
                    color: 'var(--text-secondary)',
                    boxShadow: 'none',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem'
                  }}
                >
                  Mark as read
                </button>
              )}
              
              <button 
                type="button"
                className="secondary"
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                style={{
                  background: 'none', 
                  border: 'none',
                  color: 'var(--text-secondary)',
                  boxShadow: 'none',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem'
                }}
              >
                {isExpanded ? 'Hide' : 'Show details'}
              </button>
              
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); handleToggleEdit(); }}
                disabled={isLoading}
                style={{
                  background: 'none', 
                  border: 'none',
                  color: 'var(--primary)',
                  boxShadow: 'none',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Edit size={12} />
                Edit
              </button>
              
              {todo.status !== 'success' && todo.status !== 'failure' && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleMarkComplete(); }}
                  disabled={isLoading}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    color: 'var(--success)',
                    boxShadow: 'none',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem'
                  }}
                >
                  Complete
                </button>
              )}
              
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                disabled={isLoading}
                style={{ 
                  background: 'none',
                  border: 'none', 
                  color: 'var(--error)',
                  boxShadow: 'none',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 