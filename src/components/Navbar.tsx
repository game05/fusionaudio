'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-md mb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              href="/"
              className={`inline-flex items-center px-4 border-b-2 text-sm font-medium ${
                pathname === '/' 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Fusion
            </Link>
            <Link
              href="/my-audios"
              className={`inline-flex items-center px-4 border-b-2 text-sm font-medium ${
                pathname === '/my-audios'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mes Audios
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
