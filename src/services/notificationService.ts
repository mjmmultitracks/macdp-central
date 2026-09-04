// Serviço de Notificações do Aplicativo da Igreja
// Suporta Web Notifications API, Service Worker Push e Chime Sonoro via Web Audio

export interface PushPermissionState {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
}

export function checkNotificationSupport(): PushPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { isSupported: false, permission: 'unsupported' };
  }
  return {
    isSupported: true,
    permission: Notification.permission,
  };
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      playNotificationChime();
      sendNativePushNotification('Notificações Ativadas! 🙏', {
        body: 'Você receberá avisos de cultos ao vivo, devocionais e novidades da igreja diretamente aqui.',
        icon: '/images/logo.png',
      });
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Erro ao solicitar permissão de notificações:', err);
    return false;
  }
}

export function sendNativePushNotification(title: string, options?: NotificationOptions): void {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      // Haptic feedback em dispositivos móveis compatíveis
      if ('vibrate' in navigator) {
        navigator.vibrate([80, 40, 80]);
      }

      // Tenta via Service Worker se registrado para melhor suporte móvel (PWA)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          const notificationOptions: NotificationOptions & { vibrate?: number[] } = {
            icon: '/images/logo.png',
            badge: '/images/logo.png',
            vibrate: [80, 40, 80],
            ...options,
          };
          (registration as any).showNotification(title, notificationOptions);
        });
      } else {
        new Notification(title, {
          icon: '/images/logo.png',
          ...options,
        });
      }

      playNotificationChime();
    } catch (err) {
      console.warn('Erro ao disparar notificação nativa:', err);
    }
  }
}

// Chime sonoro pacífico gerado via Web Audio API (sem dependências externas)
export function playNotificationChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Duas notas harmônicas (D5 -> A5)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.1);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  } catch (e) {
    // Silently ignore audio context block if user hasn't interacted yet
  }
}
