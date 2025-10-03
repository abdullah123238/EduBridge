'use client';

import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BookOpen, 
  Megaphone, 
  FileText, 
  Users,
  Plus,
  GraduationCap,
  Settings,
  LogOut,
  ClipboardList,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  requireRole?: 'student' | 'lecturer';
  badge?: string;
}

interface SidebarProps {
  onItemClick?: () => void;
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Courses',
    href: '/courses',
    icon: BookOpen,
  },
  {
    name: 'Assignments',
    href: '/assignments',
    icon: ClipboardList,
  },
  {
    name: 'Progress Tracking',
    href: '/progress',
    icon: TrendingUp,
    requireRole: 'lecturer',
  },
  {
    name: 'Create Course',
    href: '/courses/create',
    icon: Plus,
    requireRole: 'lecturer',
  },
  {
    name: 'Announcements',
    href: '/announcements',
    icon: Megaphone,
  },
  {
    name: 'Materials',
    href: '/materials',
    icon: FileText,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: Users,
  },
];

export function Sidebar({ onItemClick }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const filteredItems = sidebarItems.filter(item => 
    !item.requireRole || item.requireRole === user?.role
  );

  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-md w-72 h-full shadow-lg border-r border-gray-200/50 overflow-y-auto"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200/50">
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Image 
            src="/logo.svg" 
            alt="EduBridge Logo" 
            width={32} 
            height={32} 
            className="h-8 w-8"
          />
          <span className="text-xl font-bold text-scholiax-purple">
            EduBridge
          </span>
        </motion.div>
        <p className="text-sm text-gray-500 mt-2">
          {user?.role === 'lecturer' ? 'Lecturer Portal' : 'Student Portal'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Navigation
          </h3>
          <ul className="space-y-1">
            {filteredItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <motion.li 
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={onItemClick}
                    className={cn(
                      'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative',
                      isActive
                        ? 'bg-scholiax-purple text-white shadow-lg shadow-scholiax-purple/25'
                        : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                    )}
                  >
                    <motion.div
                      className={cn(
                        'mr-3 h-5 w-5 transition-all duration-200',
                        isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                      )}
                      whileHover={{ scale: 1.1 }}
                    >
                      <item.icon />
                    </motion.div>
                    <span className="flex-1 font-medium">{item.name}</span>
                    {item.badge && (
                      <motion.span
                        className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* User Section */}
        <div className="mt-8 pt-6 border-t border-gray-200/50">
          <div className="flex items-center px-4 py-3 rounded-xl bg-gray-50/50">
            <div className="w-10 h-10 bg-scholiax-purple rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          
          <div className="mt-3 space-y-1">
            <Link href="/profile">
              <motion.div
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 rounded-lg transition-colors duration-200"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </motion.div>
            </Link>
            <motion.button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </motion.button>
          </div>
        </div>
      </nav>
    </motion.div>
  );
}