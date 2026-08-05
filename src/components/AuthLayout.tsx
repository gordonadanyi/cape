import type { ReactNode } from "react";

export default function AuthLayout({
  tagline,
  children,
}: {
  tagline: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDF8F2] p-6 font-candara">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-[0_30px_80px_rgba(15,27,61,0.12)] md:grid-cols-2">
        {/* Left — brand panel, mirrors the landing page hero */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#1E56CD] p-10 md:flex">
          <div className="pointer-events-none absolute inset-0">
            <span className="drift-a absolute left-[-3rem] top-10 h-40 w-40 rounded-full bg-white/[0.06]" />
            <span className="drift-c absolute right-[-2rem] top-[45%] h-28 w-28 rounded-full bg-white/[0.07]" />
            <span className="drift-e absolute bottom-16 left-10 h-20 w-20 rounded-full bg-white/[0.08]" />
          </div>

          <span className="relative text-2xl font-bold tracking-tight text-white">
            CAPE
          </span>

          <p className="relative max-w-xs text-2xl font-semibold leading-snug text-white">
            {tagline}
          </p>
        </div>

        {/* Right — form panel */}
        <div className="flex flex-col justify-center p-10 md:p-14">
          {children}
        </div>
      </div>
    </div>
  );
}