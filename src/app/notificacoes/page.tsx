'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

const typeConfig: Record<string, { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: 'bg-primary/10 text-primary border-primary/20' },
  success: { icon: CheckCircle2, color: 'bg-secondary/10 text-secondary border-secondary/20' },
  warning: { icon: AlertTriangle, color: 'bg-accent/10 text-accent border-accent/20' },
};

export default function NotificacoesPage() {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead, fetchNotifications } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
      return;
    }
    fetchNotifications();
  }, [currentUser, router, fetchNotifications]);

  if (!currentUser) return null;

  const myNotifications = notifications
    .filter((n) => n.user_id === currentUser.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadCount = myNotifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <PageHeader
        title="Notificações"
        subtitle={`${unreadCount} não lida${unreadCount !== 1 ? 's' : ''}`}
        icon={<Bell size={24} />}
        action={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              icon={<CheckCheck size={16} />}
              onClick={markAllNotificationsRead}
            >
              Marcar todas como lidas
            </Button>
          ) : undefined
        }
      />

      {myNotifications.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-dark-lighter flex items-center justify-center text-gray mx-auto mb-4">
            <Bell size={36} />
          </div>
          <h3 className="text-lg font-semibold text-gray-lighter mb-2">Nenhuma notificação</h3>
          <p className="text-sm text-gray">Você será notificado sobre novidades aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myNotifications.map((notification, index) => {
            const config = typeConfig[notification.type] || typeConfig.info;
            const Icon = config.icon;

            return (
              <button
                key={notification.id}
                onClick={() => markNotificationRead(notification.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all animate-fade-in ${
                  notification.is_read
                    ? 'bg-dark-light/50 border-dark-lighter/50 opacity-60'
                    : `bg-dark-light ${config.color}`
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notification.is_read ? 'bg-dark-lighter text-gray' : config.color.split(' ').slice(0, 2).join(' ')
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-bold ${notification.is_read ? 'text-gray' : 'text-gray-lighter'}`}>
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray mt-0.5">{notification.message}</p>
                    <p className="text-[10px] text-gray mt-1.5">
                      {new Date(notification.created_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
