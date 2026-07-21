"use client";

import { useState } from "react";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { DataTable } from "@/components/admin/dataTable/DataTable";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Role } from "@/types";
import { useRoles, useDeleteRole } from "@/hooks/useRoles";
import { RoleFormDialog } from "@/components/admin/roles/RoleFormDialog";
import { PermissionsMatrix } from "@/components/admin/roles/PermissionsMatrix";
import styles from "./roles.module.css";

export default function RolesPage() {
  const { roles, isLoading } = useRoles();
  const deleteMutation = useDeleteRole();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  const openCreateDialog = () => {
    setRoleToEdit(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (role: Role) => {
    setRoleToEdit(role);
    setIsDialogOpen(true);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.eyebrow}>
            <ShieldCheck size={16} className="text-blue-600" />
            <span className={styles.eyebrowText}>Vitalia</span>
          </div>
          <h1 className={styles.title}>Roles y Permisos</h1>
          <p className={styles.subtitle}>
            Define qué puede hacer cada nivel de tu equipo dentro de la
            organización.
          </p>
        </div>

        <Button onClick={openCreateDialog} className={styles.newRoleButton}>
          <Plus size={16} /> Nuevo Rol
        </Button>
      </header>

      <div className={styles.tableCard}>
        <DataTable<Role>
          data={roles}
          isLoading={isLoading}
          emptyMessage="Aún no hay roles creados en esta organización."
          columns={[
            {
              header: "Rol",
              render: (role) => (
                <div className={styles.roleNameCell}>
                  <div className={styles.roleIconBox}>
                    <KeyRound size={18} />
                  </div>
                  <span className={styles.roleName}>{role.name}</span>
                </div>
              ),
            },
            {
              header: "Permiso Base",
              render: (role) => (
                <span className={styles.keyBadge}>{role.key}</span>
              ),
            },
            {
              header: "Tipo",
              render: (role) =>
                role.isSystem ? (
                  <span className={styles.systemBadge}>
                    <Lock size={11} /> Sistema
                  </span>
                ) : (
                  <span className={styles.customBadge}>
                    <Sparkles size={11} /> Personalizado
                  </span>
                ),
            },
            {
              header: "Acciones",
              render: (role) => (
                <div className={styles.actionsCell}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    disabled={role.isSystem}
                    title={
                      role.isSystem
                        ? "Los roles de sistema no se pueden editar"
                        : "Editar rol"
                    }
                    onClick={() => openEditDialog(role)}
                  >
                    <Pencil size={15} />
                  </button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        disabled={role.isSystem || deleteMutation.isPending}
                        title={
                          role.isSystem
                            ? "Los roles de sistema no se pueden eliminar"
                            : "Eliminar rol"
                        }
                      >
                        {deleteMutation.isPending &&
                        deleteMutation.variables === role.id ? (
                          <Loader2 className="animate-spin" size={15} />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar este rol?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Se eliminará el rol <strong>{role.name}</strong> (
                          {role.key}). Si tiene usuarios asignados, no se
                          podrá eliminar hasta reasignarlos a otro rol. Esta
                          acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className={styles.confirmActionButton}
                          onClick={() => deleteMutation.mutate(role.id)}
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ),
            },
          ]}
        />
      </div>

      <PermissionsMatrix />

      <RoleFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        roleToEdit={roleToEdit}
        existingKeys={roles.map((r) => r.key)}
      />
    </div>
  );
}
