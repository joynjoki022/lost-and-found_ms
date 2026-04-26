"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Search,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Clock,
  Users,
  Bell,
  MapPin,
  Camera,
  Moon,
  Sun,
  Star,
  Award,
  TrendingUp,
  Heart,
  ThumbsUp,
  Globe,
  Lock,
  Mail,
  Phone,
  UserCheck,
  FileCheck,
  BellRing,
  Clock as ClockIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    icon: FileText,
    title: "Report Item",
    stepNumber: "01",
    shortTitle: "Report",
    description: "Fill out a quick form with details about your lost or found item. Add photos, location, and description to help identify it faster.",
    longDescription: "Our intelligent form guides you through the process, ensuring you provide all the necessary information. Add up to 5 photos, specify the exact location, and add any unique identifying features.",
    color: "from-blue-600 to-blue-500",
    lightColor: "from-blue-50 to-blue-100",
    bgColor: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
    gradient: "via-blue-500",
    features: [
      { text: "Add up to 5 photos", icon: Camera },
      { text: "Detailed description", icon: FileText },
      { text: "Share exact location", icon: MapPin },
      { text: "Select category", icon: Search },
      { text: "Contact preferences", icon: Bell }
    ],
    stats: { time: "2 mins", rate: "100% Free", users: "500+" }
  },
  {
    id: 2,
    icon: Search,
    title: "Smart Matching",
    stepNumber: "02",
    shortTitle: "Match",
    description: "Our intelligent system automatically matches lost reports with found items using location, category, and description analysis.",
    longDescription: "Using advanced AI algorithms, our system continuously scans and compares reports across campus. You'll receive instant notifications when potential matches are found.",
    color: "from-cyan-600 to-cyan-500",
    lightColor: "from-cyan-50 to-cyan-100",
    bgColor: "bg-cyan-50",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    borderColor: "border-cyan-200",
    gradient: "via-cyan-500",
    features: [
      { text: "AI-powered matching", icon: Zap },
      { text: "Instant notifications", icon: BellRing },
      { text: "98% accuracy rate", icon: TrendingUp },
      { text: "Real-time updates", icon: ClockIcon },
      { text: "Location-based alerts", icon: MapPin }
    ],
    stats: { time: "Real-time", rate: "98% Accurate", users: "1000+" }
  },
  {
    id: 3,
    icon: MessageCircle,
    title: "Reconnect",
    stepNumber: "03",
    shortTitle: "Reunite",
    description: "Get notified when a match is found. Securely connect with the finder or owner to arrange pickup of your item.",
    longDescription: "Our secure messaging system allows you to chat directly with the other party. Verify ownership through our safe process and arrange a convenient pickup location on campus.",
    color: "from-emerald-600 to-emerald-500",
    lightColor: "from-emerald-50 to-emerald-100",
    bgColor: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    gradient: "via-emerald-500",
    features: [
      { text: "Secure messaging", icon: Lock },
      { text: "Owner verification", icon: UserCheck },
      { text: "Pickup coordination", icon: MapPin },
      { text: "Ratings system", icon: Star },
      { text: "Success stories", icon: Heart }
    ],
    stats: { time: "Fast", rate: "100% Secure", users: "500+" }
  }
];

