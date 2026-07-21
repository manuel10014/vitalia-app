import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Role, ApiErrorResponse } from "@/types";

// Mismo query key que useGetRoles() en hooks/useUsers.ts (usado por el
// selector de rol al crear/editar usuarios) para que ambos compartan caché:
// crear/editar/eliminar un rol aquí también refresca ese selector.
const ROLES_QUERY_KEY = ["roles"];

/**
 * Constantes de rol reconocidas por el backend (AppRole en
 * access-control.service.ts). El "key" de un Role SOLO otorga permisos
 * reales si coincide exactamente con una de estas — el backend lo valida
 * con @IsIn(EDITABLE_APP_ROLES). El "name" sí es libre (label visible por
 * organización, ej. "Técnico de Campo Senior").
 *
 * SUPERADMIN NO aparece aquí a propósito: es un rol de plataforma (equipo
 * de Vitalia con acceso a otras empresas), no algo que una organización
 * pueda auto-otorgarse creando un rol con ese key. El backend lo rechaza
 * de todas formas, pero tampoco tiene sentido ofrecerlo en el selector.
 */
export const APP_ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "ADMIN", label: "Administrador" },
  { value: "MANAGER", label: "Supervisor / Manager" },
  { value: "ENGINEER", label: "Ingeniero" },
  { value: "TECHNICIAN", label: "Técnico de Campo" },
  { value: "USER", label: "Usuario General" },
];

function getErrorMessage(err: AxiosError<ApiErrorResponse>, fallback: string) {
  const msg = err.response?.data?.message;
  return (Array.isArray(msg) ? msg.join(" ") : msg) || fallback;
}

export function useRoles() {
  const { data, isLoading } = useQuery<Role[]>({
    queryKey: ROLES_QUERY_KEY,
    queryFn: async () => {
      const res = await api.get("/roles");
      return Array.isArray(res.data) ? res.data : [];
    },
    initialData: [],
  });

  return { roles: data ?? [], isLoading };
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { key: string; name: string }) => {
      return await api.post("/roles", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      toast.success("Rol creado con éxito.");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error(getErrorMessage(err, "Error al crear el rol."));
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return await api.patch(`/roles/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      toast.success("Rol actualizado.");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error(getErrorMessage(err, "Error al actualizar el rol."));
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      toast.success("Rol eliminado.");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error(getErrorMessage(err, "No se pudo eliminar el rol."));
    },
  });
}

// ── Matriz de permisos por recurso ─────────────────────────────────────────

export interface PermissionCatalogEntry {
  resource: string;
  label: string;
}

export interface RolePermissionEntry {
  resource: string;
  label: string;
  allowed: boolean;
  /** true solo para el rol SUPERADMIN: acceso total fijo, no editable. */
  locked: boolean;
}

/** Catálogo fijo de recursos (áreas funcionales) — igual para todos los roles. */
export function usePermissionsCatalog() {
  return useQuery<PermissionCatalogEntry[]>({
    queryKey: ["roles", "permissions-catalog"],
    queryFn: async () => {
      const res = await api.get("/roles/permissions/catalog");
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: Infinity, // catálogo estático, no cambia en runtime
  });
}

export interface RolePermissionsMatrixEntry {
  roleId: string;
  roleKey: string;
  roleName: string;
  isSystem: boolean;
  permissions: RolePermissionEntry[];
}

/** Todos los roles de la organización con sus permisos, en una sola llamada. */
export function usePermissionsMatrix() {
  return useQuery<RolePermissionsMatrixEntry[]>({
    queryKey: ["roles", "permissions-matrix"],
    queryFn: async () => {
      const res = await api.get("/roles/permissions/matrix");
      return Array.isArray(res.data) ? res.data : [];
    },
  });
}

/** Estado actual (permitido/no) de cada recurso para un rol puntual. */
export function useRolePermissions(roleId: string | null) {
  return useQuery<RolePermissionEntry[]>({
    queryKey: ["roles", roleId, "permissions"],
    queryFn: async () => {
      const res = await api.get(`/roles/${roleId}/permissions`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!roleId,
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      permissions,
    }: {
      roleId: string;
      permissions: { resource: string; allowed: boolean }[];
    }) => {
      return await api.patch(`/roles/${roleId}/permissions`, { permissions });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["roles", variables.roleId, "permissions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["roles", "permissions-matrix"],
      });
      toast.success("Permisos actualizados.");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error(getErrorMessage(err, "No se pudieron guardar los permisos."));
    },
  });
}
