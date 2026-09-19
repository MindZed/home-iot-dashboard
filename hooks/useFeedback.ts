// hooks/useFeedback.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { feedback } from "@/lib/feedback";

export function useFeedback() {
  const [soundOn, setSoundOnState] = useState<boolean>(true);
  const [hapticsOn, setHapticsOnState] = useState<boolean>(true);

  useEffect(() => {
    setSoundOnState(feedback.isSoundOn());
    setHapticsOnState(feedback.isHapticsOn());

    const handleChange = () => {
      setSoundOnState(feedback.isSoundOn());
      setHapticsOnState(feedback.isHapticsOn());
    };

    window.addEventListener("homeiot_feedback_change", handleChange);
    return () => window.removeEventListener("homeiot_feedback_change", handleChange);
  }, []);

  const toggleSound = useCallback(() => {
    const next = !feedback.isSoundOn();
    feedback.setSoundOn(next);
    setSoundOnState(next);
    if (next) {
      feedback.playSwitchClick(true);
    }
  }, []);

  const toggleHaptics = useCallback(() => {
    const next = !feedback.isHapticsOn();
    feedback.setHapticsOn(next);
    setHapticsOnState(next);
    if (next) {
      feedback.triggerHaptic("medium");
    }
  }, []);

  return {
    soundOn,
    hapticsOn,
    toggleSound,
    toggleHaptics,
    playSwitchClick: (isOn: boolean) => feedback.playSwitchClick(isOn),
    playDialTick: () => feedback.playDialTick(),
    playSceneChime: () => feedback.playSceneChime(),
    playNavTap: () => feedback.playNavTap(),
    triggerHaptic: (type: "light" | "medium" | "heavy" | "selection" | "success") => feedback.triggerHaptic(type),
  };
}
