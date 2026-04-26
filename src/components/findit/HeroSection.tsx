"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  TrendingUp,
  Package,
  Shield,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";

interface HeroSectionProps {
  stats: { totalItems: number; successRate: number; activeUsers: number };
}

export function HeroSection({ stats }: HeroSectionProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="home"
      className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden font-sans"
    >
      {/* Animated Background Glows */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/15 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-400/15 blur-[120px] rounded-full animate-pulse-slow delay-1000" />
        <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-purple-400/10 blur-[100px] rounded-full animate-float-slow" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200/80 shadow-sm rounded-full px-4 py-1.5 mb-6 hover:shadow-md transition-all duration-300 animate-fade-up group cursor-pointer">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
              Trusted by 500+ students
            </span>
            <Sparkles className="h-3 w-3 text-gray-400 group-hover:text-yellow-500 transition-colors" />
          </div>

          {/* Main Headline */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 leading-tight animate-fade-up delay-100">
            <span className="text-gray-900">
              Find what you lost.
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent bg-300% animate-gradient">
              Recover it faster.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="font-sans text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-up delay-200">
            A modern lost & found platform built for students. Report,
            discover, and reconnect with your belongings in seconds.
          </p>

          {/* CTA Button */}
          <div className="animate-fade-up delay-300">
            <button className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-sans">
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Stats Row - Redesigned */}
          <div className="flex flex-wrap justify-center gap-8 mt-10 animate-fade-up delay-400">
            <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group font-sans">
              <div className="p-1.5 bg-green-100 rounded-full group-hover:scale-110 transition-transform">
                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              </div>
              <span className="font-medium">100% Free</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group font-sans">
              <div className="p-1.5 bg-blue-100 rounded-full group-hover:scale-110 transition-transform">
                <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span className="font-medium">{stats.successRate}% Recovery Rate</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group font-sans">
              <div className="p-1.5 bg-cyan-100 rounded-full group-hover:scale-110 transition-transform">
                <Package className="h-3.5 w-3.5 text-cyan-600" />
              </div>
              <span className="font-medium">{stats.totalItems}+ Items Found</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group font-sans">
              <div className="p-1.5 bg-purple-100 rounded-full group-hover:scale-110 transition-transform">
                <Users className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <span className="font-medium">{stats.activeUsers}+ Active Users</span>
            </div>
          </div>
        </div>

        {/* Product Showcase - Enhanced */}
        <div className="max-w-5xl mx-auto mt-16 lg:mt-20 animate-fade-up delay-500">
          <div className="relative">
            {/* Outer Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Mac-style Frame */}
            <div className="relative bg-black rounded-2xl shadow-2xl border border-gray-800 overflow-hidden group">
              {/* Window Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-black/95 border-b border-gray-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-gray-500 font-medium font-sans">FindIT - Dashboard</span>
                </div>
                <div className="w-12" />
              </div>

              {/* Image Container */}
              <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                <Image
                  src="/images/hero-img.jpg"
                  alt="FindIT platform preview"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                {/* Floating Badge */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg animate-float">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-semibold text-gray-800 font-sans">Live Demo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges Row - Enhanced */}
        <div className="flex flex-wrap justify-center gap-8 mt-12 text-xs text-gray-500 animate-fade-up delay-600">
          <div className="flex items-center gap-2 hover:text-gray-700 transition-colors group font-sans">
            <div className="p-1 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
              <Shield className="h-3 w-3" />
            </div>
            <span>Secure & Safe</span>
          </div>

          <div className="w-px h-4 bg-gray-300" />

          <div className="flex items-center gap-2 hover:text-gray-700 transition-colors group font-sans">
            <div className="p-1 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
              <Clock className="h-3 w-3" />
            </div>
            <span>24/7 Available</span>
          </div>

          <div className="w-px h-4 bg-gray-300" />

          <div className="flex items-center gap-2 hover:text-gray-700 transition-colors group font-sans">
            <div className="p-1 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
              <CheckCircle className="h-3 w-3" />
            </div>
            <span>Verified Reports</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow hidden lg:block">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium font-sans">
            Scroll to explore
          </span>
          <div className="w-5 h-8 border-2 border-gray-300 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-gray-400 rounded-full mt-1 animate-scroll" />
          </div>
        </div>
      </div>
    </section>
  );
}
