"use client";

import { useState, useEffect } from "react";
import {
  Plus, Edit, Trash2, Calendar, Clock, MapPin, Users,
  Search, X, CheckCircle, AlertCircle, RefreshCw,
  Mail, Phone, Download, UserPlus, Activity
} from "lucide-react";
import { supabase } from '../../../../lib/supabase/client';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  type: string;
  expected_attendees?: number;
  status?: string;
  image_url?: string;
  registration_link?: string;
  created_at?: string;
}

interface EventRegistration {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string;
  constituency: string;
  registered_at: string;
  attended: boolean;
  ip_address?: string;
  user_agent?: string;
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventRegistrations, setSelectedEventRegistrations] = useState<EventRegistration[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    type: "Rally",
    expected_attendees: 0,
    status: "upcoming",
    image_url: "",
    registration_link: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const eventTypes = ["Rally", "Summit", "Meeting", "Forum", "Workshop", "Conference"];
  const eventStatuses = ["upcoming", "ongoing", "completed", "cancelled"];

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("campaign_events")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      console.log("Events fetched:", data?.length);
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      showTemporaryMessage("Failed to load events", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .order("registered_at", { ascending: false });

      if (error) throw error;
      console.log("Registrations fetched:", data?.length);
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    }
  };

  const showTemporaryMessage = (message: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const eventData = {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        description: formData.description,
        type: formData.type,
        expected_attendees: formData.expected_attendees || 0,
        status: formData.status || "upcoming",
        image_url: formData.image_url || null,
        registration_link: formData.registration_link || null
      };

      if (editingEvent) {
        const { error } = await supabase
          .from("campaign_events")
          .update(eventData)
          .eq("id", editingEvent.id);

        if (error) throw error;
        showTemporaryMessage("Event updated successfully!", "success");
      } else {
        const { error } = await supabase
          .from("campaign_events")
          .insert([eventData]);

        if (error) throw error;
        showTemporaryMessage("Event created successfully!", "success");
      }

      await fetchEvents();

      setTimeout(() => {
        setShowModal(false);
        setEditingEvent(null);
        resetForm();
      }, 1500);

    } catch (error: any) {
      console.error("Error saving event:", error);
      showTemporaryMessage(error.message || "Failed to save event", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (event: Event) => {
    if (!confirm(`Are you sure you want to delete "${event.title}"? This will also delete all registrations.`)) return;

    try {
      await supabase.from("event_registrations").delete().eq("event_id", event.id);
      const { error } = await supabase.from("campaign_events").delete().eq("id", event.id);

      if (error) throw error;

      showTemporaryMessage("Event deleted successfully!", "success");
      await fetchEvents();
      await fetchRegistrations();
    } catch (error) {
      console.error("Error deleting event:", error);
      showTemporaryMessage("Failed to delete event", "error");
    }
  };

  const handleDeleteRegistration = async (registrationId: string, eventId: string) => {
    if (!confirm("Are you sure you want to remove this registration?")) return;

    try {
      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("id", registrationId);

      if (error) throw error;

      showTemporaryMessage("Registration removed successfully!", "success");
      await fetchRegistrations();

      if (selectedEvent && selectedEvent.id === eventId) {
        const updated = registrations.filter(r => r.event_id === eventId);
        setSelectedEventRegistrations(updated);
      }
    } catch (error) {
      console.error("Error deleting registration:", error);
      showTemporaryMessage("Failed to remove registration", "error");
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      venue: event.venue,
      description: event.description,
      type: event.type,
      expected_attendees: event.expected_attendees || 0,
      status: event.status || "upcoming",
      image_url: event.image_url || "",
      registration_link: event.registration_link || ""
    });
    setShowModal(true);
  };

  const viewRegistrations = (event: Event) => {
    console.log("Viewing registrations for event:", event.title);
    console.log("Event ID:", event.id);
    console.log("Total registrations:", registrations.length);

    // Filter registrations for this event
    const eventRegistrations = registrations.filter(r => r.event_id === event.id);

    console.log("Found registrations:", eventRegistrations.length);
    console.log("Registration details:", eventRegistrations);

    setSelectedEvent(event);
    setSelectedEventRegistrations(eventRegistrations);
    setShowRegistrationsModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      date: "",
      time: "",
      venue: "",
      description: "",
      type: "Rally",
      expected_attendees: 0,
      status: "upcoming",
      image_url: "",
      registration_link: ""
    });
    setEditingEvent(null);
  };

  const exportRegistrationsToCSV = (event: Event) => {
    const eventRegistrations = registrations.filter(r => r.event_id === event.id);
    const headers = ["Name", "Email", "Phone", "Constituency", "Registered Date", "Attended"];
    const rows = eventRegistrations.map(r => [
      r.full_name,
      r.email,
      r.phone,
      r.constituency,
      new Date(r.registered_at).toLocaleDateString(),
      r.attended ? "Yes" : "No"
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title}_registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showTemporaryMessage("Exported successfully!", "success");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-500/10 text-blue-400";
      case "ongoing": return "bg-green-500/10 text-green-400";
      case "completed": return "bg-gray-500/10 text-gray-400";
      case "cancelled": return "bg-red-500/10 text-red-400";
      default: return "bg-gold/10 text-gold";
    }
  };

  const getRegistrationCount = (eventId: string) => {
    return registrations.filter(r => r.event_id === eventId).length;
  };

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-montserrat text-2xl font-bold text-gold">Events Management</h1>
          <p className="text-text-dim text-sm mt-1">Create, edit, and manage campaign events with attendee tracking</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { fetchEvents(); fetchRegistrations(); }}
            className="p-2 rounded-lg border border-gold/20 text-text-dim hover:text-gold hover:bg-gold/10 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gold to-gold-light text-bg-dark font-semibold hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
        <input
          type="text"
          placeholder="Search events by title, venue, or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none"
        />
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 animate-fade-in">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <p className="text-sm text-green-400">{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 animate-fade-in">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}

      {/* Events Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-text-dim">Loading events...</p>
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-bg-card/50 rounded-xl border border-gold/20">
          <Calendar className="h-12 w-12 text-text-dim mx-auto mb-3" />
          <p className="text-text-dim">No events found</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="mt-3 text-gold hover:underline"
          >
            Create your first event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const registrationCount = getRegistrationCount(event.id);
            const isExpanded = expandedEvent === event.id;

            return (
              <div key={event.id} className="bg-bg-card/50 rounded-xl border border-gold/20 overflow-hidden hover:border-gold/40 transition-all duration-300">
                {/* Event Image */}
                <div className="h-32 bg-gradient-to-r from-gold/20 to-gold/10 flex items-center justify-center relative">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Calendar className="h-8 w-8 text-gold/50 mx-auto" />
                      <p className="text-xs text-text-dim mt-1">No image</p>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status || "upcoming")}`}>
                      {event.status || "upcoming"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 rounded-full bg-gold/10 text-gold text-xs font-semibold">
                      {event.type}
                    </span>
                    <button
                      onClick={() => viewRegistrations(event)}
                      className="flex items-center gap-1 text-xs text-gold hover:underline"
                    >
                      <Users className="h-3 w-3" />
                      {registrationCount} registered
                    </button>
                  </div>

                  <h3 className="font-montserrat text-lg font-bold text-text-light mb-2 line-clamp-1">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-text-dim">
                      <Calendar className="h-4 w-4 text-gold" />
                      <span>{new Date(event.date).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-dim">
                      <Clock className="h-4 w-4 text-gold" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-dim">
                      <MapPin className="h-4 w-4 text-gold" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                    {event.expected_attendees && event.expected_attendees > 0 && (
                      <div className="flex items-center gap-2 text-sm text-text-dim">
                        <Users className="h-4 w-4 text-gold" />
                        <span>{event.expected_attendees.toLocaleString()} expected</span>
                      </div>
                    )}
                  </div>

                  <p className={`text-text-dim text-sm mb-3 ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {event.description}
                  </p>

                  {event.description && event.description.length > 100 && (
                    <button
                      onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                      className="text-xs text-gold hover:underline mb-3"
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-gold/20">
                    <button
                      onClick={() => handleEdit(event)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gold/20 text-gold hover:bg-gold/10 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registrations Modal */}
      {showRegistrationsModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden bg-bg-card rounded-2xl border border-gold/30 shadow-2xl">
            <div className="sticky top-0 bg-bg-card border-b border-gold/20 p-4 flex justify-between items-center">
              <div>
                <h2 className="font-montserrat text-xl font-bold text-gold">Event Registrations</h2>
                <p className="text-text-dim text-sm">{selectedEvent.title} - {selectedEventRegistrations.length} registrations</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => exportRegistrationsToCSV(selectedEvent)}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg border border-gold/20 text-gold hover:bg-gold/10 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => setShowRegistrationsModal(false)}
                  className="p-1 rounded-full hover:bg-gold/10 transition-colors"
                >
                  <X className="h-5 w-5 text-text-dim" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-4">
              {selectedEventRegistrations.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="h-12 w-12 text-text-dim mx-auto mb-3" />
                  <p className="text-text-dim">No registrations yet for this event</p>
                  <p className="text-text-dim text-sm mt-2">When users register, they will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gold/10 sticky top-0">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold text-gold">Name</th>
                        <th className="p-3 text-left text-sm font-semibold text-gold">Contact</th>
                        <th className="p-3 text-left text-sm font-semibold text-gold">Constituency</th>
                        <th className="p-3 text-left text-sm font-semibold text-gold">Registered</th>
                        <th className="p-3 text-left text-sm font-semibold text-gold">Status</th>
                        <th className="p-3 text-left text-sm font-semibold text-gold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEventRegistrations.map((reg) => (
                        <tr key={reg.id} className="border-t border-gold/10 hover:bg-gold/5 transition-colors">
                          <td className="p-3 text-text-light">{reg.full_name}</td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-text-dim text-xs">
                                <Mail className="h-3 w-3" />
                                {reg.email}
                              </div>
                              <div className="flex items-center gap-1 text-text-dim text-xs">
                                <Phone className="h-3 w-3" />
                                {reg.phone}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-text-dim">{reg.constituency}</td>
                          <td className="p-3 text-text-dim text-sm">
                            {new Date(reg.registered_at).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${reg.attended ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                              <Activity className="h-3 w-3" />
                              {reg.attended ? 'Attended' : 'Registered'}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleDeleteRegistration(reg.id, selectedEvent.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-bg-card rounded-2xl border border-gold/30 shadow-2xl">
            <div className="sticky top-0 bg-bg-card border-b border-gold/20 p-4 flex justify-between items-center">
              <h2 className="font-montserrat text-xl font-bold text-gold">
                {editingEvent ? "Edit Event" : "Create New Event"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-1 rounded-full hover:bg-gold/10 transition-colors"
              >
                <X className="h-5 w-5 text-text-dim" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gold mb-1">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Kitui Central Mega Rally"
                  className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">Time *</label>
                  <input
                    type="text"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    placeholder="e.g., 10:00 AM - 4:00 PM"
                    className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gold mb-1">Venue *</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  placeholder="e.g., Kitui Stadium, Kitui Town"
                  className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gold mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Event description..."
                  className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">Event Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none"
                  >
                    {eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none"
                  >
                    {eventStatuses.map(status => (
                      <option key={status} value={status}>{status.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">Expected Attendees</label>
                  <input
                    type="number"
                    name="expected_attendees"
                    value={formData.expected_attendees}
                    onChange={handleInputChange}
                    placeholder="e.g., 5000"
                    className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">Image URL</label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gold mb-1">Registration Link</label>
                <input
                  type="url"
                  name="registration_link"
                  value={formData.registration_link}
                  onChange={handleInputChange}
                  placeholder="https://example.com/register"
                  className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-gold to-gold-light text-bg-dark font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : (editingEvent ? "Update Event" : "Create Event")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 rounded-lg border border-gold/20 text-text-dim hover:bg-gold/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
