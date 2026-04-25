"use client";

import { useState, useEffect } from "react";
import { Search, Download, CheckCircle, Clock } from "lucide-react";
import { supabase } from '../../../../lib/supabase/client';

interface Supporter {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  constituency: string;
  ward: string;
  registered_at: string;
  is_verified: boolean;
}

export default function AdminSupporters() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSupporters();
  }, []);

  const fetchSupporters = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("campaign_supporters")
        .select("*")
        .order("registered_at", { ascending: false });

      if (error) throw error;
      setSupporters(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Constituency", "Ward", "Date", "Status"];
    const rows = supporters.map(s => [
      s.full_name,
      s.email,
      s.phone,
      s.constituency,
      s.ward,
      new Date(s.registered_at).toLocaleDateString(),
      s.is_verified ? "Verified" : "Pending"
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `supporters_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSupporters = supporters.filter(s =>
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none"
          />
        </div>
        <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-bg-dark font-semibold hover:bg-gold-light transition-all">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-bg-card/50 rounded-xl border border-gold/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gold/10 border-b border-gold/20">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gold">Name</th>
                <th className="p-4 text-left text-sm font-semibold text-gold">Email</th>
                <th className="p-4 text-left text-sm font-semibold text-gold">Phone</th>
                <th className="p-4 text-left text-sm font-semibold text-gold">Constituency</th>
                <th className="p-4 text-left text-sm font-semibold text-gold">Ward</th>
                <th className="p-4 text-left text-sm font-semibold text-gold">Date</th>
                <th className="p-4 text-left text-sm font-semibold text-gold">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center p-8 text-text-dim">Loading...</td></tr>
              ) : filteredSupporters.length === 0 ? (
                <tr><td colSpan={7} className="text-center p-8 text-text-dim">No supporters found</td></tr>
              ) : (
                filteredSupporters.map((s) => (
                  <tr key={s.id} className="border-b border-gold/10 hover:bg-gold/5 transition-colors">
                    <td className="p-4 text-text-light">{s.full_name}</td>
                    <td className="p-4 text-text-dim">{s.email}</td>
                    <td className="p-4 text-text-dim">{s.phone}</td>
                    <td className="p-4 text-text-dim">{s.constituency}</td>
                    <td className="p-4 text-text-dim">{s.ward}</td>
                    <td className="p-4 text-text-dim">{new Date(s.registered_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      {s.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-green-400 text-sm">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-yellow-400 text-sm">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
