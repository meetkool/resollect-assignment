'use client';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { CheckSquare, BarChart } from 'lucide-react';

export default function MainNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navStyles = {
    container: {
      width: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      padding: '2rem 0'
    },
    card: {
      backgroundColor: '#000', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
      borderRadius: '0.5rem'
    },
    buttonContainer: {
      display: 'flex', 
      alignItems: 'center', 
      padding: '0.25rem 1rem'
    },
    button: (isActive: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: 'white',
      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      border: 'none',
      borderRadius: '0.375rem',
      padding: '0.625rem 1.25rem',
      margin: '0 0.25rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      height: '2.5rem'
    }),
    icon: {
      height: '1.25rem',
      width: '1.25rem'
    }
  };

  return (
    <div style={navStyles.container}>
      <div style={navStyles.card}>
        <div style={navStyles.buttonContainer}>
          <button
            onClick={() => router.push('/')}
            style={navStyles.button(pathname === "/")}
          >
            <CheckSquare style={navStyles.icon} />
            <span>Todo List</span>
          </button>
          
          <button
            onClick={() => router.push('/analytics')}
            style={navStyles.button(pathname === "/analytics")}
          >
            <BarChart style={navStyles.icon} />
            <span>Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
} 