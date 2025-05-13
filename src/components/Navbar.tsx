'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-indigo-600 font-semibold text-lg">SmartTodo</span>
            </div>
            <div className="ml-6 flex space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                  pathname === '/' 
                    ? 'border-indigo-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tasks
              </Link>
              <Link
                href="/analytics"
                className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                  pathname === '/analytics' 
                    ? 'border-indigo-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 