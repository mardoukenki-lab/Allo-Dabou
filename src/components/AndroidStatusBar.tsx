import React, { useState, useEffect } from 'react';
import { Wifi, Battery, BatteryCharging, Signal, Bell, Smartphone, ShieldCheck } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const [time, setTime] = useState<string>('');
  const [batteryLevel, setBatteryLevel] = useState<number | null>(88);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Update live clock
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Battery API if available in browser
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {
        // Fallback default
      });
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="w-full bg-[#111C2D] text-white/90 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono tracking-tight select-none border-b border-white/10 shrink-0 z-40">
      {/* Left: Clock & App Badge */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-white text-[12px]">{time || '06:00'}</span>
        <div className="flex items-center gap-1 bg-[#0D631B]/30 border border-[#0D631B]/50 px-1.5 py-0.5 rounded-full text-[9px] font-sans font-extrabold text-emerald-400">
          <Smartphone className="w-2.5 h-2.5 text-emerald-400" />
          <span>Android App</span>
        </div>
      </div>

      {/* Right: Network, Wi-Fi, Battery */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1 text-white/80">
          <Signal className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] font-sans font-bold">5G</span>
        </div>

        <Wifi className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-400' : 'text-red-400'}`} />

        <div className="flex items-center gap-1 text-white/90">
          <span className="text-[10px] font-bold">{batteryLevel !== null ? `${batteryLevel}%` : '85%'}</span>
          {isCharging ? (
            <BatteryCharging className="w-3.5 h-3.5 text-amber-300" />
          ) : (
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </div>
      </div>
    </div>
  );
};
