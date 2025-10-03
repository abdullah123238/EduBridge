'use client';

import { useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { ProtectedRoute } from './protected-route';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireRole?: 'student' | 'lecturer';
}

export function DashboardLayout({ children, requireRole }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute requireRole={requireRole}>
      <div className="min-h-screen bg-slate-50">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-scholiax-purple/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-scholiax-teal/5 rounded-full blur-3xl"></div>
        </div>

        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>
        
        {/* Add top padding to account for fixed header */}
        <div className="pt-16">
          <div className="flex">
            {/* Desktop sidebar - Fixed */}
            <div className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] z-30">
              <Sidebar />
            </div>
          
                      {/* Mobile sidebar */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div 
                  className="fixed inset-y-0 left-0 top-0 z-50 w-72 bg-white/95 backdrop-blur-md shadow-2xl border-r border-gray-200/50 lg:hidden"
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                >
                  <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                    <h2 className="text-xl font-bold text-scholiax-purple">
                      Scholiax
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(false)}
                      className="hover:bg-gray-100"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <Sidebar onItemClick={() => setSidebarOpen(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          
            {/* Main content - with proper spacing for fixed sidebar */}
            <main className="flex-1 p-6 sm:p-8 lg:p-10 lg:ml-72">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {children}
                </motion.div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}