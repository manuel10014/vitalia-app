'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { Client } from '@/types';

export function CreateProject() {
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const queryClient = useQueryClient();

  const { data: clients } = useQuery<Client[]>({ 
    queryKey: ['clients'], 
    queryFn: async () => (await api.get<Client[]>('/clients')).data 
  });

  const mutation = useMutation({
    mutationFn: async () => await api.post('/projects', { name, clientId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setName('');
    }
  });

  return (
    <div className="flex gap-2 items-end">
      <div className="w-1/3">
        <Select onValueChange={setClientId}>
          <SelectTrigger><SelectValue placeholder="Selecciona Cliente" /></SelectTrigger>
          <SelectContent>
            {clients?.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.businessName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Input className="w-1/2" placeholder="Nombre Proyecto" value={name} onChange={e => setName(e.target.value)} />
      <Button onClick={() => mutation.mutate()}>Crear</Button>
    </div>
  );
}