const testimonials = [
  { name: "Sarah M.", role: "Student", text: "Found my laptop within 24 hours!", rating: 5 },
  { name: "James K.", role: "Student", text: "Amazing platform, highly recommend!", rating: 5 },
  { name: "Mary W.", role: "Student", text: "Quick and easy to use.", rating: 5 }
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setScrolled(rect.top < window.innerHeight - 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-white via-gray-50/30 to-white"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl animate-float-slow" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full px-4 py-2 mb-6 animate-fade-up">
            <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
            <span className="text-xs font-semibold text-blue-600 tracking-wide">SIMPLE PROCESS</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-up delay-100">
            How{" "}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
              FindIT
            </span>{" "}
            Works
          </h2>

          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto animate-fade-up delay-200">
            Three simple steps to reconnect with your lost belongings
          </p>
        </div>

        {/* Desktop Steps with Connector Line */}
        <div className="relative max-w-7xl mx-auto">
          {/* Animated Connector Line */}
          <div className="hidden lg:block absolute top-[15%] left-[10%] right-[10%] h-[2px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200" />
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 transition-all duration-1000"
              style={{
                width: `${((activeStep - 1) / 2) * 100}%`,
                opacity: 0.6
              }}
            />
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "relative transition-all duration-500 animate-fade-up",
                  hoveredStep === step.id ? "transform -translate-y-2" : "",
                  activeStep === step.id ? "z-10" : "z-0"
                )}
                style={{ animationDelay: `${index * 150}ms` }}
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Step Number Circle - Desktop */}
                <div className="hidden lg:flex absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                  <div className={cn(
                    "w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center shadow-xl transition-all duration-300",
                    hoveredStep === step.id ? "scale-110 shadow-2xl" : ""
                  )}>
                    <span className="text-white font-bold text-lg">{step.stepNumber}</span>
                  </div>
                </div>

                {/* Main Card */}
                <Card className={cn(
                  "group relative overflow-hidden transition-all duration-500 bg-white rounded-2xl cursor-pointer",
                  "border shadow-lg hover:shadow-2xl",
                  activeStep === step.id ? "ring-2 ring-blue-500/50 shadow-2xl" : "border-gray-100",
                  hoveredStep === step.id ? "transform -translate-y-2" : ""
                )}
                  onClick={() => setActiveStep(step.id)}>

                  {/* Animated Gradient Border */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-500 rounded-2xl",
                    step.color,
                    hoveredStep === step.id ? "opacity-20 blur-xl" : ""
                  )} />

                  {/* Card Inner Content */}
                  <CardContent className="relative p-6 md:p-8 bg-white rounded-2xl">
                    {/* Step Indicator - Mobile */}
                    <div className="lg:hidden inline-flex items-center gap-2 mb-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full bg-gradient-to-r flex items-center justify-center shadow-md",
                        step.color
                      )}>
                        <span className="text-white font-bold text-xs">{step.stepNumber}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-500">STEP {step.stepNumber}</span>
                    </div>

                    {/* Icon with Animation */}
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300",
                      step.iconBg,
                      hoveredStep === step.id ? "scale-110 rotate-3" : ""
                    )}>
                      <step.icon className={cn("h-8 w-8 transition-all duration-300", step.iconColor)} />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                      {activeStep === step.id ? step.longDescription : step.description}
                    </p>

                    {/* Features Grid */}
                    <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                      {step.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center gap-2 text-xs text-gray-600 transition-all duration-300",
                            hoveredStep === step.id ? "transform translate-x-1" : ""
                          )}
                          style={{ transitionDelay: `${idx * 50}ms` }}
                        >
                          <feature.icon className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>{feature.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-xs font-bold text-gray-700">{step.stats.time}</div>
                        <div className="text-[10px] text-gray-400">Avg. Time</div>
                      </div>
                      <div className="text-center border-l border-r border-gray-100">
                        <div className="text-xs font-bold text-gray-700">{step.stats.rate}</div>
                        <div className="text-[10px] text-gray-400">Success</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-bold text-gray-700">{step.stats.users}</div>
                        <div className="text-[10px] text-gray-400">Users</div>
                      </div>
                    </div>

                    {/* Interactive Learn More */}
                    <div className={cn(
                      "mt-5 transition-all duration-300 overflow-hidden",
                      hoveredStep === step.id ? "max-h-10 opacity-100" : "max-h-0 opacity-0"
                    )}>
                      <Button variant="ghost" className={cn("p-0 h-auto hover:bg-transparent group/btn", step.iconColor)}>
                        <span className="text-sm font-medium">Learn more</span>
                        <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Connector Arrow - Mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <ArrowRight className="h-6 w-6 text-gray-300 rotate-90 animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Success Stats Section */}
        <div className="max-w-4xl mx-auto mt-20 pt-8 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="animate-fade-up delay-300">
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-xs text-gray-500 mt-1">Items Found</div>
            </div>
            <div className="animate-fade-up delay-400">
              <div className="text-3xl font-bold text-cyan-600">98%</div>
              <div className="text-xs text-gray-500 mt-1">Success Rate</div>
            </div>
            <div className="animate-fade-up delay-500">
              <div className="text-3xl font-bold text-emerald-600">24h</div>
              <div className="text-xs text-gray-500 mt-1">Avg. Response</div>
            </div>
            <div className="animate-fade-up delay-600">
              <div className="text-3xl font-bold text-purple-600">1000+</div>
              <div className="text-xs text-gray-500 mt-1">Students</div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="bg-amber-50 text-amber-600 rounded-full px-4 py-1 text-xs">
              <Star className="h-3 w-3 mr-1 fill-amber-500" />
              Loved by Students
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-fade-up"
                style={{ animationDelay: `${800 + idx * 100}ms` }}
              >
                <div className="flex gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic">"{testimonial.text}"</p>
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-800">{testimonial.name}</p>
                  <p className="text-[10px] text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 pt-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full px-6 py-3 mb-6 animate-fade-up delay-700">
            <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
            <span className="text-sm text-gray-700 font-medium">Ready to get started?</span>
          </div>

          <div className="animate-fade-up delay-800">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              Report a Lost Item
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <p className="text-xs text-gray-400 mt-4 animate-fade-up delay-900">
            Join 500+ students already using FindIT • 100% Free • No hidden fees
          </p>
        </div>
      </div>
    </section>
  );
}
