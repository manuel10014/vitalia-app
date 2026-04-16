"use client";

import {
  OrganizationProtocolVersion,
  ProtocolSection,
  ProtocolField,
} from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, ClipboardList } from "lucide-react";

interface RunTestFormProps {
  protocolVersion: OrganizationProtocolVersion;
  handleInputChange: (
    sectionId: string,
    fieldName: string,
    value: string | number | boolean,
  ) => void;
}

export function RunTestForm({
  protocolVersion,
  handleInputChange,
}: RunTestFormProps) {
  const schema = protocolVersion.schemaDefinition;

  return (
    <div className="space-y-8 pb-20">
      {schema.sections.map((section: ProtocolSection) => (
        <Card
          key={section.id}
          className="border-slate-200 shadow-sm overflow-hidden"
        >
          <CardHeader className="bg-slate-50/80 border-b py-3">
            <CardTitle className="text-sm font-black uppercase text-slate-700 flex items-center gap-2">
              {section.id.includes("hallazgo") ||
              section.id.includes("imagen") ? (
                <Camera size={16} className="text-blue-500" />
              ) : (
                <ClipboardList size={16} className="text-green-600" />
              )}
              {section.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.fields.map((field: ProtocolField) => (
                <div key={field.name} className="flex flex-col gap-1.5">
                  <Label className="text-xs font-bold text-slate-600">
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>

                  {field.type === "select" ? (
                    <Select
                      onValueChange={(val) =>
                        handleInputChange(section.id, field.name, val)
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seleccione una opción..." />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      className="bg-white min-h-[100px]"
                      placeholder={`Describa ${field.label.toLowerCase()}...`}
                      onChange={(e) =>
                        handleInputChange(
                          section.id,
                          field.name,
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    <Input
                      type={field.type === "number" ? "number" : "text"}
                      step={field.step || "any"}
                      className="bg-white"
                      placeholder={field.label}
                      onChange={(e) =>
                        handleInputChange(
                          section.id,
                          field.name,
                          field.type === "number"
                            ? Number(e.target.value)
                            : e.target.value,
                        )
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
