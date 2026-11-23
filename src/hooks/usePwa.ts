import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

/**
 * Registra o service worker (/sw.js) e avisa quando há uma versão nova esperando.
 */
export function useNovaVersao() {
  const [esperando, setEsperando] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    let relogio: ReturnType<typeof setInterval> | undefined;

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        const ver = (w: ServiceWorker | null) => {
          if (w && navigator.serviceWorker.controller) setEsperando(w);
        };
        ver(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const w = reg.installing;
          w?.addEventListener('statechange', () => {
            if (w.state === 'installed') ver(w);
          });
        });
        // Atualiza a cada 1 hora se ficar aberto muito tempo
        relogio = setInterval(() => void reg.update().catch(() => {}), 60 * 60 * 1000);
      })
      .catch((err) => {
        console.warn('Service worker registration failed:', err);
      });

    return () => clearInterval(relogio);
  }, []);

  const atualizar = useCallback(() => {
    if (!esperando) return;
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => location.reload(),
      { once: true }
    );
    esperando.postMessage('atualizar');
  }, [esperando]);

  return { novaVersao: !!esperando, atualizar };
}

interface PedidoInstalacao extends Event {
  prompt(): Promise<void>;
}

let pedido: PedidoInstalacao | null = null;
const ouvintes = new Set<() => void>();
const mudou = () => ouvintes.forEach((f) => f());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    pedido = e as PedidoInstalacao;
    mudou();
  });
  window.addEventListener('appinstalled', () => {
    pedido = null;
    mudou();
  });
}

const escutar = (f: () => void) => {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
};

export type ModoInstalacao = 'botao' | 'iphone' | null;

/**
 * 'botao': dá para instalar com 1 toque (Android/Chrome/Edge/Desktop);
 * 'iphone': Safari no iOS (orienta usar Compartilhar -> Adicionar à Tela de Início);
 * null: já instalado ou navegador não oferece suporte.
 */
export function useInstalar() {
  const disponivel = useSyncExternalStore(escutar, () => pedido !== null, () => false);
  const instalado =
    typeof window !== 'undefined'
      ? (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
        (navigator as { standalone?: boolean }).standalone === true
      : false;

  const iphone =
    typeof window !== 'undefined'
      ? /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      : false;

  const modo: ModoInstalacao = instalado ? null : disponivel ? 'botao' : iphone ? 'iphone' : null;

  const instalar = useCallback(async () => {
    const p = pedido;
    pedido = null;
    mudou();
    await p?.prompt();
  }, []);

  return { modo, instalado, instalar };
}
