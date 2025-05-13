import { Todo, TodoStatus } from '@/types/todo';
import { useState, useEffect, useMemo } from 'react';
import TodoItem from './TodoItem';

// Set to false to disable excessive console logs (should match value in page.tsx)
const DEBUG_MODE = false;

interface TodoTabsProps {
  todos: Todo[];
  onUpdate: () => void;
  onDelete: (id: string) => void;
}
type TabType = 'all' | TodoStatus;
export default function TodoTabs({ todos, onUpdate, onDelete }: TodoTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('ongoing');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  
  const todoArray = useMemo(() => Array.isArray(todos) ? todos : [], [todos]);
  
  useEffect(() => {
    const filtered = todoArray.filter(todo => {
      const matchesTab = activeTab === 'all' || todo.status === activeTab;
      const matchesSearch = searchTerm === '' || 
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
    setFilteredTodos(filtered);
  }, [todoArray, activeTab, searchTerm]);
  const tabCounts = {
    all: todoArray.length,
    ongoing: todoArray.filter(todo => todo.status === 'ongoing').length,
    success: todoArray.filter(todo => todo.status === 'success').length,
    failure: todoArray.filter(todo => todo.status === 'failure').length,
  };
  
  if (DEBUG_MODE) {
    console.log("Current todo counts:", { 
      all: tabCounts.all,
      ongoing: tabCounts.ongoing,
      success: tabCounts.success,
      failure: tabCounts.failure,
      todosWithExpiredDeadline: todoArray.filter(todo => new Date(todo.deadline) < new Date()).length,
      statusCounts: todoArray.reduce((counts, todo) => {
        counts[todo.status] = (counts[todo.status] || 0) + 1;
        return counts;
      }, {} as Record<string, number>)
    });
  }
  
  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
  };
  const getTabClasses = (tab: TabType) => {
    return `filter-tab ${activeTab === tab ? 'filter-tab-active' : 'filter-tab-inactive'}`;
  };
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md">
        <div className="search-container">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="search-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="search-clear"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500 mr-2">Filter:</span>
          <button 
            onClick={() => handleTabClick('ongoing')} 
            className={getTabClasses('ongoing')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ongoing
            <span className="badge badge-blue">
              {tabCounts.ongoing}
            </span>
          </button>
          <button 
            onClick={() => handleTabClick('all')} 
            className={getTabClasses('all')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            All
            <span className="badge badge-gray">
              {tabCounts.all}
            </span>
          </button>
          <button 
            onClick={() => handleTabClick('success')} 
            className={getTabClasses('success')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Completed
            <span className="badge badge-green">
              {tabCounts.success}
            </span>
          </button>
          <button 
            onClick={() => handleTabClick('failure')} 
            className={getTabClasses('failure')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Failed
            <span className="badge badge-red">
              {tabCounts.failure}
            </span>
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
            {searchTerm ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }} className="mx-auto text-gray-400 mb-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <p className="text-lg font-medium mb-2">No tasks match your search</p>
                <p className="text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
                <button onClick={() => setSearchTerm('')} className="btn btn-secondary">
                  Clear search
                </button>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }} className="mx-auto text-gray-400 mb-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                <p className="text-lg font-medium mb-2">No tasks found in this category</p>
                <p className="text-gray-400">Create a new task to get started</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTodos.map(todo => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                onUpdate={onUpdate}
                onDelete={() => onDelete(todo.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 