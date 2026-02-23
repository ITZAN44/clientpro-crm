'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    console.log('✅ KeyboardShortcuts montado');
    
    let lastKey = '';
    let lastKeyTime = 0;
    const SEQUENCE_TIMEOUT = 1000; // 1 segundo para completar secuencia

    const handleKeyDown = (e: KeyboardEvent) => {
      // Validar que e.key existe (previene error si es undefined)
      if (!e.key) {
        return;
      }

      const now = Date.now();
      const key = e.key.toLowerCase();
      
      // Debug
      console.log('Tecla presionada:', e.key, 'Ctrl:', e.ctrlKey, 'Shift:', e.shiftKey, 'Alt:', e.altKey);

      // Ignorar si está en input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Atajo de ayuda: h (sin modificadores)
      if (key === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        showHelp();
        return;
      }

      // Atajo de ayuda: ? (Shift + /)
      if (key === '?' || (e.shiftKey && key === '/')) {
        e.preventDefault();
        showHelp();
        return;
      }

      // Atajo de ayuda: Ctrl + /
      if (e.ctrlKey && key === '/') {
        e.preventDefault();
        showHelp();
        return;
      }

      // Secuencias con 'g'
      if (key === 'g' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        lastKey = 'g';
        lastKeyTime = now;
        console.log('🔑 Primera tecla "g" detectada, esperando segunda tecla...');
        toast.info('Presiona la segunda tecla...', { duration: 1000 });
        return;
      }

      // Si la última tecla fue 'g' y no pasó más de 1 segundo
      if (lastKey === 'g' && now - lastKeyTime < SEQUENCE_TIMEOUT) {
        e.preventDefault();
        
        switch (key) {
          case 'd':
            console.log('🚀 Atajo g+d detectado → Dashboard');
            router.push('/dashboard');
            toast.success('Navegando a Dashboard');
            break;
          case 'c':
            console.log('🚀 Atajo g+c detectado → Clientes');
            router.push('/clientes');
            toast.success('Navegando a Clientes');
            break;
          case 'n':
            console.log('🚀 Atajo g+n detectado → Negocios');
            router.push('/negocios');
            toast.success('Navegando a Negocios');
            break;
          case 'a':
            console.log('🚀 Atajo g+a detectado → Actividades');
            router.push('/actividades');
            toast.success('Navegando a Actividades');
            break;
          case 'r':
            console.log('🚀 Atajo g+r detectado → Reportes');
            router.push('/reportes');
            toast.success('Navegando a Reportes');
            break;
          default:
            console.log('⚠️ Secuencia g+' + key + ' no reconocida');
            toast.error('Atajo no reconocido');
        }
        
        lastKey = '';
        lastKeyTime = 0;
      }
    };

    const showHelp = () => {
      console.log('📖 Mostrando ayuda de atajos');
      toast.info(
        '⌨️ Atajos de teclado disponibles:\n\n' +
        'g luego d: Ir a Dashboard\n' +
        'g luego c: Ir a Clientes\n' +
        'g luego n: Ir a Negocios\n' +
        'g luego a: Ir a Actividades\n' +
        'g luego r: Ir a Reportes\n\n' +
        'h o ?: Ver esta ayuda\n\n' +
        '💡 Presiona "g" y luego la letra dentro de 1 segundo',
        { duration: 12000 }
      );
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  return null;
}

interface UseTableNavigationOptions {
  totalRows: number;
  onRowSelect: (index: number) => void;
  onEnter?: () => void;
}

export function useTableNavigation({ totalRows, onRowSelect, onEnter }: UseTableNavigationOptions) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useHotkeys('j', () => {
    setSelectedIndex((prev) => {
      const next = Math.min(prev + 1, totalRows - 1);
      onRowSelect(next);
      return next;
    });
  }, { preventDefault: true });

  useHotkeys('k', () => {
    setSelectedIndex((prev) => {
      const next = Math.max(prev - 1, 0);
      onRowSelect(next);
      return next;
    });
  }, { preventDefault: true });

  useHotkeys('enter', () => {
    if (onEnter) onEnter();
  }, { preventDefault: true });

  return selectedIndex;
}

