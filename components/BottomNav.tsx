export default function BottomNav() {
  return (
    // Fixed to the bottom, with a top border and safe-area padding for modern phones
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        
        <button className="flex flex-col items-center justify-center w-full text-blue-500">
          <span className="text-xl">🏠</span>
          <span className="text-xs mt-1 font-medium">Home</span>
        </button>
        
        {/* We'll build these pages later when you start your automations! */}
        <button className="flex flex-col items-center justify-center w-full text-gray-400 hover:text-blue-500 transition-colors">
          <span className="text-xl">⚡</span>
          <span className="text-xs mt-1 font-medium">Automations</span>
        </button>
        
        <button className="flex flex-col items-center justify-center w-full text-gray-400 hover:text-blue-500 transition-colors">
          <span className="text-xl">⚙️</span>
          <span className="text-xs mt-1 font-medium">Settings</span>
        </button>

      </div>
    </nav>
  );
}