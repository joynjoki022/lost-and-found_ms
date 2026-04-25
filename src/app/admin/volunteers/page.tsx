"use client";

import { useState, useEffect } from "react";
import {
  Users, Search, Download, RefreshCw,
  CheckCircle, Clock, AlertCircle, Mail, Phone,
  MapPin, Activity, Award, Star, TrendingUp,
  UserCheck, Calendar, Eye, Trash2, Edit,
  X, MessageSquare, Heart, Filter, UserPlus,
  DollarSign, Megaphone, HandHeart
} from "lucide-react";
import { supabase } from '../../../../lib/supabase/client';

interface Supporter {
  id: string;
  name: string;
  email: string;
  message: string;
  support_type: string;
  ip_address?: string;
  user_agent?: string;
  is_read: boolean;
  created_at: string;
}

interface SupporterStats {
  total: number;
  volunteers: number;
  donors: number;
  ambassadors: number;
  others: number;
  unread: number;
  recentWeek: number;
  recentMonth: number;
}

export default function AdminSupporters() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSupporter, setSelectedSupporter] = useState<Supporter | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState<SupporterStats>({
    total: 0,
    volunteers: 0,
    donors: 0,
    ambassadors: 0,
    others: 0,
    unread: 0,
    recentWeek: 0,
    recentMonth: 0
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSupporter, setNewSupporter] = useState({
    name: "",
    email: "",
    message: "",
    support_type: "volunteer"
  });

  useEffect(() => {
    fetchSupporters();
  }, []);

  const fetchSupporters = async () => {
    setIsLoading(true);
    try {
      // Fetch all contact messages (volunteers, donors, ambassadors)
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .in("support_type", ["volunteer", "donate", "ambassador", "other"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("Fetched supporters:", data?.length || 0);
      setSupporters(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error fetching supporters:", error);
      setErrorMessage("Failed to load supporters");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: Supporter[]) => {
    const total = data.length;
    const volunteers = data.filter(s => s.support_type === "volunteer").length;
    const donors = data.filter(s => s.support_type === "donate").length;
    const ambassadors = data.filter(s => s.support_type === "ambassador").length;
    const others = data.filter(s => s.support_type === "other").length;
    const unread = data.filter(s => !s.is_read).length;

    // Calculate recent applications
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentWeek = data.filter(s => new Date(s.created_at) >= weekAgo).length;
    const recentMonth = data.filter(s => new Date(s.created_at) >= monthAgo).length;

    setStats({
      total,
      volunteers,
      donors,
      ambassadors,
      others,
      unread,
      recentWeek,
      recentMonth
    });
  };

  const markAsRead = async (supporterId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: !currentStatus })
        .eq("id", supporterId);

      if (error) throw error;

      setSuccessMessage(currentStatus ? "Marked as unread" : "Marked as read");
      await fetchSupporters();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating status:", error);
      setErrorMessage("Failed to update status");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const deleteSupporter = async (supporterId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", supporterId);

      if (error) throw error;

      setSuccessMessage("Entry deleted successfully");
      await fetchSupporters();

      if (selectedSupporter?.id === supporterId) {
        setShowDetailsModal(false);
        setSelectedSupporter(null);
      }

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting entry:", error);
      setErrorMessage("Failed to delete entry");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const createSupporter = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from("contact_messages")
        .insert([{
          name: newSupporter.name,
          email: newSupporter.email,
          message: newSupporter.message,
          support_type: newSupporter.support_type,
          is_read: false,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setSuccessMessage(`${newSupporter.support_type.charAt(0).toUpperCase() + newSupporter.support_type.slice(1)} application created successfully!`);
      setShowCreateModal(false);
      setNewSupporter({ name: "", email: "", message: "", support_type: "volunteer" });
      await fetchSupporters();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error creating entry:", error);
      setErrorMessage("Failed to create entry");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Type", "Message", "Status", "Date"];
    const rows = supporters.map(s => [
      s.name,
      s.email,
      s.support_type,
      s.message.replace(/,/g, ';'),
      s.is_read ? "Read" : "Unread",
      new Date(s.created_at).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `supporters_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMessage("Exported successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "volunteer": return <Heart className="h-4 w-4" />;
      case "donate": return <DollarSign className="h-4 w-4" />;
      case "ambassador": return <Megaphone className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "volunteer": return "bg-green-500/10 text-green-400";
      case "donate": return "bg-blue-500/10 text-blue-400";
      case "ambassador": return "bg-purple-500/10 text-purple-400";
      default: return "bg-gray-500/10 text-gray-400";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "volunteer": return "Volunteer";
      case "donate": return "Donor";
      case "ambassador": return "Ambassador";
      default: return type;
    }
  };

  const getStatusColor = (isRead: boolean) => {
    return isRead ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400";
  };

  const filteredSupporters = supporters.filter(supporter => {
    const matchesSearch = supporter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supporter.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supporter.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || supporter.support_type === typeFilter;
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "read" && supporter.is_read) ||
      (statusFilter === "unread" && !supporter.is_read);
    return matchesSearch && matchesType && matchesStatus;
  });

  const statCards = [
    { label: "Total Supporters", value: stats.total, icon: Users, color: "from-gold to-gold-light" },
    { label: "Volunteers", value: stats.volunteers, icon: Heart, color: "from-green-500 to-green-600" },
    { label: "Donors", value: stats.donors, icon: DollarSign, color: "from-blue-500 to-blue-600" },
    { label: "Ambassadors", value: stats.ambassadors, icon: Megaphone, color: "from-purple-500 to-purple-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-montserrat text-2xl font-bold text-gold">Supporters Management</h1>
          <p className="text-text-dim text-sm mt-1">Manage volunteers, donors, and ambassadors</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchSupporters}
            className="p-2 rounded-lg border border-gold/20 text-text-dim hover:text-gold hover:bg-gold/10 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gold to-gold-light text-bg-dark font-semibold hover:shadow-lg transition-all"
          >
            <UserPlus className="h-4 w-4" />
            Add Supporter
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/20 text-text-dim hover:text-gold hover:bg-gold/10 transition-colors"
            disabled={supporters.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gold to-gold-light rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-bg-card/50 backdrop-blur-sm rounded-xl border border-gold/20 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-text-dim text-sm">{card.label}</p>
              <p className="text-3xl font-bold text-text-light mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-card/50 rounded-xl border border-gold/20 p-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gold" />
            <div>
              <p className="text-text-dim text-sm">Unread</p>
              <p className="text-2xl font-bold text-text-light">{stats.unread}</p>
            </div>
          </div>
        </div>
        <div className="bg-bg-card/50 rounded-xl border border-gold/20 p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gold" />
            <div>
              <p className="text-text-dim text-sm">This Week</p>
              <p className="text-2xl font-bold text-text-light">{stats.recentWeek}</p>
            </div>
          </div>
        </div>
        <div className="bg-bg-card/50 rounded-xl border border-gold/20 p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-gold" />
            <div>
              <p className="text-text-dim text-sm">This Month</p>
              <p className="text-2xl font-bold text-text-light">{stats.recentMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
          <input
            type="text"
            placeholder="Search by name, email, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="volunteer">Volunteers</option>
          <option value="donate">Donors</option>
          <option value="ambassador">Ambassadors</option>
          <option value="other">Other</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      {/* Supporters Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-text-dim">Loading supporters...</p>
          </div>
        </div>
      ) : filteredSupporters.length === 0 ? (
        <div className="text-center py-12 bg-bg-card/50 rounded-xl border border-gold/20">
          <Users className="h-12 w-12 text-text-dim mx-auto mb-3" />
          <p className="text-text-dim">No supporters found</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-3 text-gold hover:underline"
          >
            Add your first supporter
          </button>
        </div>
      ) : (
        <div className="bg-bg-card/50 rounded-xl border border-gold/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gold/10 border-b border-gold/20">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gold">Name</th>
                  <th className="p-4 text-left text-sm font-semibold text-gold">Email</th>
                  <th className="p-4 text-left text-sm font-semibold text-gold">Type</th>
                  <th className="p-4 text-left text-sm font-semibold text-gold">Message</th>
                  <th className="p-4 text-left text-sm font-semibold text-gold">Date</th>
                  <th className="p-4 text-left text-sm font-semibold text-gold">Status</th>
                  <th className="p-4 text-left text-sm font-semibold text-gold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSupporters.map((supporter) => (
                  <tr key={supporter.id} className="border-b border-gold/10 hover:bg-gold/5 transition-colors">
                    <td className="p-4 text-text-light font-medium">{supporter.name}</td>
                    <td className="p-4 text-text-dim">{supporter.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTypeColor(supporter.support_type)}`}>
                        {getTypeIcon(supporter.support_type)}
                        {getTypeLabel(supporter.support_type)}
                      </span>
                    </td>
                    <td className="p-4 text-text-dim max-w-xs truncate">{supporter.message}</td>
                    <td className="p-4 text-text-dim text-sm">
                      {new Date(supporter.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(supporter.is_read)}`}>
                        {supporter.is_read ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedSupporter(supporter);
                            setShowDetailsModal(true);
                            if (!supporter.is_read) {
                              markAsRead(supporter.id, supporter.is_read);
                            }
                          }}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => markAsRead(supporter.id, supporter.is_read)}
                          className="p-1 text-gold hover:text-gold-light transition-colors"
                          title={supporter.is_read ? "Mark as Unread" : "Mark as Read"}
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteSupporter(supporter.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedSupporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-bg-card rounded-2xl border border-gold/30 shadow-2xl">
            <div className="sticky top-0 bg-bg-card border-b border-gold/20 p-4 flex justify-between items-center">
              <h2 className="font-montserrat text-xl font-bold text-gold">Supporter Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedSupporter(null);
                }}
                className="p-1 rounded-full hover:bg-gold/10 transition-colors"
              >
                <X className="h-5 w-5 text-text-dim" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">Full Name</label>
                  <p className="text-text-light">{selectedSupporter.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">Email Address</label>
                  <p className="text-text-light">{selectedSupporter.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gold mb-1">Support Type</label>
                <p className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTypeColor(selectedSupporter.support_type)}`}>
                  {getTypeIcon(selectedSupporter.support_type)}
                  {getTypeLabel(selectedSupporter.support_type)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gold mb-1">Message</label>
                <div className="bg-bg-dark/50 rounded-lg p-4 border border-gold/20">
                  <p className="text-text-light whitespace-pre-wrap">{selectedSupporter.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">Submitted Date</label>
                  <p className="text-text-dim">{new Date(selectedSupporter.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">Status</label>
                  <p className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedSupporter.is_read)}`}>
                    {selectedSupporter.is_read ? "Read" : "Unread"}
                  </p>
                </div>
              </div>

              {selectedSupporter.ip_address && (
                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">IP Address</label>
                  <p className="text-text-dim text-sm">{selectedSupporter.ip_address}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    markAsRead(selectedSupporter.id, selectedSupporter.is_read);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-gold text-bg-dark font-semibold hover:bg-gold-light transition-all"
                >
                  {selectedSupporter.is_read ? "Mark as Unread" : "Mark as Read"}
                </button>
                <button
                  onClick={() => {
                    deleteSupporter(selectedSupporter.id);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                >
                  Delete Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Supporter Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-bg-card rounded-2xl border border-gold/30 shadow-2xl">
            <div className="sticky top-0 bg-bg-card border-b border-gold/20 p-4 flex justify-between items-center">
              <h2 className="font-montserrat text-xl font-bold text-gold">Add Supporter</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full hover:bg-gold/10 transition-colors"
              >
                <X className="h-5 w-5 text-text-dim" />
              </button>
            </div>

            <form onSubmit={createSupporter} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gold mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newSupporter.name}
                  onChange={(e) => setNewSupporter({ ...newSupporter, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gold mb-1">Email *</label>
                <input
                  type="email"
                  value={newSupporter.email}
                  onChange={(e) => setNewSupporter({ ...newSupporter, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gold mb-1">Support Type *</label>
                <select
                  value={newSupporter.support_type}
                  onChange={(e) => setNewSupporter({ ...newSupporter, support_type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none"
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="donate">Donor</option>
                  <option value="ambassador">Ambassador</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gold mb-1">Message *</label>
                <textarea
                  value={newSupporter.message}
                  onChange={(e) => setNewSupporter({ ...newSupporter, message: e.target.value })}
                  rows={4}
                  placeholder="Why do you want to support the campaign?"
                  className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-gold to-gold-light text-bg-dark font-semibold hover:shadow-lg transition-all"
                >
                  Create Supporter
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
