'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from "@/components/ui/card";
import { Report } from '@/types';

export function ReportsList() {
  const { data: reports } = useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: async () => (await api.get<Report[]>('/reports')).data
  });

  return (
    <div className="grid gap-4">
      {reports?.map((r) => (
        <Card key={r.id} className="p-4 flex justify-between items-center">
          <div>
            <div className="font-bold">{r.protocol?.name || 'Sin Protocolo'}</div>
            <div className="text-sm text-gray-500">Activo: {r.asset?.tagId || 'Desconocido'}</div>
          </div>
          <div className="text-xs bg-gray-100 p-2 rounded font-mono max-w-[200px] truncate">
            {JSON.stringify(r.values)}
          </div>
        </Card>
      ))}
      {reports?.length === 0 && <div className="text-gray-500">No hay reportes aún.</div>}
    </div>
  );
}