// hooks/useIoTData.ts
// This custom hook fetches data from the ESP32 and provides a toggle function for the relays.
// It also includes error handling and a fallback to mock data for UI development without the hardware.

"use client";

import { useState, useEffect, useRef } from 'react';

// You will change this to your ESP32's actual local IP address later!
const ESP32_IP = "http://192.168.1.XXX"; 

// 1. Move initial mock data outside so we can track it
const initialMockData = {
  env: { roomTemp: 24.5, roomHumidity: 45.2, internalTemp: 30.1, airQuality: 120 },
  power: { voltage: 230.1, current: 1.5, power: 345.0, energy: 12.5 },
  pir: { motion: false, time: 5000 },
  relays: { r1: true, ct1: true, r2: false, ct2: false, r3: true, ct3: false, r4: false, ct4: false },
  sys: { ramFree: 150, ramTotal: 320, cpuFreq: 240, uptime: 120 }
};

export function useIoTData() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);
  
  // 2. Use a ref to hold our mock state so the 1s interval doesn't reset your toggles
  const mockDataRef = useRef(initialMockData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${ESP32_IP}/api/data`);
        if (!res.ok) throw new Error("Network response was not ok");
        const json = await res.json();
        setData(json);
        setError(false);
      } catch (err) {
        setError(true);
        // 3. Fallback to our up-to-date mock reference instead of hardcoded values
        setData({ ...mockDataRef.current });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleRelay = async (id: number) => {
    try {
      await fetch(`${ESP32_IP}/api/relay?id=${id}`);
      // If hardware is real, the next 1s poll catches the updated state automatically
    } catch (err) {
      console.log("Hardware offline: Mocking toggle for relay", id);
      
      // 4. Update our mock data reference dynamically
      const relayKey = `r${id}` as keyof typeof mockDataRef.current.relays;
      const ctKey = `ct${id}` as keyof typeof mockDataRef.current.relays;
      
      // Flip the relay state
      mockDataRef.current.relays[relayKey] = !mockDataRef.current.relays[relayKey];
      
      // For UI testing realism, let's also pretend the CT Sensor detected the load change
      mockDataRef.current.relays[ctKey] = mockDataRef.current.relays[relayKey];

      // Instantly update the UI so the button toggles smoothly
      setData({ ...mockDataRef.current });
    }
  };

  return { data, error, toggleRelay };
}