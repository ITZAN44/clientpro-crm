'use client';

import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';
import { toast } from 'sonner';

export function KeyboardShortcutsHelp() {
  const showHelp = () => {
    toast.info(
      '⌨️ Atajos de teclado disponibles:\n\n' +
      'g → d: Ir a Dashboard\n' +
      'g → c: Ir a Clientes\n' +
      'g → n: Ir a Negocios\n' +
      'g → a: Ir a Actividades\n' +
      'g → r: Ir a Reportes\n\n' +
      'Ctrl + / o ?: Ver esta ayuda\n\n' +
      '💡 Tip: Presiona "g" y luego la letra\n' +
      '   (no presiones el símbolo +)',
      { duration: 12000 }
    );
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={showHelp}
      className="text-stone-600 dark:text-stone-400 hover:text-primary hover:bg-primary/10"
      title="Atajos de teclado (Ctrl + /)"
    >
      <Keyboard className="h-4 w-4 mr-2" />
      <span className="hidden md:inline">Atajos</span>
    </Button>
  );
}
