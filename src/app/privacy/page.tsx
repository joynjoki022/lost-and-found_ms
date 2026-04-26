"use client";

import { useRouter } from "next/navigation";
import {
  Shield,
  CheckCircle,
  ArrowLeft,
  Lock,
  Database,
  Eye,
  Trash2,
  Clock,
  FileText,
  Users,
  Share2,
  Globe,
  Server,
  Mail,
  Phone,
  MapPin,
  Fingerprint,
  AlertTriangle,
  Building,
  Cookie,
  Smartphone,
  Cloud,
  UserCheck,
  Activity,
  ChevronRight,
  Bell
} from "lucide-react";
import { useState, useEffect } from "react";

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("information");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);

      // Update active section based on scroll position
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + 200;

      sections.forEach(section => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionBottom = sectionTop + (section as HTMLElement).offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          setActiveSection(section.getAttribute('id') || 'information');
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAcceptAndReturn = () => {
    localStorage.setItem("privacyPolicyAccepted", "true");
    localStorage.setItem("privacyPolicyAcceptedAt", new Date().toISOString());
    router.back();
  };

  const sections = [
    { id: "information", title: "Information We Collect", icon: Database },
    { id: "usage", title: "How We Use Your Data", icon: Users },
    { id: "security", title: "Security Measures", icon: Shield },
    { id: "protection", title: "Data Protection", icon: Lock },
    { id: "retention", title: "Data Retention", icon: Clock },
    { id: "rights", title: "Your Rights", icon: UserCheck },
    { id: "cookies", title: "Cookies & Tracking", icon: Cookie },
    { id: "sharing", title: "Data Sharing", icon: Share2 },
    { id: "contact", title: "Contact Us", icon: Mail },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Floating Header */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200" : "bg-transparent"
      )}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">Privacy Policy</span>
            </div>
            <button
              onClick={handleAcceptAndReturn}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="mb-4 pb-3 border-b border-gray-200">
                  <h3 className="font-heading font-semibold text-gray-900">Quick Navigation</h3>
                  <p className="text-xs text-gray-500 mt-1">Jump to any section</p>
                </div>
                <nav className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 group",
                          isActive
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={cn(
                            "h-4 w-4 transition-colors",
                            isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"
                          )} />
                          <span>{section.title}</span>
                        </div>
                        <ChevronRight className={cn(
                          "h-3 w-3 transition-all",
                          isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-50"
                        )} />
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Summary Card */}
              <div className="mt-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                <div className="flex items-start gap-3">
                  <Shield className="h-8 w-8 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-heading font-semibold text-gray-900 text-sm mb-1">
                      Your Privacy Matters
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      We're committed to protecting your data. This policy explains how we collect, use, and safeguard your information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 mb-6 shadow-inner">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
                Privacy Policy
              </h1>
              <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                <Clock className="h-3 w-3" />
                Last Updated: April 2026
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                <Lock className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-blue-700 font-medium">FindIT - Lost & Found System</span>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-8">
              {/* Section 1 - Information We Collect */}
              <section id="information" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Database className="h-5 w-5 text-blue-600" />
                      </div>
                      <h2 className="font-heading text-xl font-semibold text-gray-900">Information We Collect</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      To help you recover lost items and connect with finders, FindIT collects the following information:
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { icon: UserCheck, text: "Full Name", desc: "To identify and address you personally" },
                        { icon: Mail, text: "Email Address", desc: "For account verification and notifications" },
                        { icon: Phone, text: "Phone Number", desc: "For SMS alerts and urgent communications" },
                        { icon: MapPin, text: "Location", desc: "To show items near you" },
                        { icon: Smartphone, text: "Device Information", desc: "Browser type, IP address for security" },
                        { icon: Activity, text: "Interaction Data", desc: "User activity for service improvement" },
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50/50 transition-colors group">
                            <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:shadow transition-all">
                              <Icon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.text}</p>
                              <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2 - How We Use Your Information */}
              <section id="usage" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-100 rounded-lg">
                        <Users className="h-5 w-5 text-cyan-600" />
                      </div>
                      <h2 className="font-heading text-xl font-semibold text-gray-900">How We Use Your Information</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4">
                      {[
                        { icon: Mail, title: "Account Management", desc: "Create and manage your FindIT account" },
                        { icon: Bell, title: "Notifications", desc: "Send item match alerts and status updates" },
                        { icon: MapPin, title: "Location Services", desc: "Show lost & found items in your area" },
                        { icon: Shield, title: "Security", desc: "Prevent fraud and verify legitimate claims" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-transparent">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <item.icon className="h-4 w-4 text-cyan-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 - Security Measures */}
              <section id="security" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <h2 className="font-heading text-xl font-semibold text-gray-900">Security Measures</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { icon: Lock, text: "End-to-End Encryption", color: "green" },
                        { icon: Fingerprint, text: "Multi-Factor Authentication", color: "blue" },
                        { icon: Cloud, text: "Secure Cloud Storage", color: "purple" },
                        { icon: Eye, text: "Regular Security Audits", color: "orange" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <div className={`p-1.5 bg-${item.color}-100 rounded-lg`}>
                            <item.icon className={`h-4 w-4 text-${item.color}-600`} />
                          </div>
                          <span className="text-sm text-gray-700">{item.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <p className="text-xs text-amber-700">
                          We use advanced security measures to protect your data from unauthorized access, alteration, or disclosure.
                          If you notice any suspicious activity, please contact us immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4 - Data Protection */}
              <section id="protection" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Lock className="h-5 w-5 text-purple-600" />
                      </div>
                      <h2 className="font-heading text-xl font-semibold text-gray-900">Data Protection</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3">
                      {[
                        "All data is encrypted in transit (TLS/SSL) and at rest",
                        "Secure database with Row Level Security (RLS)",
                        "Regular automated backups to prevent data loss",
                        "Strict access control - only authorized personnel can access data",
                        "No selling, trading, or renting of personal information",
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 5 - Data Retention */}
              <section id="retention" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <h2 className="font-heading text-xl font-semibold text-gray-900">Data Retention</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Active Accounts</span>
                        <span className="text-sm font-semibold text-gray-900">Retained indefinitely until deletion request</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Inactive Accounts</span>
                        <span className="text-sm font-semibold text-gray-900">Archived after 2 years of inactivity</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">OTP Records</span>
                        <span className="text-sm font-semibold text-gray-900">Automatically deleted after 24 hours</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Deleted Items</span>
                        <span className="text-sm font-semibold text-gray-900">Permanently removed after 30 days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 6 - Your Rights */}
              <section id="rights" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <UserCheck className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h2 className="font-heading text-xl font-semibold text-gray-900">Your Rights</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { icon: Eye, text: "Access your personal data" },
                        { icon: FileText, text: "Correct inaccurate data" },
                        { icon: Trash2, text: "Request data deletion" },
                        { icon: Mail, text: "Opt out of communications" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-indigo-50 transition-colors">
                          <item.icon className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm text-gray-700">{item.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
                      <p className="text-sm text-gray-700">
                        To exercise these rights, contact our Data Protection Officer at:{' '}
                        <a href="mailto:privacy@findit.com" className="text-blue-600 font-semibold hover:underline">
                          privacy@findit.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 7 - Cookies & Tracking */}
              <section id="cookies" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Cookie className="h-5 w-5 text-pink-600" />
                      </div>
                      <h2 className="font-heading text-xl font-semibold text-gray-900">Cookies & Tracking</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3">
                      {[
                        { text: "Local Storage", desc: "For session management and preferences" },
                        { text: "Session Storage", desc: "For active form session tracking" },
                        { text: "Analytics", desc: "Anonymous usage statistics to improve user experience" },
                        { text: "No Third-Party Cookies", desc: "We do not use advertising or tracking cookies" },
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-900">{item.text}</span>
                          <span className="text-xs text-gray-500">{item.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 8 - Data Sharing */}
              <section id="sharing" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Share2 className="h-5 w-5 text-red-600" />
                      </div>
                      <h2 className="font-heading text-xl font-semibold text-gray-900">Data Sharing</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-3">
                      {[
                        { provider: "Supabase", purpose: "Database & Authentication", icon: Database },
                        { provider: "Twilio", purpose: "SMS Notifications", icon: Phone },
                        { provider: "Vercel", purpose: "Hosting Platform", icon: Globe },
                        { provider: "Cloudflare", purpose: "Security & CDN", icon: Shield },
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-white rounded-lg">
                                <Icon className="h-4 w-4 text-gray-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{item.provider}</span>
                            </div>
                            <span className="text-xs text-gray-500">{item.purpose}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-xs text-green-700 text-center">
                        ✅ We never sell your personal information to third parties
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 9 - Contact Us */}
              <section id="contact" className="scroll-mt-24">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-8 text-center text-white">
                    <Server className="h-12 w-12 mx-auto mb-4 opacity-90" />
                    <h2 className="font-heading text-2xl font-bold mb-2">Have Questions?</h2>
                    <p className="text-blue-100 mb-6 text-sm">Our team is here to help you</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a
                        href="mailto:privacy@findit.com"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <Mail className="h-4 w-4" />
                        Email Us
                      </a>
                      <a
                        href="tel:+1234567890"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 transition-all duration-300"
                      >
                        <Phone className="h-4 w-4" />
                        Call Support
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Acceptance Section */}
            <div className="mt-10 sticky bottom-6 z-30">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
                <p className="text-sm text-gray-600 mb-4">
                  By using FindIT, you agree to our Privacy Policy. We're committed to protecting your data and privacy.
                </p>
                <button
                  onClick={handleAcceptAndReturn}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                >
                  <CheckCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  I Accept the Privacy Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Utility function for className merging
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
