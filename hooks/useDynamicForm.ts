// hooks/useDynamicForm.ts
import { useState } from "react";
import { ProtocolSchema } from "@/types";

type FormValue = string | number | boolean | undefined;

export function useDynamicForm(schema: ProtocolSchema) {
  const [formData, setFormData] = useState<Record<string, FormValue>>(() => {
    const initialData: Record<string, FormValue> = {};
    console.log(`Inicializando formulario para: ${schema.protocol_name}`);

    return initialData;
  });

  const handleInputChange = (
    sectionId: string,
    fieldName: string,
    value: FormValue,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [`${sectionId}.${fieldName}`]: value,
    }));
  };

  return { formData, handleInputChange, setFormData };
}
