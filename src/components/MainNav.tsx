'use client';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export default function MainNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="w-full flex justify-center my-6">
      <div className="bg-black text-white px-12 py-3 rounded-full shadow-lg inline-flex items-center space-x-20">
        <button 
          onClick={() => router.push('/')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            pathname === "/" 
              ? "bg-white text-black" 
              : "hover:bg-gray-800"
          }`}
        >
          TodoApp
        </button>
        
        <button 
          onClick={() => router.push('/analytics')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            pathname === "/analytics" 
              ? "bg-white text-black" 
              : "hover:bg-gray-800"
          }`}
        >
          Analytics
        </button>
      </div>
    </div>
  );
} 