

"use client";
import { useEffect, useState } from "react";

export default function Loading() {
  const [show, setShow] = useState(true);

  useEffect(() => {

    const timer = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <img
    src="/image/logo.jpeg"
        alt="Logo"
        className="w-24 h-24 rounded-xl animate-spin-smooth"
      />
      <style jsx global>{`
        @keyframes spin-smooth {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-smooth {
          animation: spin-smooth 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
}
