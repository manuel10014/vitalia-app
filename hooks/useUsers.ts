"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { User, PaginatedResponse, ApiErrorResponse, Role } from "@/types";
import { toast } from "sonner";
import { UserPayload } from "@/components/admin/users/usersFormSheets";

export function useUsers() {
  const queryClient = useQueryClient();

  // 1. Query para obtener todos los usuarios
  const useGetUsers = () => {
    return useQuery<PaginatedResponse<User>>({
      queryKey: ["users"],
      queryFn: async () => {
        const res = await api.get("/users");
        return res.data;
      },
    });
  };

  // 2. Mutation para crear usuario (Tipado con CreateUserPayload)
  const useCreateUser = (onSuccess?: () => void) => {
    return useMutation<User, ApiErrorResponse, UserPayload>({
      mutationFn: async (data: UserPayload) => {
        const res = await api.post("/users", data);
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("Usuario registrado exitosamente");
        onSuccess?.();
      },
      onError: (error: unknown) => {
        const axiosError = error as { response?: { data?: ApiErrorResponse } };
        const msg =
          axiosError.response?.data?.message || "Error al registrar usuario";
        toast.error(Array.isArray(msg) ? msg[0] : msg);
      },
    });
  };

  // 3. Mutation para actualizar usuario (¡Añadida al retorno!)
  const useUpdateUser = (onSuccess?: () => void) => {
    return useMutation<
      User,
      ApiErrorResponse,
      { id: string; data: Partial<UserPayload> }
    >({
      mutationFn: async ({ id, data }) => {
        const res = await api.patch(`/users/${id}`, data);
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("Información actualizada correctamente");
        onSuccess?.();
      },
      onError: (error: unknown) => {
        const axiosError = error as { response?: { data?: ApiErrorResponse } };
        const msg =
          axiosError.response?.data?.message || "Error al actualizar usuario";
        toast.error(Array.isArray(msg) ? msg[0] : msg);
      },
    });
  };

  // 4. Mutation para cambiar estado
  const useToggleUserStatus = () => {
    return useMutation<
      User,
      ApiErrorResponse,
      { id: string; isActive: boolean }
    >({
      mutationFn: async ({ id, isActive }) => {
        const res = await api.patch(`/users/${id}`, { isActive });
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("Estado de acceso actualizado");
      },
      onError: (error: unknown) => {
        const axiosError = error as { response?: { data?: ApiErrorResponse } };
        toast.error(
          axiosError.response?.data?.message?.toString() ||
            "Error al actualizar estado",
        );
      },
    });
  };

  // 5. Query para obtener roles
  const useGetRoles = () => {
    return useQuery<Role[]>({
      queryKey: ["roles"],
      queryFn: async () => {
        const res = await api.get("/roles");
        return res.data;
      },
    });
  };

  return {
    useGetUsers,
    useCreateUser,
    useUpdateUser,
    useToggleUserStatus,
    useGetRoles,
  };
}
