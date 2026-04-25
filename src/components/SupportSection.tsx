"use client";

import { useState } from "react";
import { Heart, DollarSign, Megaphone, Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { submitContact } from "../../lib/supabase/functions";
import { useToast } from "./ui/Toast";

export default function SupportSection() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    supportType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || formData.name.length < 3) {
      showToast("Please enter your full name (minimum 3 characters)", "error");
      return;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    if (!formData.message || formData.message.length < 10) {
      showToast("Please enter a message (minimum 10 characters)", "error");
      return;
    }

    if (!formData.supportType) {
      showToast("Please select how you would like to support", "error");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      console.log("📧 Submitting contact message...");

      const result = await submitContact({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        supportType: formData.supportType
      });

      if (result.success) {
        setSubmitStatus("success");
        showToast("Thank you for your support! We'll get back to you within 24 hours.", "success");

        // Reset form
        setFormData({
          name: "",
          email: "",
          message: "",
          supportType: "",
        });

        setTimeout(() => {
          setSubmitStatus("idle");
        }, 3000);
      } else {
        throw new Error(result.error || "Submission failed");
      }
    } catch (error) {
      console.error("Error submitting contact:", error);
      setSubmitStatus("error");
      showToast(error instanceof Error ? error.message : "Failed to send message. Please try again.", "error");
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Support options data (no action buttons)
  const supportOptions = [
    {
      icon: DollarSign,
      title: "Donate",
      desc: "Support our campaign financially to help us reach more voters across Kitui County.",
      color: "text-gold",
      details: "MPESA Paybill: 123456 | Account: MULILA2027"
    },
    {
      icon: Megaphone,
      title: "Ambassador",
      desc: "Become a Mulla ambassador in your ward and help spread our message.",
      color: "text-gold",
      details: "Contact our team to join our ambassador program"
    },
  ];

  // Social media links
  const socialLinks = [
    { name: "Facebook", url: "https://facebook.com/teammulila", icon: "📘" },
    { name: "Twitter", url: "https://twitter.com/teammulila", icon: "🐦" },
    { name: "Instagram", url: "https://instagram.com/teammulila", icon: "📸" },
    { name: "WhatsApp", url: "https://wa.me/254795751700", icon: "💬" },
    { name: "TikTok", url: "https://tiktok.com/@teammulila", icon: "🎵" },
  ];

  return (
    <section id="support" className="bg-gradient-to-b from-bg-card to-bg-dark py-20">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5 mb-4">
            <Heart className="h-4 w-4 text-gold" />
            <span className="text-xs font-semibold text-gold">JOIN THE MOVEMENT</span>
          </div>
          <h2 className="font-montserrat text-4xl font-bold md:text-5xl">
            <span className="text-gold">SUPPORT</span> THE MOVEMENT
          </h2>
          <p className="mt-4 text-text-dim max-w-2xl mx-auto">
            Every contribution, whether time, resources, or voice, brings us closer to a better Kitui County.
            Join us in building a prosperous future for all.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Support Options */}
          <div className="space-y-6">
            {supportOptions.map((option, idx) => (
              <Card
                key={idx}
                className="bg-bg-dark/50 backdrop-blur-sm border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:shadow-xl hover:shadow-gold/5 group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gold/10 group-hover:bg-gold/20 transition-all duration-300">
                    <option.icon className="h-8 w-8 text-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-text-light mb-2">{option.title}</h3>
                    <p className="text-text-dim mb-2">{option.desc}</p>
                    <p className="text-xs text-gold/80">{option.details}</p>
                  </div>
                </div>
              </Card>
            ))}

            {/* Contact Info Card */}
            <Card className="bg-bg-dark/50 backdrop-blur-sm border border-gold/20">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gold/10">
                  <Phone className="h-8 w-8 text-gold" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-light mb-2">Need Help?</h3>
                  <p className="text-text-dim mb-2">Call or WhatsApp us directly:</p>
                  <a
                    href="tel:+254795751700"
                    className="text-gold hover:underline font-semibold inline-flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    +254 795 751 700
                  </a>
                  <p className="text-text-dim text-sm mt-2">Mon-Fri: 8AM - 6PM</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <Card title="Get in Touch" className="bg-bg-dark/50 backdrop-blur-sm border border-gold/20">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gold mb-1">
                  Your Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., John Mwangi"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gold/20 bg-bg-dark/50 p-3 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none transition-colors"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gold mb-1">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g., john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gold/20 bg-bg-dark/50 p-3 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none transition-colors"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gold mb-1">
                  How would you like to support? <span className="text-red-400">*</span>
                </label>
                <select
                  name="supportType"
                  value={formData.supportType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gold/20 bg-bg-dark/50 p-3 text-text-light focus:border-gold focus:outline-none transition-colors cursor-pointer"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select support type</option>
                  <option value="volunteer">🤝 Volunteer - Offer your time and skills</option>
                  <option value="donate">💰 Donate - Financial contribution</option>
                  <option value="ambassador">📢 Ambassador - Represent us in your ward</option>
                  <option value="other">💡 Other - Share your ideas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gold mb-1">
                  Your Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="message"
                  placeholder="Tell us how you'd like to support or ask any questions..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-lg border border-gold/20 bg-bg-dark/50 p-3 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none transition-colors resize-none"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-[10px] text-text-dim mt-1">
                  {formData.message.length}/500 characters
                </p>
              </div>

              {/* Success/Error Messages */}
              {submitStatus === "success" && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <p className="text-xs text-green-400">
                    Message sent successfully! We'll respond within 24 hours.
                  </p>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <p className="text-xs text-red-400">
                    Failed to send message. Please try again or contact us directly.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center gap-2 group"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>

              <p className="text-center text-[10px] text-text-dim">
                By submitting, you agree to our privacy policy. Your information is secure.
              </p>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
}
