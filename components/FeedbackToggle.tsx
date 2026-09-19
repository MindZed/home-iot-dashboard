// components/FeedbackToggle.tsx
// Interactive quick-toggle for mechanical sound and vibration haptics.

"use client";

import { Volume2, VolumeX, Smartphone } from "lucide-react";
import { useFeedback } from "@/hooks/useFeedback";

export default function FeedbackToggle() {
  const { soundOn, toggleSound } = useFeedback();

  return (
    <button
      onClick={toggleSound}
      className={`p-2.5 rounded-2xl border transition-all flex items-center justify-center relative ${
        soundOn
          ? "bg-[#131722] border-white/10 text-orange-400 hover:bg-[#1B2232]"
          : "bg-[#131722] border-white/10 text-neutral-500 hover:text-neutral-300"
      }`}
      aria-label={soundOn ? "Mute mechanical sounds" : "Enable mechanical sounds"}
      title={soundOn ? "Sound FX: Enabled (Click to Mute)" : "Sound FX: Muted (Click to Enable)"}
    >
      {soundOn ? (
        <Volume2 className="w-4 h-4" />
      ) : (
        <VolumeX className="w-4 h-4" />
      )}
    </button>
  );
}
