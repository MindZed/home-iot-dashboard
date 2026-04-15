// components/DeviceCard.tsx
// This component represents a single device card in the dashboard. It displays the device's name, type, and current state (on/off).
// It also includes a toggle switch to change the device's state.
// The actual API call to control the device will be added later.

"use client";

interface DeviceCardProps {
  id: number;
  title: string;
  type: 'light' | 'fan' | 'plug';
  isOn: boolean;
  hasLoad: boolean; // From your CT sensors!
  onToggle: (id: number) => void;
}

export default function DeviceCard({ id, title, type, isOn, hasLoad, onToggle }: DeviceCardProps) {
  
  // Icon selector based on type
  const getIcon = () => {
    if (type === 'light') return '💡';
    if (type === 'fan') return '🌀';
    return '🔌';
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        
        {/* Icon container */}
        <div className={`flex items-center justify-center w-12 h-12 text-2xl rounded-full transition-colors ${isOn ? 'bg-blue-100' : 'bg-gray-100'}`}>
           {getIcon()}
        </div>
        
        {/* Title and Hardware Status */}
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-medium text-gray-500">{isOn ? 'ON' : 'OFF'}</span>
            
            {/* The CT Sensor Load Indicator */}
            {isOn && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${hasLoad ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {hasLoad ? '⚡ LOAD' : '⚠️ NO LOAD'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Custom Toggle Switch */}
      <button 
        onClick={() => onToggle(id)}
        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${isOn ? 'bg-blue-500' : 'bg-gray-300'}`}
      >
        <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isOn ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </button>
    </div>
  );
}