"use client";

import { useState, useEffect } from "react";
import { Target, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Report", href: "/report" },
    { name: "Find", href: "/find" },
    { name: "Community", href: "/community" },
    { name: "Support", href: "/support" },
  ];

  const handleReportClick = () => {
    router.push('/report');
  };

  return (
    <>
      {/* Floating Navbar Container - No spacer needed */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-5 pointer-events-none">
        <nav
          className={cn(
            "pointer-events-auto transition-all duration-500 ease-out will-change-transform",
            "backdrop-blur-xl border shadow-sm",
            scrolled
              ? "bg-white/95 border-gray-200/80 shadow-md"
              : "bg-white/80 border-gray-200/50 shadow-sm"
          )}
          style={{
            width: scrolled ? "min(90%, 900px)" : "min(95%, 1200px)",
            borderRadius: scrolled ? "28px" : "40px",
            transform: scrolled ? "translateY(4px)" : "translateY(0)",
          }}
        >
          <div className="px-5 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link
                href="/"
                className="group flex items-center gap-2.5 transition-all duration-300 hover:scale-105"
              >
                <div className="relative">
                  <div className={cn(
                    "absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur-md transition-opacity duration-300",
                    scrolled ? "opacity-100" : "opacity-70"
                  )} />
                  <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full p-1.5 shadow-md">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="leading-tight">
                  <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    FindIT
                  </div>
                  <div className="text-[10px] text-gray-500 tracking-wide -mt-0.5">
                    Lost & Found
                  </div>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                      "text-gray-600 hover:text-blue-600",
                      "hover:bg-blue-50/80",
                      scrolled ? "text-gray-700" : "text-gray-600",
                      pathname === link.href && "bg-blue-50 text-blue-600"
                    )}
                  >
                    <span className="relative z-10">{link.name}</span>
                  </Link>
                ))}
              </div>

              {/* Desktop CTA */}
              <div className="hidden lg:block">
                <Button
                  onClick={handleReportClick}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-semibold text-white",
                    "bg-gradient-to-r from-blue-600 to-cyan-600",
                    "shadow-md hover:shadow-xl transition-all duration-300",
                    "hover:scale-105 active:scale-95",
                    scrolled ? "shadow-sm" : "shadow-md",
                    "group"
                  )}
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-full bg-gray-100/80 backdrop-blur-sm text-gray-700 hover:bg-gray-200 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Mobile Menu Panel */}
            <div
              className={cn(
                "lg:hidden overflow-hidden transition-all duration-400 ease-in-out",
                mobileMenuOpen ? "max-h-[600px] opacity-100 mt-4" : "max-h-0 opacity-0"
              )}
            >
              <div className="flex flex-col gap-2 py-3 border-t border-gray-100/80">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                      "text-gray-700 hover:text-blue-600 hover:bg-blue-50",
                      pathname === link.href && "bg-blue-50 text-blue-600"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleReportClick();
                  }}
                  className="mt-2 w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full group"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Spacer to prevent content jump - minimal */}
      <div className="h-20" />
    </>
  );
}
