"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Calendar, TrendingUp, CheckCircle, Clock, Award, Shield,
  AlertCircle, RefreshCw, UserCheck, Fingerprint, Activity,
  Zap, Eye, Lock, Server, Database, Cpu, AlertTriangle,
  BarChart3, PieChart, Target, Star, Crown, Flag, Heart,
  Smartphone, Laptop, Tablet, MapPin, Mail, PhoneCall,
  ThumbsUp, ThumbsDown, Percent, ArrowUp, ArrowDown,
  Monitor
} from "lucide-react";
import { supabase } from '../../../../lib/supabase/client';

interface Supporter {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  constituency: string;
  ward?: string;
  is_verified: boolean;
  registered_at: string;
  bot_score?: number;
  is_human?: boolean;
  mouse_movements?: number;
  clicks?: number;
  key_presses?: number;
  time_spent?: number;
  ip_address?: string;
  device_fingerprint?: string;
  security_report?: any;
}

interface DashboardStats {
  total: number;
  verified: number;
  pending: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  humanVerificationRate: number;
  averageBotScore: number;
  averageTimeSpent: number;
  uniqueDevices: number;
  highRiskUsers: number;
  mediumRiskUsers: number;
  lowRiskUsers: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    verified: 0,
    pending: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    humanVerificationRate: 0,
    averageBotScore: 0,
    averageTimeSpent: 0,
    uniqueDevices: 0,
    highRiskUsers: 0,
    mediumRiskUsers: 0,
    lowRiskUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConstituency, setSelectedConstituency] = useState<string>("all");

  useEffect(() => {
    fetchSupporters();
  }, []);

  const fetchSupporters = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching supporters data...");

      const { data, error } = await supabase
        .from("campaign_supporters")
        .select("*")
        .order("registered_at", { ascending: false });

      if (error) throw error;

      setSupporters(data || []);

      // Calculate statistics
      const total = data?.length || 0;
      const verified = data?.filter(s => s.is_verified === true).length || 0;
      const pending = data?.filter(s => s.is_verified !== true).length || 0;

      // Security metrics
      const humanVerified = data?.filter(s => s.is_human === true).length || 0;
      const humanVerificationRate = total > 0 ? (humanVerified / total) * 100 : 0;
      const averageBotScore = total > 0 ? data?.reduce((acc, s) => acc + (s.bot_score || 0), 0) / total : 0;
      const averageTimeSpent = total > 0 ? data?.reduce((acc, s) => acc + (s.time_spent || 0), 0) / total : 0;

      // Risk assessment based on bot score
      const highRiskUsers = data?.filter(s => (s.bot_score || 0) < 40).length || 0;
      const mediumRiskUsers = data?.filter(s => (s.bot_score || 0) >= 40 && (s.bot_score || 0) < 70).length || 0;
      const lowRiskUsers = data?.filter(s => (s.bot_score || 0) >= 70).length || 0;

      // Unique devices
      const uniqueDevices = new Set(data?.map(s => s.device_fingerprint).filter(Boolean)).size;

      // Date calculations
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const todayCount = data?.filter(s => s.registered_at?.startsWith(today)).length || 0;
      const thisWeekCount = data?.filter(s => new Date(s.registered_at) >= weekAgo).length || 0;
      const thisMonthCount = data?.filter(s => new Date(s.registered_at) >= monthAgo).length || 0;

      setStats({
        total,
        verified,
        pending,
        today: todayCount,
        thisWeek: thisWeekCount,
        thisMonth: thisMonthCount,
        humanVerificationRate,
        averageBotScore,
        averageTimeSpent,
        uniqueDevices,
        highRiskUsers,
        mediumRiskUsers,
        lowRiskUsers
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevel = (botScore: number) => {
    if (botScore < 40) return { level: "High Risk", color: "text-red-400", bg: "bg-red-500/10", icon: AlertTriangle };
    if (botScore < 70) return { level: "Medium Risk", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: Clock };
    return { level: "Low Risk", color: "text-green-400", bg: "bg-green-500/10", icon: Shield };
  };

  const getDeviceType = (userAgent: string) => {
    if (!userAgent) return { icon: Monitor, type: "Unknown" };
    if (userAgent.includes("Mobile")) return { icon: Smartphone, type: "Mobile" };
    if (userAgent.includes("Tablet")) return { icon: Tablet, type: "Tablet" };
    return { icon: Laptop, type: "Desktop" };
  };

  const statCards = [
    { label: "Total Supporters", value: stats.total.toLocaleString(), icon: Users, color: "from-blue-500 to-blue-600", trend: "+" + stats.thisWeek },
    { label: "Verified", value: stats.verified.toLocaleString(), icon: CheckCircle, color: "from-green-500 to-green-600", trend: Math.round((stats.verified / stats.total) * 100) + "%" },
    { label: "Human Verified", value: Math.round(stats.humanVerificationRate) + "%", icon: UserCheck, color: "from-purple-500 to-purple-600", trend: "Verification Rate" },
    { label: "Avg Bot Score", value: Math.round(stats.averageBotScore) + "%", icon: Activity, color: "from-gold to-gold-light", trend: stats.averageBotScore > 70 ? "Good" : "Needs Improvement" },
  ];

  const filteredSupporters = selectedConstituency === "all"
    ? supporters
    : supporters.filter(s => s.constituency === selectedConstituency);

  const constituencyData = supporters.reduce((acc, s) => {
    acc[s.constituency] = (acc[s.constituency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-text-dim">Loading campaign data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center gap-2 text-red-400 mb-4">
          <AlertCircle className="h-8 w-8" />
          <p className="text-lg">{error}</p>
        </div>
        <button onClick={fetchSupporters} className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-gold text-bg-dark font-semibold hover:bg-gold-light transition-all">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                <span className={`text-xs ${card.trend.includes("%") ? 'text-green-400' : 'text-text-dim'}`}>{card.trend}</span>
              </div>
              <p className="text-text-dim text-sm">{card.label}</p>
              <p className="text-3xl font-bold text-text-light mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Security & Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-card/50 rounded-xl border border-gold/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-gold" />
            <h3 className="font-montserrat font-semibold text-text-light">Risk Assessment</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-dim text-sm">High Risk Users</span>
              <span className="text-red-400 font-bold">{stats.highRiskUsers}</span>
            </div>
            <div className="h-1.5 bg-red-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${(stats.highRiskUsers / stats.total) * 100}%` }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-dim text-sm">Medium Risk Users</span>
              <span className="text-yellow-400 font-bold">{stats.mediumRiskUsers}</span>
            </div>
            <div className="h-1.5 bg-yellow-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(stats.mediumRiskUsers / stats.total) * 100}%` }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-dim text-sm">Low Risk Users</span>
              <span className="text-green-400 font-bold">{stats.lowRiskUsers}</span>
            </div>
            <div className="h-1.5 bg-green-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${(stats.lowRiskUsers / stats.total) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-bg-card/50 rounded-xl border border-gold/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-gold" />
            <h3 className="font-montserrat font-semibold text-text-light">Behavioral Metrics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-dim text-sm">Avg Bot Score</span>
              <span className="text-gold font-bold">{Math.round(stats.averageBotScore)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-dim text-sm">Avg Time Spent</span>
              <span className="text-gold font-bold">{Math.round(stats.averageTimeSpent)} seconds</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-dim text-sm">Human Verification</span>
              <span className="text-green-400 font-bold">{Math.round(stats.humanVerificationRate)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-dim text-sm">Unique Devices</span>
              <span className="text-blue-400 font-bold">{stats.uniqueDevices}</span>
            </div>
          </div>
        </div>

        <div className="bg-bg-card/50 rounded-xl border border-gold/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-gold" />
            <h3 className="font-montserrat font-semibold text-text-light">Growth Metrics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-dim text-sm">This Week</span>
              <span className="text-green-400 font-bold">+{stats.thisWeek}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-dim text-sm">This Month</span>
              <span className="text-green-400 font-bold">+{stats.thisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-dim text-sm">Today</span>
              <span className="text-gold font-bold">+{stats.today}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-dim text-sm">Pending Verification</span>
              <span className="text-yellow-400 font-bold">{stats.pending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Constituency Distribution */}
      <div className="bg-bg-card/50 rounded-xl border border-gold/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="h-5 w-5 text-gold" />
          <h3 className="font-montserrat font-semibold text-text-light">Constituency Distribution</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(constituencyData).map(([name, count]) => (
            <div key={name} className="p-3 bg-gold/5 rounded-lg border border-gold/20">
              <p className="text-text-dim text-xs">{name}</p>
              <p className="text-xl font-bold text-text-light">{count}</p>
              <div className="h-1 mt-2 bg-gold/20 rounded-full overflow-hidden">
                <div className="h-full bg-gold rounded-full" style={{ width: `${(count / stats.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Supporters Table with Risk Indicators */}
      <div className="bg-bg-card/50 rounded-xl border border-gold/20 overflow-hidden">
        <div className="p-4 border-b border-gold/20 flex justify-between items-center">
          <div>
            <h3 className="font-montserrat text-lg font-bold text-text-light">Recent Supporters</h3>
            <p className="text-text-dim text-sm">Latest registrations with security insights</p>
          </div>
          <select
            value={selectedConstituency}
            onChange={(e) => setSelectedConstituency(e.target.value)}
            className="px-3 py-1 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light text-sm focus:border-gold focus:outline-none"
          >
            <option value="all">All Constituencies</option>
            {Object.keys(constituencyData).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gold/10">
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-gold">Name</th>
                <th className="p-3 text-left text-sm font-semibold text-gold">Contact</th>
                <th className="p-3 text-left text-sm font-semibold text-gold">Location</th>
                <th className="p-3 text-left text-sm font-semibold text-gold">Bot Score</th>
                <th className="p-3 text-left text-sm font-semibold text-gold">Risk Level</th>
                <th className="p-3 text-left text-sm font-semibold text-gold">Time Spent</th>
                <th className="p-3 text-left text-sm font-semibold text-gold">Status</th>
                <th className="p-3 text-left text-sm font-semibold text-gold">Registered</th>
              </tr>
            </thead>
            <tbody>
              {filteredSupporters.slice(0, 20).map((supporter) => {
                const risk = getRiskLevel(supporter.bot_score || 0);
                const RiskIcon = risk.icon;
                return (
                  <tr key={supporter.id} className="border-t border-gold/10 hover:bg-gold/5 transition-colors">
                    <td className="p-3 text-text-light font-medium">{supporter.full_name}</td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-text-dim text-xs">
                          <Mail className="h-3 w-3" />
                          <span>{supporter.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-text-dim text-xs">
                          <PhoneCall className="h-3 w-3" />
                          <span>{supporter.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="text-text-dim text-sm">{supporter.constituency}</div>
                        <div className="text-text-dim text-xs">{supporter.ward}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-gold/20 rounded-full overflow-hidden">
                          <div className="h-full bg-gold rounded-full" style={{ width: `${supporter.bot_score || 0}%` }} />
                        </div>
                        <span className="text-text-light text-sm">{supporter.bot_score || 0}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${risk.bg} ${risk.color}`}>
                        <RiskIcon className="h-3 w-3" />
                        {risk.level}
                      </span>
                    </td>
                    <td className="p-3 text-text-dim text-sm">{supporter.time_spent || 0}s</td>
                    <td className="p-3">
                      {supporter.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-yellow-400 text-xs">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-text-dim text-sm">
                      {new Date(supporter.registered_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredSupporters.length > 20 && (
          <div className="p-4 border-t border-gold/20 text-center">
            <button className="text-gold text-sm hover:underline">View All {filteredSupporters.length} Supporters</button>
          </div>
        )}
      </div>

      {/* Campaign Progress */}
      <div className="bg-bg-card/50 rounded-xl border border-gold/20 p-6">
        <h3 className="font-montserrat text-lg font-bold text-text-light mb-4">Campaign Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-dim">Goal Progress</span>
              <span className="text-gold">{Math.round((stats.total / 200000) * 100)}%</span>
            </div>
            <div className="h-2 bg-gold/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (stats.total / 200000) * 100)}%` }} />
            </div>
            <p className="text-xs text-text-dim mt-2">{stats.total.toLocaleString()} / 200,000 supporters</p>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-dim">Verification Rate</span>
              <span className="text-green-400">{Math.round((stats.verified / stats.total) * 100)}%</span>
            </div>
            <div className="h-2 bg-gold/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" style={{ width: `${(stats.verified / stats.total) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
