import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Share,
  Sparkles,
  ExternalLink,
  Shield,
  Star,
  Layers,
  ArrowDownToLine,
  X
} from 'lucide-react';

interface PlayStoreInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayStoreInstallModal: React.FC<PlayStoreInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-amber-600/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Showcase Header (Play Store style) */}
        <div className="flex items-start space-x-4 border-b border-stone-800 pb-5">
          <img
            src="/app-photo.jpg"
            alt="Isaac Christian Hub Logo"
            className="w-20 h-20 rounded-2xl object-cover shadow-xl border border-amber-500/40 flex-shrink-0"
          />
          <div className="space-y-1">
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
              Isaac Christian Hub
            </h3>
            <p className="text-xs text-amber-300 font-medium">
              Curated with Isaka Ambokile
            </p>
            <div className="flex items-center space-x-2 text-xs text-stone-400 pt-1">
              <span className="flex items-center text-amber-400 font-bold">
                5.0 <Star className="w-3 h-3 fill-amber-400 ml-0.5 inline" />
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Play Store Verified PWA</span>
            </div>
          </div>
        </div>

        {/* Installation Status & Primary Action */}
        <div className="space-y-4">
          {isInstalled || installSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-600/50 flex items-center space-x-3 text-emerald-300">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-emerald-400" />
              <div>
                <strong className="block text-sm font-bold text-white">
                  App Installed Successfully!
                </strong>
                <span className="text-xs">
                  Isaac Christian Hub is now installed on your Android device and ready in your app drawer.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center space-x-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-base shadow-xl shadow-amber-900/40 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowDownToLine className="w-5 h-5" />
                <span>Install on Android Device</span>
              </button>

              {/* Step by step for Android Chrome */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-amber-900/40 space-y-2.5 text-xs text-stone-200">
                <div className="flex items-center space-x-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                  <Smartphone className="w-4 h-4" />
                  <span>How to Install on Any Android Phone:</span>
                </div>
                <div className="space-y-2 pl-1 leading-relaxed">
                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</span>
                    <span>Tap the <strong>"Install on Android Device"</strong> button above, or tap the three dots (<strong className="text-white text-sm">⋮</strong>) in Google Chrome on your phone.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</span>
                    <span>Select <strong className="text-amber-300">"Install app"</strong> or <strong className="text-amber-300">"Add to Home screen"</strong> from the menu.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</span>
                    <span>Tap <strong className="text-white">Install</strong>. The Isaac Christian Hub icon will appear in your Android App Drawer just like a Play Store app!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isIOS && (
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>For iPhone / iPad Users:</span>
              </div>
              <p className="text-xs text-stone-300">
                Tap the <strong>Share</strong> button in Safari toolbar, then scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Play Store & PWA Features Checklist */}
        <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-2.5 text-xs text-stone-300">
          <span className="font-bold text-amber-300 block uppercase tracking-wider text-[11px]">
            Google Play Store & PWA Highlights:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Full Offline Capabilities</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>All World Languages Supported</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Instant Launch from Home Screen</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>No App Store Storage Bloat</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-800">
          <span>Version 1.0.0 • TWA PWA Ready</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
