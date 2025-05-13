import { Todo, TodoStatus } from '@/types/todo';
export const calculateTimeRemaining = (deadline: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} => {
  const now = new Date();
  const targetDate = new Date(deadline);
  const difference = targetDate.getTime() - now.getTime();
  const isExpired = difference <= 0;
  const absDifference = Math.abs(difference);
  const days = Math.floor(absDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absDifference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absDifference % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, isExpired };
};
export const getAutoStatus = (todo: Todo): TodoStatus => {
  const now = new Date();
  const deadline = new Date(todo.deadline);
  console.log(`Checking status for todo ${todo.id}: current=${todo.status}, deadline=${deadline.toISOString()}, now=${now.toISOString()}, isExpired=${deadline < now}`);
  if (todo.status === 'success') {
    return 'success';
  }

  if (deadline < now) {
    console.log(`  → Should be marked as failure due to expired deadline`);
    return 'failure';
  }

  if (todo.status === 'failure') {
    return 'failure';
  }

  return 'ongoing';
};
export const formatDeadline = (deadline: string): string => {
  return new Date(deadline).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
export const getTimeRemainingText = (deadline: string): string => {
  const { days, hours, minutes, isExpired } = calculateTimeRemaining(deadline);
  if (isExpired) {
    return `Expired ${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${minutes}m ago`;
  }
  return `${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${minutes}m remaining`;
}; 