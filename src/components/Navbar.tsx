// src/components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { logout } from "@/lib/auth";
import { Leaf, Map, PlusCircle, User as UserIcon, LogOut } from "lucide-react";

export function Navbar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const link = (href: string, label: string, Icon: React.ElementType) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={""}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  };

return (
  <header className="sticky top-0 z-50">
    <div className="mx-auto mt-3 max-w-6xl rounded-2xl border border-slate-200/40 bg-white/60 shadow-sm backdrop-blur-xl">
      <nav className="flex items-center justify-between px-5 py-3 sm:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-700 text-white shadow-sm">
            <Leaf className="h-5 w-5" />
          </span>

          <span className="text-lg font-semibold text-slate-900 leading-none">
            BlueMind
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">

          <Link
            href="/map"
            className="group relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            <Map className="h-4 w-4" />
            <span className="relative">
              Map
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </span>
          </Link>

          {!loading && user ? (
            <>
              <Link
                href="/upload"
                className="group relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="relative">
                  Report
                  <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>

              <Link
                href="/profile"
                className="group relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
              >
                <UserIcon className="h-4 w-4" />
                <span className="relative">
                  Profile
                  <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>

              <button
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="ml-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:text-blue-600"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            !loading && (
              <Link
                href="/login"
                className="rounded-full bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:shadow-lg hover:scale-[1.02]"
              >
                Sign in
              </Link>
            )
          )}

        </div>
      </nav>
    </div>
  </header>
);
}
