'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

export function Breadcrumb({ items = [], showHome = true }: BreadcrumbProps) {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (showHome) {
      breadcrumbs.push({ label: 'Home', href: '/' });
    }

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      let label = segment;
      
      if (segment.startsWith('[') && segment.endsWith(']')) {
        label = 'Details';
      } else {
        label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      const isLast = index === segments.length - 1;
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              {index === 0 && showHome && <Home className="h-4 w-4" />}
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium flex items-center gap-1">
              {index === 0 && showHome && <Home className="h-4 w-4" />}
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
} 