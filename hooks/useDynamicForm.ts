"use client";

import { useState, useCallback, useMemo } from "react";
import { CapturedValue, ProtocolSchema } from "@/types";

/**
 * Hook para manejar el estado de formularios dinámicos.
 * Resolvemos el error de cascading renders calculando el estado inicial sincrónicamente.
 */
export function useDynamicForm(
  initialSchema: ProtocolSchema | string | undefined | null,
) {
  // 1. Procesamos el esquema de forma segura
  const schema = useMemo(() => {
    if (typeof initialSchema === "string") {
      try {
        return JSON.parse(initialSchema) as ProtocolSchema;
      } catch {
        return null;
      }
    }
    return initialSchema as ProtocolSchema | null;
  }, [initialSchema]);

  // 2. Inicialización perezosa (Lazy State)
  // Esto se ejecuta solo UNA vez cuando el componente se monta o cuando cambia el esquema
  const [formData, setFormData] = useState<
    Record<string, Record<string, CapturedValue>>
  >(() => {
    if (!schema?.sections) return {};

    const initialState: Record<string, Record<string, CapturedValue>> = {};
    schema.sections.forEach((section) => {
      initialState[section.id] = {};
      section.fields?.forEach((field) => {
        initialState[section.id][field.id] = "";
      });
    });
    return initialState;
  });

  // 3. Sincronización manual: Si el esquema cambia después del primer render,
  // reseteamos el estado (similar a lo que hacía el useEffect pero más eficiente)
  const [prevSchema, setPrevSchema] = useState(initialSchema);
  if (initialSchema !== prevSchema) {
    setPrevSchema(initialSchema);
    const nextState: Record<string, Record<string, CapturedValue>> = {};
    schema?.sections?.forEach((section) => {
      nextState[section.id] = {};
      section.fields?.forEach((field) => {
        nextState[section.id][field.id] = "";
      });
    });
    setFormData(nextState);
  }

  const handleInputChange = useCallback(
    (sectionId: string, fieldId: string, value: CapturedValue) => {
      setFormData((prev) => ({
        ...prev,
        [sectionId]: {
          ...(prev[sectionId] || {}),
          [fieldId]: value,
        },
      }));
    },
    [],
  );

  return { formData, handleInputChange };
}
