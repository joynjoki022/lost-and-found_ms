"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, Clock, MapPin, Users, Ticket, X, CheckCircle, AlertCircle, User, Mail, Phone, ChevronDown } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { supabase } from '../../lib/supabase/client';
import { registerForEvent } from "../../lib/supabase/functions";
import { useToast } from "./ui/Toast";
import { getConstituencies } from "kenya-locations";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  type: string;
  expected_attendees?: number;
  status?: string;
  created_at?: string;
}

interface RegistrationFormData {
  fullName: string;
  email: string;
  phone: string;
  constituency: string;
}

interface ConstituencyOption {
  code: string;
  name: string;
  county: string;
}

export default function EventsSection() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<"idle" | "success" | "error">("idle");
  const [constituencies, setConstituencies] = useState<ConstituencyOption[]>([]);
  const [showConstituencyDropdown, setShowConstituencyDropdown] = useState(false);

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: "",
    email: "",
    phone: "",
    constituency: ""
  });

  // Load constituencies from kenya-locations
  useEffect(() => {
    try {
      const allConstituencies = getConstituencies();
      const constituenciesList: ConstituencyOption[] = allConstituencies.map((c: any) => ({
        code: c.code,
        name: c.name,
        county: c.county
      }));
      // Filter for Kitui County constituencies
      const kituiConstituencies = constituenciesList.filter(c => c.county === "Kitui");
      setConstituencies(kituiConstituencies);
      console.log("✅ Loaded constituencies:", kituiConstituencies.length);
    } catch (error) {
      console.error("Error loading constituencies:", error);
    }
  }, []);

  // Fetch events from Supabase
  const fetchEvents = useCallback(async () => {
    console.log("📅 [EventsSection] Fetching upcoming events...");

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("campaign_events")
        .select("*")
        .gte("date", new Date().toISOString().split('T')[0])
        .order("date", { ascending: true })
        .limit(8);

      if (fetchError) {
        console.error("❌ [EventsSection] Error fetching events:", fetchError);
        throw fetchError;
      }

      if (data && data.length > 0) {
        console.log(`✅ [EventsSection] Loaded ${data.length} events`);
        setEvents(data);
      } else {
        console.log("ℹ️ [EventsSection] No upcoming events found, using fallback data");
        setEvents(fallbackEvents);
      }
    } catch (error) {
      console.error("❌ [EventsSection] Failed to fetch events:", error);
      setError("Unable to load events. Please try again later.");
      setEvents(fallbackEvents);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRegisterClick = (event: Event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
    setRegistrationStatus("idle");
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      constituency: ""
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectConstituency = (constituencyName: string) => {
    setFormData(prev => ({ ...prev, constituency: constituencyName }));
    setShowConstituencyDropdown(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.constituency) {
      showToast("Please fill in all fields", "error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    if (!/^(07|01|02)[0-9]{8}$/.test(formData.phone)) {
      showToast("Please enter a valid Kenyan phone number (e.g., 0712345678)", "error");
      return;
    }

    setIsSubmitting(true);
    setRegistrationStatus("idle");

    try {
      console.log(`🎟️ Registering for event: ${selectedEvent?.title}`);

      const result = await registerForEvent(selectedEvent!.id.toString(), {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        constituency: formData.constituency
      });

      if (result.success) {
        setRegistrationStatus("success");
        showToast(`Successfully registered for ${selectedEvent?.title}!`, "success");

        setTimeout(() => {
          setShowRegistrationModal(false);
          setSelectedEvent(null);
          setRegistrationStatus("idle");
        }, 2000);
      } else {
        throw new Error(result.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setRegistrationStatus("error");
      showToast(error instanceof Error ? error.message : "Registration failed. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-KE', options);
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Rally': 'bg-red-500/20 text-red-400',
      'Summit': 'bg-blue-500/20 text-blue-400',
      'Meeting': 'bg-green-500/20 text-green-400',
      'Forum': 'bg-purple-500/20 text-purple-400',
      'Workshop': 'bg-yellow-500/20 text-yellow-400'
    };
    return colors[type] || 'bg-gold/20 text-gold';
  };

  const fallbackEvents: Event[] = [
    {
      id: 1,
      title: "Kitui Central Mega Rally",
      date: "2026-04-15",
      time: "10:00 AM - 4:00 PM",
      venue: "Kitui Stadium, Kitui Town",
      description: "Official campaign launch and endorsement ceremony. Come and be part of history as we kickstart the journey to transform Kitui County.",
      type: "Rally",
      expected_attendees: 10000,
      status: "upcoming"
    },
    {
      id: 2,
      title: "Youth Empowerment Summit",
      date: "2026-04-22",
      time: "9:00 AM - 3:00 PM",
      venue: "Mwingi Cultural Centre",
      description: "Skills training and entrepreneurship forum for Kitui's youth. Learn from successful entrepreneurs and access funding opportunities.",
      type: "Summit",
      expected_attendees: 5000,
      status: "upcoming"
    },
    {
      id: 3,
      title: "Ward Leaders Meeting",
      date: "2026-04-28",
      time: "2:00 PM - 6:00 PM",
      venue: "Kitui West Hall",
      description: "Strategy meeting with all ward representatives to discuss grassroots mobilization and campaign coordination.",
      type: "Meeting",
      expected_attendees: 500,
      status: "upcoming"
    },
    {
      id: 4,
      title: "Community Development Forum",
      date: "2026-05-05",
      time: "8:00 AM - 5:00 PM",
      venue: "Kitui South Grounds",
      description: "Open forum discussing development agenda for Kitui County. Residents are invited to share their priorities and concerns.",
      type: "Forum",
      expected_attendees: 8000,
      status: "upcoming"
    }
  ];

  if (isLoading) {
    return (
      <section id="events" className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-montserrat text-4xl font-bold md:text-5xl">
              <span className="text-gold">UPCOMING</span> EVENTS
            </h2>
            <p className="mt-4 text-text-dim">Loading events...</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-gold/10 rounded-lg mb-4"></div>
                <div className="h-4 bg-gold/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gold/10 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gold/10 rounded w-full"></div>
                  <div className="h-3 bg-gold/10 rounded w-full"></div>
                  <div className="h-3 bg-gold/10 rounded w-3/4"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="events" className="py-20 bg-gradient-to-b from-bg-dark to-bg-dark/80">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5 mb-4">
              <Calendar className="h-4 w-4 text-gold" />
              <span className="text-xs font-semibold text-gold">MARK YOUR CALENDAR</span>
            </div>
            <h2 className="font-montserrat text-4xl font-bold md:text-5xl">
              <span className="text-gold">UPCOMING</span> EVENTS
            </h2>
            <p className="mt-4 text-text-dim max-w-2xl mx-auto">
              Join us in these transformative events across Kitui County. Be part of the change
              and connect with like-minded individuals shaping our future.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {events.map((event, index) => (
              <div
                key={event.id}
                className="animate-fade-up opacity-0"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
              >
                <Card className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold/10">
                  <div className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getEventTypeColor(event.type)}`}>
                    {event.type}
                  </div>
                  <h3 className="mb-3 font-montserrat text-lg font-bold text-text-light leading-tight">
                    {event.title}
                  </h3>
                  <div className="mb-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-text-dim">
                      <Calendar className="h-3.5 w-3.5 text-gold flex-shrink-0" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-dim">
                      <Clock className="h-3.5 w-3.5 text-gold flex-shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-dim">
                      <MapPin className="h-3.5 w-3.5 text-gold flex-shrink-0" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                    {event.expected_attendees && (
                      <div className="flex items-center gap-2 text-xs text-text-dim">
                        <Users className="h-3.5 w-3.5 text-gold flex-shrink-0" />
                        <span>{event.expected_attendees.toLocaleString()} expected</span>
                      </div>
                    )}
                  </div>
                  <p className="mb-4 text-xs text-text-dim line-clamp-2">
                    {event.description}
                  </p>
                  <Button
                    variant="secondary"
                    className="w-full text-sm py-2"
                    onClick={() => handleRegisterClick(event)}
                  >
                    <Ticket className="h-3.5 w-3.5 mr-2" />
                    Register Now
                  </Button>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => !isSubmitting && setShowRegistrationModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-gradient-to-br from-bg-dark to-bg-card rounded-2xl border border-gold/30 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => !isSubmitting && setShowRegistrationModal(false)}
              className="absolute top-4 right-4 z-20 rounded-full bg-black/50 p-1.5 text-text-dim hover:text-gold transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="text-center p-6 border-b border-gold/20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/20 mb-4">
                <Ticket className="h-8 w-8 text-gold" />
              </div>
              <h3 className="font-montserrat text-xl font-bold text-gold">Register for Event</h3>
              <p className="mt-2 text-sm text-text-dim">
                {selectedEvent.title}
                <br />
                <span className="text-xs text-gold">{formatDate(selectedEvent.date)}</span>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gold mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g., John Mwangi"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none transition-colors"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gold mb-1">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g., john@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none transition-colors"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gold mb-1">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g., 0712345678"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none transition-colors"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Constituency Dropdown */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gold mb-1">
                  Constituency <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim z-10" />
                  <button
                    type="button"
                    onClick={() => setShowConstituencyDropdown(!showConstituencyDropdown)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light text-left focus:border-gold focus:outline-none transition-colors cursor-pointer"
                  >
                    {formData.constituency || "Select Constituency"}
                  </button>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim pointer-events-none"
                  />
                </div>
                {showConstituencyDropdown && constituencies.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gold/20 bg-bg-dark shadow-lg">
                    {constituencies.map(c => (
                      <button
                        key={c.code}
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm text-text-light hover:bg-gold/10 transition-colors"
                        onClick={() => handleSelectConstituency(c.name)}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Messages */}
              {registrationStatus === "success" && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <p className="text-xs text-green-400">
                    Successfully registered! You will receive confirmation via email.
                  </p>
                </div>
              )}

              {registrationStatus === "error" && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <p className="text-xs text-red-400">
                    Registration failed. Please try again.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-gold to-gold-light text-bg-dark font-semibold transition-all hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-bg-dark border-t-transparent rounded-full animate-spin" />
                    Registering...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Ticket className="h-4 w-4" />
                    Confirm Registration
                  </span>
                )}
              </button>

              <p className="text-center text-[10px] text-text-dim">
                By registering, you agree to receive event updates and confirm that you are a supporter of Team Mulila.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
