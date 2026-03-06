import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center px-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,163,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,163,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative text-center">
        <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-4">
          [ ERROR 404 ]
        </p>
        <h1 className="text-[8rem] md:text-[12rem] font-black tracking-tighter leading-none text-[#00FFA3] opacity-20 select-none">
          404
        </h1>
        <div className="-mt-8">
          <p className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-2">
            Page Not Found
          </p>
          <p className="text-sm text-white/40 mb-8">
            The route you requested does not exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#00FFA3] text-black text-xs px-8 py-3 uppercase tracking-widest font-bold hover:bg-white transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
