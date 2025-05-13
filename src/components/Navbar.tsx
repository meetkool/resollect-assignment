'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-4 z-50 w-full flex justify-center px-4 py-2">
      <div className="flex items-center justify-center bg-neutral-900 rounded-full shadow-lg py-3 px-4 md:px-6">
        <div className="mx-auto flex items-center justify-center">
          <Link 
            href="/" 
            className={`
              mx-6 px-6 py-2 rounded-full text-sm font-medium 
              ${pathname === "/" 
                ? "bg-white text-black" 
                : "bg-neutral-800 text-white hover:bg-neutral-700"}
            `}
          >
            TodoApp
          </Link>
          
          <div className="mx-6 h-4 w-px bg-neutral-700" aria-hidden="true" />
          
          <Link 
            href="/analytics" 
            className={`
              mx-6 px-6 py-2 rounded-full text-sm font-medium 
              ${pathname === "/analytics" 
                ? "bg-white text-black" 
                : "bg-neutral-800 text-white hover:bg-neutral-700"}
            `}
          >
            Analytics
          </Link>
        </div>
      </div>
    </nav>
  );
} 