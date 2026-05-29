export default function SoldOutOverlay({ isVisible, itemName, className = '' }) {
  if (!isVisible) return null;

  return (
    <div
      className={`absolute inset-0 z-[5] pointer-events-none ${className}`}
      aria-hidden={!itemName}
    >
      <div className="absolute inset-0 bg-[#0c0c1d]/55 backdrop-blur-[1px]" />
      <div
        className="absolute top-3 -right-8 w-32 bg-error text-white text-[10px] font-black uppercase tracking-wider text-center py-1 rotate-45 shadow-lg"
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.35)' }}
      >
        Sold Out
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-[#ffb4ab] font-black text-sm uppercase tracking-widest drop-shadow-lg">
          Sold Out
        </p>
      </div>
      {itemName && (
        <span className="sr-only">{itemName} is sold out today</span>
      )}
    </div>
  );
}
