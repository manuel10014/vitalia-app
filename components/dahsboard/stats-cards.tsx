'use client';

import { useQuery } from '@tanstack/react-query';
import { type LucideProps } from 'lucide-react';
import { type ElementType } from 'react';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';
import type { PaginatedResponse } from '@/types';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  queryKey: string;
  endpoint: string;
  icon: ElementType<LucideProps>;
  color: 'blue' | 'amber' | 'green' | 'gray';
}

const colorMap = {
  blue:  { card: 'border-blue-100  bg-blue-50',  icon: 'text-blue-600',  text: 'text-blue-900'  },
  amber: { card: 'border-amber-100 bg-amber-50', icon: 'text-amber-600', text: 'text-amber-900' },
  green: { card: 'border-green-100 bg-green-50', icon: 'text-green-600', text: 'text-green-900' },
  gray:  { card: 'border-gray-100  bg-white',    icon: 'text-gray-500',  text: 'text-gray-900'  },
};

export function StatsCard({ title, queryKey, endpoint, icon: Icon, color }: StatsCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<unknown>>(endpoint);
      return res.data.meta.total;
    },
  });

  const colors = colorMap[color];

  return (
    <Card className={cn('p-6 border', colors.card)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <Icon className={cn('h-4 w-4', colors.icon)} />
      </div>
      <div className={cn('text-3xl font-bold mt-2', colors.text)}>
        {isLoading ? '—' : (data ?? 0)}
      </div>
    </Card>
  );
}