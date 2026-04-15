// app/page.tsx
// This is the main page of the IoT dashboard. It displays a header and a grid of device cards.
// Each device card represents a smart device in the room, allowing the user to toggle its state on or off.

"use client"; // We need this now because we use hooks

import DeviceCard from '@/components/DeviceCard';
import BottomNav from '@/components/BottomNav';
import { useIoTData } from '../hooks/useIoTData';

export default function Home() {
  const { data, toggleRelay } = useIoTData();

  // Show a simple loading state while waiting for the first fetch
  if (!data) return <div className="flex items-center justify-center h-screen bg-gray-50">Loading hardware data...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <main className="flex-1 overflow-y-auto p-6 pb-24"> 
        <div className="max-w-md mx-auto">
          
          <header className="mb-6 pt-4 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Room</h1>
              {/* Show PIR Status right in the header! */}
              <p className={`mt-1 font-medium ${data.pir.motion ? 'text-red-500' : 'text-gray-500'}`}>
                {data.pir.motion ? '🚶 Motion Detected' : 'Room is clear'}
              </p>
            </div>
            <div className="text-right">
               <div className="text-2xl font-bold text-gray-800">{data.env.roomTemp.toFixed(1)}°C</div>
            </div>
          </header>
          
          <div className="flex flex-col gap-4">
            {/* Mapping exactly to Relay 1 through 4 from your C++ code */}
            <DeviceCard 
              id={1} title="Main Light" type="light" 
              isOn={data.relays.r1} hasLoad={data.relays.ct1} onToggle={toggleRelay} 
            />
            <DeviceCard 
              id={2} title="Ceiling Fan" type="fan" 
              isOn={data.relays.r2} hasLoad={data.relays.ct2} onToggle={toggleRelay} 
            />
            <DeviceCard 
              id={3} title="Desk Lamp" type="light" 
              isOn={data.relays.r3} hasLoad={data.relays.ct3} onToggle={toggleRelay} 
            />
            <DeviceCard 
              id={4} title="Spare Plug" type="plug" 
              isOn={data.relays.r4} hasLoad={data.relays.ct4} onToggle={toggleRelay} 
            />
          </div>

        </div>
      </main>
      <BottomNav />
    </div>
  );
}