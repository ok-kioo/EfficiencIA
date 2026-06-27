import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Sparkles } from "lucide-react";

interface AnalyzeBeforeActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Texto descritivo da ação que o usuário tentou fazer (ex.: "exportar o XML"). */
  actionLabel: string;
  /** Executar a ação original sem analisar. */
  onContinueWithout: () => void;
  /** Disparar análise pela IA antes. */
  onAnalyzeFirst: () => void;
  /** Texto do botão de continuar (default: "Continuar sem analisar"). */
  continueLabel?: string;
}

export function AnalyzeBeforeActionDialog({
  open,
  onOpenChange,
  actionLabel,
  onContinueWithout,
  onAnalyzeFirst,
  continueLabel = "Continuar sem analisar",
}: AnalyzeBeforeActionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            Deseja realizar uma análise inteligente antes?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Antes de {actionLabel}, a IA pode revisar seu fluxo e apontar gargalos,
            problemas e oportunidades de melhoria — em poucos segundos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onContinueWithout}>
            {continueLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onAnalyzeFirst}
            className="bg-primary text-primary-foreground hover:bg-primary-deep"
          >
            <Sparkles size={14} className="mr-1.5" />
            Analisar agora
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
