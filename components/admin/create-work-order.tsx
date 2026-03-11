'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Project } from '@/types';

export function CreateWorkOrder() {
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState('');
  const queryClient = useQueryClient();

  const { data: projects } = useQuery<Project[]>({ 
    queryKey: ['projects'], 
    queryFn: async () => (await api.get<Project[]>('/projects')).data 
  });

  const mutation = useMutation({
    mutationFn: async () => await api.post('/work-orders', { projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      setOpen(false);
      setProjectId('');
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Nueva Orden
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Asignar Trabajo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Proyecto / Sitio</label>
            <Select onValueChange={setProjectId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar Proyecto" /></SelectTrigger>
              <SelectContent>
                {projects?.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Aquí podrías agregar un Select para el Técnico (User) */}
          
          <Button onClick={() => mutation.mutate()} disabled={!projectId} className="w-full">
            Crear Orden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}