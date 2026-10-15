import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, ArrowDownToLine, X, Star } from 'lucide-react';

interface AndroidInstallBannerProps {
  onOpenModal: () => void;
}

export const AndroidInstallBanner: React.FC<AndroidInstallBannerProps> = ({
  onOpenModal,
}) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || isDismissed) {
    return null;
  }

  const handleQuickInstall = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        onOpenModal();
      }
    } else {
      onOpenModal();
    }
  };

  return (
    <aside
      aria-label="Android App Installation"
      className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/90 border-t border-amber-600/50 shadow-2xl backdrop-blur-md"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* App Icon + Info */}
        <div className="flex items-center space-x-3 min-w-0">
          <img
            src="/app-photo.jpg"
            alt="Isaac Christian Hub Logo"
            className="w-12 h-12 rounded-xl object-cover shadow-lg border border-amber-500/50 flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <h4 className="font-heading font-bold text-white text-sm truncate">
                Isaac Christian Hub
              </h4>
              <span className="hidden sm:inline-flex items-center text-[10px] text-amber-300 font-semibold bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                Android Ready
              </span>
            </div>
            <p className="text-xs text-stone-300 truncate">
              Install directly to your Android Home Screen & App Drawer
            </p>
          </div>
        </div>

        {/* Action Button & Dismiss */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={handleQuickInstall}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-950/40 transition hover:scale-105 active:scale-95"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Install on Android</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
