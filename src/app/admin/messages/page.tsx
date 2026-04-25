"use client";

import { useState, useEffect } from "react";
import {
  Send, Mail, Users, Heart, DollarSign, Megaphone,
  CheckCircle, AlertCircle, RefreshCw, X,
  User, Filter, Clock, Eye, TrendingUp,
  MessageSquare, FileText, Copy, Trash2
} from "lucide-react";
import { supabase } from '../../../../lib/supabase/client';

interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  created_at: string;
}

interface EmailRecipient {
  email: string;
  name: string;
  type: string;
}

export default function AdminMessages() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [recipientType, setRecipientType] = useState("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [recipientCount, setRecipientCount] = useState(0);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchSentEmails();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const fetchSentEmails = async () => {
    try {
      const { data, error } = await supabase
        .from("sent_emails")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setSentEmails(data || []);
    } catch (error) {
      console.error("Error fetching sent emails:", error);
    }
  };

  const fetchRecipients = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("contact_messages").select("name, email, support_type");

      if (recipientType === "volunteers") {
        query = query.eq("support_type", "volunteer");
      } else if (recipientType === "donors") {
        query = query.eq("support_type", "donate");
      } else if (recipientType === "ambassadors") {
        query = query.eq("support_type", "ambassador");
      } else if (recipientType === "all") {
        // Get all unique contacts
      } else if (recipientType === "specific" && selectedRecipient) {
        query = query.eq("email", selectedRecipient);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get unique recipients by email
      const uniqueRecipients = data?.reduce((acc: EmailRecipient[], curr) => {
        if (!acc.find(r => r.email === curr.email)) {
          acc.push({
            email: curr.email,
            name: curr.name,
            type: curr.support_type
          });
        }
        return acc;
      }, []) || [];

      setRecipients(uniqueRecipients);
      setRecipientCount(uniqueRecipients.length);
    } catch (error) {
      console.error("Error fetching recipients:", error);
      setErrorMessage("Failed to fetch recipients");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setMessage(template.content);
      setSelectedTemplate(templateId);
    }
  };

  const sendEmails = async () => {
    if (!subject || !message) {
      setErrorMessage("Please enter both subject and message");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (recipients.length === 0 && recipientType !== "custom") {
      setErrorMessage("No recipients found for this selection");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let emailRecipients = [...recipients];

      // Add custom recipient if specified
      if (recipientType === "custom" && customEmail) {
        emailRecipients = [{
          email: customEmail,
          name: customName || "Valued Supporter",
          type: "custom"
        }];
      }

      if (emailRecipients.length === 0) {
        setErrorMessage("No recipients to send to");
        setIsLoading(false);
        return;
      }

      // Send emails via edge function
      const { data, error } = await supabase.functions.invoke('send-bulk-emails', {
        body: JSON.stringify({
          recipients: emailRecipients,
          subject,
          message,
          recipientType,
          sender: "Team Mulila Campaign"
        })
      });

      if (error) throw error;

      setSuccessMessage(`Successfully sent ${emailRecipients.length} emails!`);

      // Reset form
      setSubject("");
      setMessage("");
      setShowComposeModal(false);
      setRecipientType("all");
      setCustomEmail("");
      setCustomName("");

      // Refresh sent emails
      await fetchSentEmails();

      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error sending emails:", error);
      setErrorMessage("Failed to send emails. Please try again.");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecipientTypeLabel = (type: string) => {
    switch (type) {
      case "volunteers": return "Volunteers";
      case "donors": return "Donors";
      case "ambassadors": return "Ambassadors";
      case "all": return "All Supporters";
      case "specific": return "Specific Person";
      case "custom": return "Custom Email";
      default: return type;
    }
  };

  const statCards = [
    { label: "Total Supporters", value: recipients.length, icon: Users, color: "from-gold to-gold-light" },
    { label: "Templates", value: templates.length, icon: FileText, color: "from-blue-500 to-blue-600" },
    { label: "Sent Today", value: sentEmails.filter(e => new Date(e.sent_at).toDateString() === new Date().toDateString()).length, icon: Clock, color: "from-green-500 to-green-600" },
    { label: "Total Sent", value: sentEmails.length, icon: Mail, color: "from-purple-500 to-purple-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-montserrat text-2xl font-bold text-gold">Messages</h1>
          <p className="text-text-dim text-sm mt-1">Send bulk emails to supporters, volunteers, donors, and ambassadors</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/20 text-text-dim hover:text-gold hover:bg-gold/10 transition-colors"
          >
            <Clock className="h-4 w-4" />
            {showHistory ? "Compose" : "View History"}
          </button>
          {!showHistory && (
            <button
              onClick={() => setShowComposeModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gold to-gold-light text-bg-dark font-semibold hover:shadow-lg transition-all"
            >
              <Send className="h-4 w-4" />
              Compose Message
            </button>
          )}
        </div>
      </div>

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

      {/* History View */}
      {showHistory ? (
        <div className="bg-bg-card/50 rounded-xl border border-gold/20 overflow-hidden">
          <div className="p-4 border-b border-gold/20">
            <h2 className="font-montserrat text-lg font-bold text-text-light">Sent Messages History</h2>
            <p className="text-text-dim text-sm">Recently sent emails and their status</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gold/10">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gold">Subject</th>
                  <th className="p-4 text-left text-sm font-semibold text-gold">Recipient Type</th>
                  <th className="p-4 text-left text-sm font-semibold text-gold">Recipients</th>
                  <th className="p-4 text-left text-sm font-semibold text-gold">Sent By</th>
                  <th className="p-4 text-left text-sm font-semibold text-gold">Date</th>
                  <th className="p-4 text-left text-sm font-semibold text-gold">Status</th>
                  <th className="p-4 text-left text-sm font-semibold text-gold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sentEmails.map((email) => (
                  <tr key={email.id} className="border-b border-gold/10 hover:bg-gold/5 transition-colors">
                    <td className="p-4 text-text-light font-medium">{email.subject}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gold/10 text-gold">
                        {getRecipientTypeLabel(email.recipient_type)}
                      </span>
                    </td>
                    <td className="p-4 text-text-dim">{email.recipient_count} recipients</td>
                    <td className="p-4 text-text-dim">{email.sent_by || 'Admin'}</td>
                    <td className="p-4 text-text-dim text-sm">
                      {new Date(email.sent_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400">
                        <CheckCircle className="h-3 w-3" /> Sent
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setSubject(email.subject);
                          setMessage(email.message);
                          setShowPreviewModal(true);
                        }}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {sentEmails.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-text-dim">No emails sent yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Compose View - Recipient Selection */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Recipient Type Selection */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-bg-card/50 rounded-xl border border-gold/20 p-4">
              <h3 className="font-montserrat font-semibold text-text-light mb-3">Select Recipients</h3>
              <div className="space-y-2">
                {[
                  { id: "all", label: "All Supporters", icon: Users, color: "text-gold" },
                  { id: "volunteers", label: "Volunteers", icon: Heart, color: "text-green-400" },
                  { id: "donors", label: "Donors", icon: DollarSign, color: "text-blue-400" },
                  { id: "ambassadors", label: "Ambassadors", icon: Megaphone, color: "text-purple-400" },
                  { id: "specific", label: "Specific Person", icon: User, color: "text-yellow-400" },
                  { id: "custom", label: "Custom Email", icon: Mail, color: "text-orange-400" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setRecipientType(option.id);
                      if (option.id !== "specific" && option.id !== "custom") {
                        fetchRecipients();
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${recipientType === option.id
                        ? "bg-gold/10 border border-gold/30"
                        : "hover:bg-gold/5"
                      }`}
                  >
                    <option.icon className={`h-5 w-5 ${option.color}`} />
                    <span className="text-text-light text-sm">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipients List */}
            {(recipientType === "all" || recipientType === "volunteers" || recipientType === "donors" || recipientType === "ambassadors") && (
              <div className="bg-bg-card/50 rounded-xl border border-gold/20 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-montserrat font-semibold text-text-light">Recipients</h3>
                  <button
                    onClick={fetchRecipients}
                    className="p-1 text-gold hover:text-gold-light transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-2xl font-bold text-gold mb-2">{recipientCount}</p>
                <p className="text-text-dim text-sm">people will receive this message</p>
                {recipientCount > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto space-y-1">
                    {recipients.slice(0, 10).map((r, idx) => (
                      <div key={idx} className="text-xs text-text-dim truncate">
                        {r.name} - {r.email}
                      </div>
                    ))}
                    {recipientCount > 10 && (
                      <div className="text-xs text-gold mt-1">+{recipientCount - 10} more</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Specific Person Selection */}
            {recipientType === "specific" && (
              <div className="bg-bg-card/50 rounded-xl border border-gold/20 p-4">
                <h3 className="font-montserrat font-semibold text-text-light mb-3">Select Person</h3>
                <select
                  value={selectedRecipient}
                  onChange={(e) => {
                    setSelectedRecipient(e.target.value);
                    fetchRecipients();
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none mb-3"
                >
                  <option value="">Select a supporter</option>
                  {recipients.map((r, idx) => (
                    <option key={idx} value={r.email}>
                      {r.name} - {r.email}
                    </option>
                  ))}
                </select>
                {selectedRecipient && (
                  <p className="text-xs text-gold">1 person will receive this message</p>
                )}
              </div>
            )}

            {/* Custom Email */}
            {recipientType === "custom" && (
              <div className="bg-bg-card/50 rounded-xl border border-gold/20 p-4">
                <h3 className="font-montserrat font-semibold text-text-light mb-3">Custom Recipient</h3>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none mb-3"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none"
                />
                {customEmail && (
                  <p className="text-xs text-gold mt-2">1 person will receive this message</p>
                )}
              </div>
            )}
          </div>

          {/* Message Preview */}
          <div className="md:col-span-3">
            <div className="bg-bg-card/50 rounded-xl border border-gold/20 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-montserrat font-semibold text-text-light">Message Preview</h3>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg border border-gold/20 text-gold hover:bg-gold/10 transition-colors text-sm"
                >
                  <FileText className="h-4 w-4" />
                  Templates
                </button>
              </div>

              {/* Templates Dropdown */}
              {showTemplates && templates.length > 0 && (
                <div className="mb-4 p-3 bg-gold/5 rounded-lg border border-gold/20">
                  <p className="text-xs text-gold mb-2">Select a template:</p>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => loadTemplate(template.id)}
                        className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs hover:bg-gold/20 transition-colors"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gold mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none"
                />
              </div>

              {/* Message Body */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gold mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={12}
                  placeholder="Write your message here... You can use HTML for formatting."
                  className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light focus:border-gold focus:outline-none resize-none font-mono text-sm"
                />
              </div>

              {/* Preview Section */}
              <div className="mt-4 p-4 bg-bg-dark/30 rounded-lg border border-gold/10">
                <h4 className="text-xs font-semibold text-gold mb-2">Preview</h4>
                <div className="prose prose-invert max-w-none">
                  <div className="text-text-light whitespace-pre-wrap">{message}</div>
                </div>
              </div>

              {/* Send Button */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={sendEmails}
                  disabled={isLoading || (!subject || !message) || (recipientType === "custom" && !customEmail) || (recipientType !== "custom" && recipientCount === 0)}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-gold to-gold-light text-bg-dark font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-bg-dark border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send to {recipientType === "custom" ? "1 person" : `${recipientCount} recipients`}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-bg-card rounded-2xl border border-gold/30 shadow-2xl">
            <div className="sticky top-0 bg-bg-card border-b border-gold/20 p-4 flex justify-between items-center">
              <h2 className="font-montserrat text-xl font-bold text-gold">Compose Message</h2>
              <button
                onClick={() => setShowComposeModal(false)}
                className="p-1 rounded-full hover:bg-gold/10 transition-colors"
              >
                <X className="h-5 w-5 text-text-dim" />
              </button>
            </div>
            <div className="p-6">
              {/* Same content as above but in modal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recipient selection */}
                <div className="space-y-4">
                  {/* ... recipient selection UI ... */}
                </div>
                {/* Message composition */}
                <div className="md:col-span-2">
                  {/* ... message UI ... */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-bg-card rounded-2xl border border-gold/30 shadow-2xl">
            <div className="sticky top-0 bg-bg-card border-b border-gold/20 p-4 flex justify-between items-center">
              <h2 className="font-montserrat text-xl font-bold text-gold">Email Preview</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-full hover:bg-gold/10 transition-colors"
              >
                <X className="h-5 w-5 text-text-dim" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-light mb-2">{subject}</h3>
              <div className="prose prose-invert max-w-none">
                <div className="text-text-light whitespace-pre-wrap">{message}</div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="mt-4 w-full py-2 rounded-lg bg-gold text-bg-dark font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
