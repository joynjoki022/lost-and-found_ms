"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import EventsSection from "@/components/EventsSection";
import VolunteerSection from "@/components/VolunteerSection";
import GallerySection from "@/components/GallerySection";
import SupportSection from "@/components/SupportSection";
import { ChevronDown, Sparkles, Star, Zap, Users, Target, Calendar, Award, Heart, Shield, X, ExternalLink, CheckCircle } from "lucide-react";
import Image from "next/image";
import JoinMovementModal from '../components/JoinMovementModal';
import { getCampaignStats } from '../../lib/supabase/functions';

export default function Home() {
  const [joinedCount, setJoinedCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [particles, setParticles] = useState<Array<{ width: number; height: number; left: number; top: number; duration: number; delay: number }>>([]);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [mounted, setMounted] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showIebcModal, setShowIebcModal] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [stats, setStats] = useState({
    totalSupporters: 0,
    constituencies: 8,
    wards: 40,
    recentRegistrations: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationStarted, setAnimationStarted] = useState(false);

  const hashtags = ["#MULILATheThird", "#NikoNaKitui", "#WorkingToday", "#BuildingTomorrow"];

  // Fetch real supporter count using the campaign-stats function
  const fetchSupporterStats = useCallback(async () => {
    console.log("📊 [Home] Starting to fetch campaign statistics...");
    console.log("⏰ [Home] Timestamp:", new Date().toISOString());

    try {
      setIsLoadingStats(true);
      setError(null);

      console.log("🔄 [Home] Calling getCampaignStats() function...");
      const result = await getCampaignStats();

      console.log("✅ [Home] Campaign stats received:", {
        success: result.success,
        hasData: !!result.data,
        totalSupporters: result.data?.totalSupporters,
        recentRegistrations: result.data?.recentRegistrations
      });

      if (result.success && result.data) {
        const newTotal = result.data.totalSupporters || 0;
        console.log("📈 [Home] Updating stats with:", result.data);
        setStats({
          totalSupporters: newTotal,
          constituencies: result.data.constituencies || 8,
          wards: result.data.wards || 40,
          recentRegistrations: result.data.recentRegistrations || 0
        });

        // Immediately set the count without animation
        setJoinedCount(newTotal);
        setDisplayCount(newTotal);
        console.log("🎉 [Home] Stats updated successfully!");
      } else {
        console.warn("⚠️ [Home] No data in response, using fallback values");
        setJoinedCount(0);
        setDisplayCount(0);
      }

    } catch (error) {
      console.error("❌ [Home] Error fetching supporter stats:", error);
      setError(error instanceof Error ? error.message : "Failed to load statistics");
      setJoinedCount(0);
      setDisplayCount(0);
    } finally {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setIsLoadingStats(false);
      }, 500);
      console.log("🏁 [Home] Stats loading completed. isLoadingStats:", false);
    }
  }, []);

  // Generate particles only on client side to avoid hydration mismatch
  useEffect(() => {
    console.log("🎨 [Home] Setting up particles and fetching data...");
    setMounted(true);
    const generatedParticles = Array.from({ length: 20 }, () => ({
      width: Math.random() * 4 + 1,
      height: Math.random() * 4 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 5 + 3,
      delay: Math.random() * 5,
    }));
    setParticles(generatedParticles);
    console.log("✨ [Home] Generated", generatedParticles.length, "particles");

    // Fetch supporter stats immediately
    fetchSupporterStats();
  }, [fetchSupporterStats]);

  // Countdown to election day (August 9, 2027)
  useEffect(() => {
    console.log("⏰ [Home] Setting up countdown timer...");

    const electionDate = new Date(2027, 7, 9, 0, 0, 0);
    console.log("📅 [Home] Election date set to:", electionDate.toISOString());

    const updateCountdown = () => {
      const now = new Date();
      const difference = electionDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
    console.log("⏰ [Home] Countdown timer started");

    return () => {
      clearInterval(countdownInterval);
      console.log("🛑 [Home] Countdown timer cleaned up");
    };
  }, []);

  const handleOpenIebcModal = () => {
    console.log("🔓 [Home] Opening IEBC verification modal");
    setShowIebcModal(true);
    setIframeError(false);
  };
  const refreshStats = useCallback(() => {
    console.log("🔄 Refreshing campaign stats after successful registration...");
    fetchSupporterStats();
  }, [fetchSupporterStats]);

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="inline-flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gold/20 animate-spin">
          <div className="absolute top-0 left-0 w-16 h-16 md:w-20 md:h-20 rounded-full border-t-4 border-gold border-r-4 border-gold/30 animate-spin" />
        </div>
        {/* Inner pulsing dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-gold rounded-full animate-pulse" />
        </div>
      </div>
      <p className="mt-3 text-xs text-gold/80 animate-pulse">Loading...</p>
    </div>
  );


  // Format display count - show loading skeleton or "Be the 1st one"
  const getDisplayText = () => {
    if (isLoadingStats) {
      return <LoadingSpinner />;
    }
    if (displayCount === 0) {
      return <span className="text-4xl md:text-5xl lg:text-6xl font-black">Be the 1st one!</span>;
    }
    return <span className="text-5xl md:text-6xl lg:text-7xl font-black">{displayCount.toLocaleString()}</span>;
  };

  // Get supporter count for stats row
  const getStatsCount = () => {
    if (isLoadingStats) {
      return <div className="h-8 w-20 bg-gold/20 rounded animate-pulse mx-auto"></div>;
    }
    return displayCount === 0 ? "0" : displayCount.toLocaleString();
  };

  console.log("🎯 [Home] Current state:", {
    joinedCount,
    displayCount,
    isLoadingStats,
    error,
    showJoinModal,
    showIebcModal,
    timeLeft
  });

  return (
    <main>
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0">
            <Image
              src="/images/profile1.jpg"
              alt="Hon. Nicholas Mulila - Background"
              fill
              priority
              className="object-cover object-center"
              quality={100}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/90 via-bg-dark/80 to-bg-dark/95" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent" />

          {/* Animated Gradient Orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="animate-float absolute -left-64 -top-64 h-96 w-96 rounded-full bg-gold/15 blur-3xl" />
            <div className="animate-float absolute -bottom-64 -right-64 h-96 w-96 rounded-full bg-gold/10 blur-3xl" style={{ animationDelay: "5s" }} />
          </div>

          {/* Animated Particles */}
          {mounted && (
            <div className="absolute inset-0 overflow-hidden">
              {particles.map((particle, i) => (
                <div
                  key={i}
                  className="absolute animate-pulse rounded-full bg-gold/20"
                  style={{
                    width: `${particle.width}px`,
                    height: `${particle.height}px`,
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    animationDuration: `${particle.duration}s`,
                    animationDelay: `${particle.delay}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Hero Content - Responsive Layout */}
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-20 lg:py-24">

          {/* Mobile Layout */}
          <div className="block lg:hidden">
            <div className="mx-auto max-w-4xl space-y-6">

              {/* Hero Title */}
              <div className="animate-fade-up text-center opacity-0" style={{ animationDelay: "0.1s" }}>
                <h1 className="font-montserrat text-3xl font-black leading-tight">
                  <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                    HON. NICHOLAS MULILA
                  </span>
                  <br />
                  <span className="text-xl text-text-light">FOR GOVERNOR</span>
                  <br />
                  <span className="text-base text-gold">KITUI COUNTY</span>
                </h1>
                <div className="mt-3 inline-block rounded-full border border-gold/30 bg-gold/10 px-3 py-1">
                  <p className="text-xs font-semibold text-gold">Working Today, Building Tomorrow</p>
                </div>
              </div>

              {/* Counter Card */}
              <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.15s" }}>
                <Card className="relative overflow-hidden border border-gold/20 bg-bg-dark/90 shadow-xl backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent" />

                  <div className="relative text-center">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1">
                      <Users className="h-3 w-3 text-gold" />
                      <span className="text-xs font-bold text-gold">TEAM MULILA</span>
                    </div>

                    <div className="text-5xl font-black text-gold">
                      {getDisplayText()}
                    </div>

                    <p className="mt-1 text-sm font-semibold text-text-light">
                      {isLoadingStats ? "Loading supporters..." : (displayCount === 0 ? "Join the movement today!" : "Strong Supporters & Growing")}
                    </p>

                    <div className="mx-auto mt-3 max-w-xs">
                      <div className="h-1.5 overflow-hidden rounded-full bg-gold/20">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-all duration-1000"
                          style={{ width: isLoadingStats ? "0%" : `${Math.min(100, (displayCount / 200000) * 100)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-text-dim">Target: 200,000 Supporters</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Stats Row */}
              <div className="animate-fade-up flex justify-center gap-6 opacity-0" style={{ animationDelay: "0.25s" }}>
                <div className="text-center">
                  <div className="text-xl font-bold text-gold">{getStatsCount()}</div>
                  <div className="text-[10px] text-text-dim">Supporters</div>
                </div>
                <div className="w-px h-8 bg-gold/20" />
                <div className="text-center">
                  <div className="text-xl font-bold text-gold">{isLoadingStats ? <div className="h-6 w-8 bg-gold/20 rounded animate-pulse mx-auto"></div> : stats.constituencies}</div>
                  <div className="text-[10px] text-text-dim">Constituencies</div>
                </div>
                <div className="w-px h-8 bg-gold/20" />
                <div className="text-center">
                  <div className="text-xl font-bold text-gold">{isLoadingStats ? <div className="h-6 w-8 bg-gold/20 rounded animate-pulse mx-auto"></div> : `${stats.wards}+`}</div>
                  <div className="text-[10px] text-text-dim">Wards</div>
                </div>
              </div>

              {/* Countdown + Je Uko Kadi Button */}
              <div className="animate-fade-up text-center opacity-0" style={{ animationDelay: "0.3s" }}>
                <div className="inline-flex flex-col items-center gap-3 rounded-2xl border border-gold/20 bg-bg-card/40 px-5 py-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gold" />
                    <span className="text-xs font-bold text-gold">ELECTION DAY COUNTDOWN</span>
                    <Target className="h-4 w-4 text-gold" />
                  </div>
                  <div className="flex gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gold">{timeLeft.days}</div>
                      <div className="text-[10px] text-text-dim">Days</div>
                    </div>
                    <div className="text-2xl font-bold text-gold">:</div>
                    <div>
                      <div className="text-2xl font-bold text-gold">{timeLeft.hours}</div>
                      <div className="text-[10px] text-text-dim">Hours</div>
                    </div>
                    <div className="text-2xl font-bold text-gold">:</div>
                    <div>
                      <div className="text-2xl font-bold text-gold">{timeLeft.minutes}</div>
                      <div className="text-[10px] text-text-dim">Mins</div>
                    </div>
                    <div className="text-2xl font-bold text-gold">:</div>
                    <div>
                      <div className="text-2xl font-bold text-gold">{timeLeft.seconds}</div>
                      <div className="text-[10px] text-text-dim">Secs</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-text-dim">August 9, 2027</p>

                  <button
                    onClick={handleOpenIebcModal}
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-gold/20 px-4 py-2 text-sm font-semibold text-gold transition-all hover:bg-gold hover:text-bg-dark"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Je, Uko Kadi?
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="animate-fade-up flex flex-col gap-3 sm:flex-row sm:justify-center opacity-0" style={{ animationDelay: "0.35s" }}>
                <Button variant="primary" onClick={() => setShowJoinModal(true)}>
                  Join The Movement
                </Button>
                <Button variant="secondary" onClick={() => document.getElementById("support")?.scrollIntoView({ behavior: "smooth" })}>
                  Support Us
                </Button>
              </div>

              {/* Hashtags */}
              <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.4s" }}>
                <div className="flex flex-wrap justify-center gap-2">
                  {hashtags.map((tag, idx) => (
                    <span key={idx} className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-16 items-center min-h-[80vh]">

              {/* Left Column - Hero Text */}
              <div className="space-y-8">
                <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 backdrop-blur-sm opacity-0" style={{ animationDelay: "0.1s" }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                  <span className="text-xs font-semibold tracking-wider text-gold">KITUI COUNTY 2027</span>
                </div>

                <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
                  <h1 className="font-montserrat text-6xl font-black leading-tight xl:text-7xl">
                    <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                      MULILA
                    </span>
                    <br />
                    <span className="text-3xl text-text-light xl:text-4xl">For Governor, Kitui County</span>
                  </h1>
                  <p className="mt-4 text-lg text-text-dim border-l-2 border-gold/30 pl-4">
                    "Working Today, Building Tomorrow"
                  </p>
                </div>

                <div className="animate-fade-up group relative opacity-0" style={{ animationDelay: "0.3s" }}>
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-gold/30 to-gold/10 blur opacity-0 transition duration-500 group-hover:opacity-100" />
                  <div className="relative rounded-2xl border border-gold/20 bg-bg-card/50 px-6 py-4 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-gold" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gold">Your Next Governor</p>
                        <h2 className="font-playfair text-2xl font-bold text-gold">HON. NICHOLAS MULILA</h2>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="animate-fade-up flex gap-6 opacity-0" style={{ animationDelay: "0.4s" }}>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gold" />
                    <div>
                      <div className="text-xl font-bold text-text-light">{getStatsCount()}</div>
                      <div className="text-xs text-text-dim">Supporters</div>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-gold/20" />
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-gold" />
                    <div>
                      <div className="text-xl font-bold text-text-light">{isLoadingStats ? <div className="h-6 w-8 bg-gold/20 rounded animate-pulse"></div> : stats.constituencies}</div>
                      <div className="text-xs text-text-dim">Constituencies</div>
                    </div>
                  </div>
                </div>

                <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.5s" }}>
                  <div className="flex flex-col gap-3 rounded-2xl border border-gold/20 bg-bg-card/30 px-5 py-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <Calendar className="h-5 w-5 text-gold" />
                      <span className="text-sm font-semibold text-gold">COUNTDOWN TO ELECTION DAY</span>
                      <Target className="h-5 w-5 text-gold" />
                    </div>
                    <div className="flex justify-center gap-6 text-center">
                      <div><div className="text-2xl font-bold text-gold">{timeLeft.days}</div><div className="text-xs text-text-dim">Days</div></div>
                      <div><div className="text-2xl font-bold text-gold">{timeLeft.hours}</div><div className="text-xs text-text-dim">Hours</div></div>
                      <div><div className="text-2xl font-bold text-gold">{timeLeft.minutes}</div><div className="text-xs text-text-dim">Mins</div></div>
                      <div><div className="text-2xl font-bold text-gold">{timeLeft.seconds}</div><div className="text-xs text-text-dim">Secs</div></div>
                    </div>
                    <p className="text-center text-xs text-text-dim">August 9, 2027 - Kitui County Goes to Polls</p>

                    <button
                      onClick={handleOpenIebcModal}
                      className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gold/20 px-4 py-2 text-sm font-semibold text-gold transition-all hover:bg-gold hover:text-bg-dark"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Je, Uko Kadi? (Check Your Voter Status)
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="animate-fade-up flex gap-4 opacity-0" style={{ animationDelay: "0.6s" }}>
                  <Button variant="primary" onClick={() => setShowJoinModal(true)}>
                    Join The Movement
                  </Button>
                  <Button variant="secondary" onClick={() => document.getElementById("support")?.scrollIntoView({ behavior: "smooth" })}>
                    Support Us
                  </Button>
                </div>

                <div className="animate-fade-up flex flex-wrap gap-2 opacity-0" style={{ animationDelay: "0.7s" }}>
                  {hashtags.map((tag, idx) => (
                    <span key={idx} className="rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs text-gold transition-all hover:bg-gold hover:text-bg-dark">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column - Counter Card */}
              <div className="animate-pop-in opacity-0" style={{ animationDelay: "0.2s" }}>
                <Card className="relative overflow-hidden border border-gold/20 bg-bg-dark/90 shadow-2xl backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent" />
                  <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gold/5 blur-2xl" />

                  <div className="relative text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5">
                      <Users className="h-4 w-4 text-gold" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gold">INDI TWI' MANATA?</span>
                    </div>

                    <div className="relative">
                      <div className="text-7xl font-black text-gold lg:text-8xl">
                        {isLoadingStats ? <LoadingSpinner /> : (displayCount === 0 ? "Be the 1st!" : displayCount.toLocaleString())}
                      </div>
                      <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gold/20 blur-xl animate-pulse" />
                    </div>

                    <p className="mt-3 text-sm font-medium text-text-light">
                      {isLoadingStats ? "Loading campaign data..." : (displayCount === 0 ? "Join the movement today!" : "Strong Supporters & Growing Daily")}
                    </p>

                    <div className="mx-auto mt-5 max-w-sm">
                      <div className="flex justify-between text-xs text-text-dim mb-1">
                        <span>Progress to Goal</span>
                        <span>{isLoadingStats ? "..." : `${Math.min(100, Math.floor((displayCount / 200000) * 100))}%`}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-gold/20">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-all duration-1000"
                          style={{ width: isLoadingStats ? "0%" : `${Math.min(100, (displayCount / 200000) * 100)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-text-dim">Target: 200,000 Supporters</p>
                    </div>

                    {!isLoadingStats && stats.recentRegistrations > 0 && (
                      <div className="mt-4 pt-3 border-t border-gold/20">
                        <p className="text-[10px] text-gold animate-pulse">
                          +{stats.recentRegistrations} new supporters this week!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 text-center">
                    <p className="text-[11px] text-text-dim">
                      🇰🇪 Kitui County's Choice for Progress 🇰🇪
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="animate-bounce absolute bottom-8 left-1/2 hidden -translate-x-1/2 transform cursor-pointer md:block">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-text-dim">Scroll</span>
              <ChevronDown className="h-4 w-4 text-gold" />
            </div>
          </div>
        </div>
      </section>

      {/* IEBC Modal */}
      {showIebcModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setShowIebcModal(false)}
        >
          <div
            className="relative w-full max-w-5xl h-[85vh] bg-bg-dark rounded-2xl border border-gold/30 shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gold/20 bg-bg-dark/95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-montserrat text-xl font-bold text-gold">IEBC Voter Verification</h3>
                  <p className="text-xs text-text-dim">Verify your voter status online</p>
                </div>
              </div>
              <button
                onClick={() => setShowIebcModal(false)}
                className="text-text-dim hover:text-gold transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="relative h-[calc(85vh-73px)] w-full bg-white">
              {!iframeError ? (
                <iframe
                  src="https://verify.iebc.or.ke/"
                  className="w-full h-full border-0"
                  title="IEBC Voter Registration"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox allow-top-navigation"
                  onError={() => setIframeError(true)}
                />
              ) : null}

              <div className={`absolute inset-0 flex items-center justify-center bg-bg-dark/95 transition-opacity ${iframeError ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="text-center p-6 max-w-md">
                  <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <ExternalLink className="h-10 w-10 text-red-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-text-light mb-2">Cannot Load IEBC Portal</h4>
                  <p className="text-sm text-text-dim mb-4">
                    The IEBC website may be temporarily unavailable or requires external access.
                    Please click the button below to open it directly in your browser.
                  </p>
                  <a
                    href="https://verify.iebc.or.ke/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-bg-dark font-semibold hover:bg-gold-light transition-all"
                  >
                    Open IEBC Website
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => setShowIebcModal(false)}
                    className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-gold/20 bg-bg-dark/95 text-center">
              <p className="text-[10px] text-text-dim">
                This is an official IEBC portal. Your information is secure and encrypted.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Other Sections */}
      <EventsSection />
      <GallerySection />
      <SupportSection />

      {/* Footer */}
      <footer className="border-t border-gold/20 bg-bg-dark py-8">
        <div className="container mx-auto px-4 text-center text-text-dim">
          <p>&copy; 2026 Hon. Nicholas MULILA Campaign. Working Today, Building Tomorrow.</p>
          <p className="mt-2 text-sm">Data protected by Pasbest Ventures Ltd</p>
        </div>
      </footer>

      {/* Join Movement Modal */}
      <JoinMovementModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onRegistrationSuccess={refreshStats}
      />
    </main>
  );
}
