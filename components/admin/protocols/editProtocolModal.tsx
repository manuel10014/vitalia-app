"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings2 } from "lucide-react";
import ProtocolBuilder from "./protocolBuilder";

interface EditProtocolModalProps {
  versionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  protocolName: string;
}

export function EditProtocolModal({
  versionId,
  isOpen,
  onClose,
  protocolName,
}: EditProtocolModalProps) {
  if (!versionId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b bg-slate-50">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings2 className="text-blue-600" size={20} />
            Configurando: {protocolName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 bg-slate-100/30">
          <ProtocolBuilder versionId={versionId} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
