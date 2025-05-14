import { Todo } from '@/types/todo';
import { formatDeadline, getTimeRemainingText } from '@/utils/todoUtils';
import { useState, useEffect } from 'react';
import { todoApi } from '@/services/todoApi';
import { CheckCircle, Clock, Calendar, Tag, ChevronDown, ChevronUp, AlertTriangle, Trash, Star, Mail } from 'lucide-react';

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
  const getPriorityTagClass = () => {
    switch (todo.priority) {
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
      onClick={() => { if (!isRead) setIsRead(true); }}
    >
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
      
      {isExpanded && todo.description && (
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
          {todo.description}
          <div className={`countdown-display ${getCountdownClass()}`} style={{marginTop: '0.75rem'}}>
            <Clock size={14} />
            Deadline: {formatDeadline(todo.deadline)} ({getRealTimeRemaining()})
          </div>
        </div>
      )}
      
      <div className="email-footer">
        <div className="email-tags">
          <div className={`tag ${getPriorityTagClass()}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
          
          {todo.description && (
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
          )}
          
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
    </div>
  );
} 