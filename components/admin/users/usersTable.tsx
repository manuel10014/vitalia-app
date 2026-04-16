"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { User, PaginatedResponse } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Mail, ShieldCheck, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Column, DataTable } from "../dataTable/DataTable";
import styles from "./usersTable.module.css";
import { useState } from "react";
import { UserFormSheet } from "./usersFormSheets";

interface UsersTableProps {
  searchTerm: string;
}

export default function UsersTable({ searchTerm }: UsersTableProps) {
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  };

  const { data, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data;
    },
  });

  const users = data?.data || [];

  const toggleStatus = useMutation({
    mutationFn: async (user: User) => {
      return api.patch(`/users/${user.id}`, { isActive: !user.isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Estado de acceso actualizado");
    },
  });

  const columns: Column<User>[] = [
    {
      header: "Colaborador",
      render: (user) => (
        <div className={styles.userWrapper}>
          <span className={styles.userName}>{user.fullName}</span>
          <span className={styles.userEmail}>
            <Mail size={12} className={styles.emailIcon} />
            {user.email}
          </span>
        </div>
      ),
    },
    {
      header: "Privilegios",
      render: (user) => (
        <div className={styles.rolesContainer}>
          {user.roles.map((roleName: string, index: number) => (
            <div
              key={`${user.id}-${roleName}-${index}`}
              className={styles.roleBadge}
            >
              <ShieldCheck size={10} className={styles.roleIcon} />
              {roleName}
            </div>
          ))}
          {user.roles.length === 0 && (
            <span className={styles.noRoles}>Sin roles</span>
          )}
        </div>
      ),
    },
    {
      header: "Estado",
      render: (user) => (
        <Badge
          variant={user.isActive ? "default" : "destructive"}
          className={styles.statusBadge}
        >
          {user.isActive ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      header: "Fecha de Ingreso",
      render: (user) => (
        <div className={styles.dateWrapper}>
          <Calendar size={13} />
          {new Date(user.createdAt).toLocaleDateString("es-CO", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })}
        </div>
      ),
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <>
      <DataTable
        data={filteredUsers}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onToggleStatus={(user) => toggleStatus.mutate(user)}
        emptyMessage="No se encontraron usuarios en esta organización."
      />
      <UserFormSheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) setSelectedUser(null);
        }}
        userToEdit={selectedUser}
      />
    </>
  );
}
