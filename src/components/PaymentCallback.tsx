import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';

type CallbackType = 'finish' | 'unfinish' | 'error';

interface PaymentCallbackProps {
  type: CallbackType;
  onGoToDashboard: () => void;
}

interface OrderInfo {
  orderId?: string;
  status?: string;
  amount?: number;
}

export function PaymentCallback({ type, onGoToDashboard }: PaymentCallbackProps) {
  const [orderInfo, setOrderInfo] = useState<OrderInfo>({});
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // Read Midtrans query params from URL
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id') || params.get('transaction_id') || undefined;
    const status = params.get('transaction_status') || undefined;

    setOrderInfo({ orderId, status });

    // If finish callback with an order ID, verify against backend
    if (type === 'finish' && orderId) {
      setVerifying(true);
      fetch(`/api/payments/verify/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      })
        .then(r => r.json())
        .then(data => {
          setOrderInfo(prev => ({ ...prev, status: data.status, amount: data.donation?.amount }));
        })
        .catch(() => {/* silent */})
        .finally(() => setVerifying(false));
    }
  }, [type]);

  const config = {
    finish: {
      icon: CheckCircle2,
      iconColor: '#22c55e',
      iconBg: 'rgba(34,197,94,0.12)',
      ringColor: 'rgba(34,197,94,0.25)',
      title: 'Donasi Berhasil!',
      subtitle: 'Jazakallahu khairan katsiran. Donasi Anda telah kami terima dan akan segera disalurkan kepada mustahik yang membutuhkan.',
      badge: { text: 'Pembayaran Sukses', bg: 'rgba(34,197,94,0.15)', color: '#16a34a', border: 'rgba(34,197,94,0.3)' },
      gradient: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)',
      border: 'rgba(34,197,94,0.4)',
    },
    unfinish: {
      icon: Clock,
      iconColor: '#f59e0b',
      iconBg: 'rgba(245,158,11,0.12)',
      ringColor: 'rgba(245,158,11,0.25)',
      title: 'Pembayaran Belum Selesai',
      subtitle: 'Sepertinya Anda keluar sebelum menyelesaikan pembayaran. Pesanan Anda masih tersimpan dan dapat dilanjutkan kapan saja.',
      badge: { text: 'Menunggu Pembayaran', bg: 'rgba(245,158,11,0.15)', color: '#d97706', border: 'rgba(245,158,11,0.3)' },
      gradient: 'linear-gradient(135deg, #1c1003 0%, #451a03 100%)',
      border: 'rgba(245,158,11,0.4)',
    },
    error: {
      icon: XCircle,
      iconColor: '#ef4444',
      iconBg: 'rgba(239,68,68,0.12)',
      ringColor: 'rgba(239,68,68,0.25)',
      title: 'Pembayaran Gagal',
      subtitle: 'Terjadi kendala dalam proses pembayaran Anda. Tidak ada dana yang dikurangi. Silakan coba kembali atau gunakan metode pembayaran lain.',
      badge: { text: 'Pembayaran Gagal', bg: 'rgba(239,68,68,0.15)', color: '#dc2626', border: 'rgba(239,68,68,0.3)' },
      gradient: 'linear-gradient(135deg, #1c0404 0%, #450a0a 100%)',
      border: 'rgba(239,68,68,0.4)',
    }
  }[type];

  const Icon = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at center top, #0f172a 0%, #020617 100%)',
      }}>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute rounded-full"
          style={{ top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: config.ringColor, filter: 'blur(120px)', opacity: 0.5 }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: config.gradient, border: `1px solid ${config.border}`, boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 40px ${config.ringColor}` }}>

          {/* Top accent bar */}
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${config.iconColor}, transparent)` }} />

          <div className="p-8 text-center">
            {/* Pulsing icon */}
            <div className="relative inline-flex mb-6">
              <div className="absolute inset-0 rounded-full animate-ping"
                style={{ background: config.ringColor, animationDuration: '2s' }} />
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: config.iconBg, border: `2px solid ${config.border}` }}>
                <Icon size={36} style={{ color: config.iconColor }} />
              </div>
            </div>

            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-4"
              style={{ background: config.badge.bg, color: config.badge.color, border: `1px solid ${config.badge.border}` }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: config.badge.color }} />
              {config.badge.text}
            </div>

            <h1 className="text-2xl font-extrabold text-white mb-3">{config.title}</h1>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{config.subtitle}</p>

            {/* Order Info */}
            {(orderInfo.orderId || orderInfo.amount) && (
              <div className="mt-6 rounded-xl p-4 text-left space-y-2"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {orderInfo.orderId && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Order ID</span>
                    <span className="font-mono text-white text-xs">{orderInfo.orderId}</span>
                  </div>
                )}
                {orderInfo.amount && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Jumlah</span>
                    <span className="font-semibold text-white">Rp {orderInfo.amount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {verifying && (
                  <div className="flex items-center gap-2 justify-center py-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <Loader2 size={12} className="animate-spin" />
                    <span className="text-xs">Memverifikasi status pembayaran...</span>
                  </div>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={onGoToDashboard}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: config.iconColor, color: '#fff', boxShadow: `0 4px 20px ${config.ringColor}` }}
              >
                Kembali ke Dashboard
                <ArrowRight size={16} />
              </button>

              {type === 'unfinish' && (
                <button
                  onClick={() => history.back()}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <RefreshCw size={15} />
                  Coba Lagi
                </button>
              )}

              {type === 'error' && (
                <button
                  onClick={() => history.back()}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <RefreshCw size={15} />
                  Coba Donasi Lagi
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Sistem Pengelolaan Zakat Produktif • Aman & Terpercaya
        </p>
      </div>
    </div>
  );
}
