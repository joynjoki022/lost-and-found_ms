"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Shield,
  Zap,
  Users,
  Heart,
  Star,
  ThumbsUp,
  Award,
  Sparkles,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from '../../../lib/supabase/client';
import { useToast } from "@/hooks/useToast";
import { cn } from '../../lib/utils';

interface CTASectionProps {
  onReportClick?: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface StatsData {
  totalItems: number;
  itemsReturned: number;
  successRate: number;
  activeUsers: number;
}

export function CTASection({ onReportClick }: CTASectionProps) {
  const { showToast, currentToast, removeToast, showSuccess, showError, showInfo } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [stats, setStats] = useState<StatsData>({
    totalItems: 0,
    itemsReturned: 0,
    successRate: 0,
    activeUsers: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  const contactInfo = [
    { icon: Mail, text: "support@findit.com", href: "mailto:support@findit.com", color: "text-blue-500" },
    { icon: Phone, text: "+254 700 000 000", href: "tel:+254700000000", color: "text-green-500" },
    { icon: MapPin, text: "University Campus", href: "#", color: "text-red-500" },
    { icon: Clock, text: "24/7 Available", href: "#", color: "text-purple-500" }
  ];

  // Fetch dynamic stats
  useEffect(() => {
    fetchStats();
    fetchTestimonials();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total lost items
      const { count: totalItems } = await supabase
        .from('lost_items')
        .select('*', { count: 'exact', head: true });

      // Get total found items
      const { count: totalFound } = await supabase
        .from('found_items')
        .select('*', { count: 'exact', head: true });

      // Get returned items (matches that are completed)
      const { count: returnedItems } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Get active users (profiles created in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      const total = (totalItems || 0) + (totalFound || 0);
      const returned = returnedItems || 0;
      const successRate = total > 0 ? Math.round((returned / total) * 100) : 0;

      setStats({
        totalItems: total,
        itemsReturned: returned,
        successRate: successRate,
        activeUsers: activeUsers || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to mock data
      setStats({
        totalItems: 1247,
        itemsReturned: 892,
        successRate: 72,
        activeUsers: 3456
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      // Fetch success story posts from community
      const { data, error } = await supabase
        .from('community_posts')
        .select('content, user_name, created_at')
        .eq('post_type', 'success-story')
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        const formattedTestimonials = data.map(post => ({
          name: post.user_name?.split(' ')[0] || 'Anonymous',
          role: 'Student',
          text: post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content,
          rating: 5,
          avatar: (post.user_name?.[0] || 'A').toUpperCase()
        }));
        setTestimonials(formattedTestimonials);
      } else {
        // Fallback testimonials
        setTestimonials([
          { name: "Sarah M.", role: "Computer Science", text: "Found my laptop in 2 hours!", rating: 5, avatar: "SM" },
          { name: "James K.", role: "Engineering", text: "Best platform for lost items", rating: 5, avatar: "JK" },
        ]);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      showError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    showInfo("Sending your message...");

    try {
      // Save to contact_messages table
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: "Contact Form Submission",
          message: formData.message,
          priority: "normal",
          status: "unread",
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Try to send notification email (non-blocking)
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-contact-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: formData.message,
          }),
        });
      } catch (emailError) {
        console.log('Email notification skipped:', emailError);
      }

      showSuccess("Message sent successfully! We'll get back to you soon.");
      setIsSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "" });

      setTimeout(() => setIsSubmitted(false), 4000);
    } catch (error) {
      console.error('Error submitting form:', error);
      showError("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statItems = [
    { value: stats.totalItems.toLocaleString(), label: "Items Reported", icon: Shield, trend: "+12%" },
    { value: stats.itemsReturned.toLocaleString(), label: "Items Returned", icon: CheckCircle, trend: "+5%" },
    { value: `${stats.successRate}%`, label: "Success Rate", icon: Zap, trend: "+8%" },
    { value: stats.activeUsers.toLocaleString(), label: "Active Students", icon: Users, trend: "+200" }
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Toast Notifications */}
      {currentToast && (
        <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
          <div className={cn(
            "px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 min-w-[300px] max-w-md",
            currentToast.type === "success" && "bg-green-50 text-green-800 border-green-200",
            currentToast.type === "error" && "bg-red-50 text-red-800 border-red-200",
            currentToast.type === "warning" && "bg-yellow-50 text-yellow-800 border-yellow-200",
            currentToast.type === "info" && "bg-blue-50 text-blue-800 border-blue-200"
          )}>
            <div className="flex-1 text-sm">{currentToast.message}</div>
            <button onClick={removeToast} className="opacity-70 hover:opacity-100">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <motion.div
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-400/20 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header with Floating Elements */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 text-blue-700 border-0 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-semibold tracking-wide">JOIN OUR COMMUNITY</span>
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            <span className="text-gray-900">Ready to Find</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
              What You've Lost?
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-500 text-lg max-w-2xl mx-auto"
          >
            Join a community of students helping each other reunite with lost belongings
          </motion.p>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-500"
            >
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Get in Touch</h3>
                    <p className="text-white/80 text-sm">We usually respond within 2 hours</p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {!isSubmitted ? (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-5"
                    >
                      <div>
                        <Label htmlFor="name" className="text-gray-700 text-sm font-medium mb-2 block">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <div className={`relative transition-all duration-300 ${focusedField === "name" ? "scale-[1.02]" : ""}`}>
                          <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            onFocus={() => setFocusedField("name")}
                            onBlur={() => setFocusedField(null)}
                            className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 h-12"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email" className="text-gray-700 text-sm font-medium mb-2 block">
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 h-12"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-gray-700 text-sm font-medium mb-2 block">
                            Phone <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+254 700 000 000"
                            value={formData.phone}
                            onChange={handleChange}
                            className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 h-12"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-gray-700 text-sm font-medium mb-2 block">
                          Message <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us about your lost/found item or any questions..."
                          rows={4}
                          required
                          value={formData.message}
                          onChange={handleChange}
                          className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-xl rounded-xl py-6 font-semibold text-base transition-all duration-300 group"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Sending...</span>
                          </div>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <Send className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </motion.div>
                      <h4 className="text-gray-900 font-bold text-xl mb-2">Message Sent! 🎉</h4>
                      <p className="text-gray-500 text-sm">
                        Thanks for reaching out. We'll get back to you soon!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Contact Info */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    {contactInfo.map((item, idx) => (
                      <motion.a
                        key={idx}
                        href={item.href}
                        whileHover={{ x: 3 }}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors group"
                      >
                        <item.icon className={`h-3 w-3 ${item.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-xs">{item.text}</span>
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Stats & CTA */}
            <div className="space-y-6">
              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4"
              >
                {loadingStats ? (
                  // Loading skeletons
                  [...Array(4)].map((_, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-5 text-center border border-gray-100 animate-pulse">
                      <div className="h-7 w-7 bg-gray-200 rounded-full mx-auto mb-3"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
                      <div className="h-3 w-12 bg-gray-200 rounded mx-auto"></div>
                    </div>
                  ))
                ) : (
                  statItems.map((stat, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -5, scale: 1.02 }}
                      onHoverStart={() => setHoveredStat(idx)}
                      onHoverEnd={() => setHoveredStat(null)}
                      className="bg-white rounded-xl p-5 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <stat.icon className="h-7 w-7 text-blue-600 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                      <AnimatePresence>
                        {hoveredStat === idx && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-[10px] text-green-600 mt-2"
                          >
                            ↑ {stat.trend}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </motion.div>

              {/* Quick Testimonials */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100"
              >
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsUp className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Student Love</span>
                </div>
                <div className="flex gap-3 overflow-x-auto">
                  {testimonials.map((t, idx) => (
                    <div key={idx} className="flex-1 min-w-[150px]">
                      <div className="flex gap-0.5 mb-1">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 italic">"{t.text}"</p>
                      <p className="text-[10px] font-semibold text-gray-700 mt-1">{t.name}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Report Button Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-center shadow-lg"
              >
                <Zap className="h-10 w-10 text-white/80 mx-auto mb-3" />
                <h3 className="text-white font-bold text-xl mb-2">
                  Ready to Report?
                </h3>
                <p className="text-white/80 text-sm mb-5">
                  Create a report in less than 2 minutes
                </p>
                <Button
                  onClick={onReportClick || (() => window.location.href = '/report')}
                  className="w-full bg-white text-blue-600 hover:bg-gray-100 rounded-xl py-5 font-semibold transition-all duration-300 group shadow-md"
                >
                  Report Item Now
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                viewport={{ once: true }}
                className="flex flex-wrap justify-center gap-4"
              >
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Shield className="h-3 w-3 text-green-500" />
                  <span>100% Secure</span>
                </div>
                <div className="w-px h-3 bg-gray-200" />
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <CheckCircle className="h-3 w-3 text-blue-500" />
                  <span>Verified Reports</span>
                </div>
                <div className="w-px h-3 bg-gray-200" />
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Heart className="h-3 w-3 text-red-500" />
                  <span>Free Service</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12 pt-8 border-t border-gray-200"
        >
          <p className="text-gray-400 text-xs">
            By submitting, you agree to our{" "}
            <a href="/privacy" className="text-gray-500 hover:text-blue-600 transition-colors">Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy" className="text-gray-500 hover:text-blue-600 transition-colors">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
