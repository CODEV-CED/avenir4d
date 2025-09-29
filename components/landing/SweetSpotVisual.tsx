export default function SweetSpotVisual() {
  return (
    <div className="relative h-[300px] w-[300px] transition-transform duration-300 hover:scale-105 md:h-[400px] md:w-[400px]">
      {/* Halo animé */}
      <div className="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-white/20 blur-xl" />

      {/* Cercles */}
      <div className="absolute top-0 left-0 h-full w-full">
        <div className="absolute top-0 left-10 h-40 w-40 rounded-full bg-red-500/40 mix-blend-screen" />
        <div className="absolute top-0 left-20 h-40 w-40 rounded-full bg-emerald-500/40 mix-blend-screen" />
        <div className="absolute top-10 left-15 h-40 w-40 rounded-full bg-sky-500/40 mix-blend-screen" />
        <div className="absolute top-20 left-10 h-40 w-40 rounded-full bg-yellow-400/40 mix-blend-screen" />
      </div>
    </div>
  );
}
