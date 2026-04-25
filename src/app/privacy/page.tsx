"use client";

import { useRouter } from "next/navigation";
import { Shield, CheckCircle, ArrowLeft, ExternalLink, Lock, Database, Phone, Mail, MapPin, Fingerprint, Clock, FileText, Users, Share2, AlertTriangle, Globe, Server, Eye, Trash2, Building } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  const handleAcceptAndReturn = () => {
    // Store acceptance in localStorage
    localStorage.setItem("privacyPolicyAccepted", "true");
    localStorage.setItem("privacyPolicyAcceptedAt", new Date().toISOString());

    // Go back to previous page
    router.back();
  };

  return (
    <main className="min-h-screen bg-bg-dark py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-text-dim hover:text-gold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <Card className="p-6 md:p-8 lg:p-10">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/20 mb-4">
              <Shield className="h-10 w-10 text-gold" />
            </div>
            <h1 className="font-montserrat text-3xl md:text-4xl font-bold text-gold mb-2">
              Privacy Policy
            </h1>
            <p className="text-text-dim text-sm">
              Last Updated: April 2026
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1">
              <Lock className="h-3 w-3 text-gold" />
              <span className="text-xs text-gold"> #MulilaTheThird - Kitui County</span>
            </div>
          </div>

          <div className="space-y-8 text-text-dim">
            {/* Section 1 */}
            <section className="space-y-3">
              <div className="flex items-center gap-3 border-b border-gold/20 pb-2">
                <Database className="h-5 w-5 text-gold" />
                <h2 className="text-xl font-semibold text-gold">1. Information We Collect</h2>
              </div>
              <p className="text-sm leading-relaxed">
                Mulila Campaign, in partnership with <span className="text-gold font-semibold">Pasbest Ventures Ltd</span>, collects the following information to build a genuine supporter base
                and ensure the integrity of our campaign's supporter database:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3 text-sm">
                <li><span className="text-gold font-semibold">Full Name</span> - To identify and address you personally</li>
                <li><span className="text-gold font-semibold">Email Address</span> - For campaign updates, event invitations, and important announcements</li>
                <li><span className="text-gold font-semibold">Phone Number</span> - For SMS alerts, OTP verification, and urgent campaign communications</li>
                <li><span className="text-gold font-semibold">ID Number</span> - For verification purposes and to prevent duplicate registrations</li>
                <li><span className="text-gold font-semibold">County, Constituency & Ward</span> - To organize constituency-level campaign activities</li>
                <li><span className="text-gold font-semibold">Device Information</span> - Browser type, device fingerprint, and IP address for security</li>
                <li><span className="text-gold font-semibold">Interaction Data</span> - Mouse movements, clicks, and time spent on forms (bot detection)</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <div className="flex items-center gap-3 border-b border-gold/20 pb-2">
                <Users className="h-5 w-5 text-gold" />
                <h2 className="text-xl font-semibold text-gold">2. How We Use Your Information</h2>
              </div>
              <p className="text-sm leading-relaxed">
                Your information is used exclusively for campaign purposes:
              </p>
              <div className="grid gap-3 mt-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gold/5 border border-gold/10">
                  <Mail className="h-4 w-4 text-gold mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-text-light text-sm">Campaign Communications</h3>
                    <p className="text-xs text-text-dim">Send updates, event invitations, and volunteer opportunities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gold/5 border border-gold/10">
                  <Phone className="h-4 w-4 text-gold mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-text-light text-sm">SMS Verification</h3>
                    <p className="text-xs text-text-dim">OTP verification to ensure phone numbers are valid and belong to real supporters</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gold/5 border border-gold/10">
                  <MapPin className="h-4 w-4 text-gold mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-text-light text-sm">Constituency Organization</h3>
                    <p className="text-xs text-text-dim">Organize ward and constituency-level campaign activities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gold/5 border border-gold/10">
                  <Fingerprint className="h-4 w-4 text-gold mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-text-light text-sm">Bot Detection & Security</h3>
                    <p className="text-xs text-text-dim">Prevent automated registrations and ensure database integrity</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 - Bot Detection */}
            <section className="space-y-3">
              <div className="flex items-center gap-3 border-b border-gold/20 pb-2">
                <Fingerprint className="h-5 w-5 text-gold" />
                <h2 className="text-xl font-semibold text-gold">3. Bot Detection & Security Measures</h2>
              </div>
              <p className="text-sm leading-relaxed">
                We employ advanced security measures to ensure only genuine supporters join Team Mulila:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3 text-sm">
                <li><span className="text-gold font-semibold">client-trace Technology</span> - Analyzes mouse movements and interaction patterns</li>
                <li><span className="text-gold font-semibold">Device Fingerprinting</span> - Prevents multiple registrations from the same device</li>
                <li><span className="text-gold font-semibold">Rate Limiting</span> - Limits OTP requests to prevent SMS abuse (3 per hour)</li>
                <li><span className="text-gold font-semibold">Phone Number Verification</span> - OTP verification ensures valid phone numbers</li>
                <li><span className="text-gold font-semibold">Email Validation</span> - Email format verification and uniqueness checking</li>
                <li><span className="text-gold font-semibold">Duplicate Detection</span> - Prevents duplicate registrations by email, phone, or ID</li>
              </ul>
              <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />
                  <p className="text-xs text-amber-400">
                    These security measures are in place to protect the integrity of our supporter database.
                    Automated registrations, bots, or suspicious activity will be blocked.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 - Data Protection */}
            <section className="space-y-3">
              <div className="flex items-center gap-3 border-b border-gold/20 pb-2">
                <Lock className="h-5 w-5 text-gold" />
                <h2 className="text-xl font-semibold text-gold">4. Data Protection & Security</h2>
              </div>
              <p className="text-sm leading-relaxed">
                Your data is protected by <span className="text-gold font-semibold">Pasbest Ventures Ltd</span> with industry-standard security measures:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3 text-sm">
                <li><span className="text-gold font-semibold">Encryption</span> - All data is encrypted in transit (TLS/SSL) and at rest</li>
                <li><span className="text-gold font-semibold">Secure Database</span> - Hosted on secure infrastructure with Row Level Security (RLS)</li>
                <li><span className="text-gold font-semibold">Access Control</span> - Only authorized campaign personnel and Pasbest Ventures Ltd staff can access data</li>
                <li><span className="text-gold font-semibold">Regular Backups</span> - Automated backups to prevent data loss</li>
                <li><span className="text-gold font-semibold">No Third-Party Sharing</span> - We do not sell, trade, or rent your personal information</li>
              </ul>
            </section>

            {/* Section 5 - Data Retention */}
            <section className="space-y-3">
              <div className="flex items-center gap-3 border-b border-gold/20 pb-2">
                <Clock className="h-5 w-5 text-gold" />
                <h2 className="text-xl font-semibold text-gold">5. Data Retention</h2>
              </div>
              <p className="text-sm leading-relaxed">
                We retain your information for as long as necessary:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3 text-sm">
                <li><span className="text-gold font-semibold">Active Supporters</span> - Data retained throughout the campaign period</li>
                <li><span className="text-gold font-semibold">Inactive Supporters</span> - May be archived after 2 years of inactivity</li>
                <li><span className="text-gold font-semibold">OTP Records</span> - Automatically deleted after 24 hours</li>
                <li><span className="text-gold font-semibold">Verification Attempts</span> - Logged temporarily for security purposes</li>
                <li><span className="text-gold font-semibold">Legal Compliance</span> - Some data may be retained as required by IEBC regulations</li>
              </ul>
            </section>

            {/* Section 6 - Your Rights */}
            <section className="space-y-3">
              <div className="flex items-center gap-3 border-b border-gold/20 pb-2">
                <FileText className="h-5 w-5 text-gold" />
                <h2 className="text-xl font-semibold text-gold">6. Your Rights</h2>
              </div>
              <p className="text-sm leading-relaxed">
                As a supporter of Team Mulila, you have the following rights:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-gold" />
                  <span>Right to access your personal data</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-gold" />
                  <span>Right to correct inaccurate data</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Trash2 className="h-4 w-4 text-gold" />
                  <span>Right to request data deletion</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gold" />
                  <span>Right to opt out of communications</span>
                </div>
              </div>
              <p className="text-sm mt-3">
                To exercise these rights, contact our Data Protection Officer at: <span className="text-gold">info@pasbestventures.com</span>
              </p>
            </section>

            {/* Section 7 - IEBC Compliance */}
            <section className="space-y-3">
              <div className="flex items-center gap-3 border-b border-gold/20 pb-2">
                <Shield className="h-5 w-5 text-gold" />
                <h2 className="text-xl font-semibold text-gold">7. IEBC Compliance</h2>
              </div>
              <p className="text-sm leading-relaxed">
                As a political campaign, Team Mulila complies with all Independent Electoral and Boundaries Commission (IEBC) regulations:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3 text-sm">
                <li>Data collection follows IEBC guidelines for political campaigns</li>
                <li>Supporter information may be reported to IEBC as required by law</li>
                <li>Campaign financing disclosures include supporter contribution records</li>
                <li>All data handling practices are auditable and transparent</li>
              </ul>
            </section>

            {/* Section 8 - Cookies & Tracking */}
            <section className="space-y-3">
              <div className="flex items-center gap-3 border-b border-gold/20 pb-2">
                <Globe className="h-5 w-5 text-gold" />
                <h2 className="text-xl font-semibold text-gold">8. Cookies & Tracking Technologies</h2>
              </div>
              <p className="text-sm leading-relaxed">
                We use the following tracking technologies:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3 text-sm">
                <li><span className="text-gold font-semibold">Local Storage</span> - For device fingerprinting and session management</li>
                <li><span className="text-gold font-semibold">Session Storage</span> - For active form session tracking</li>
                <li><span className="text-gold font-semibold">Analytics</span> - Anonymous usage statistics to improve user experience</li>
                <li><span className="text-gold font-semibold">No Third-Party Cookies</span> - We do not use advertising or tracking cookies</li>
              </ul>
            </section>

            {/* Section 9 - Data Sharing */}
            <section className="space-y-3">
              <div className="flex items-center gap-3 border-b border-gold/20 pb-2">
                <Share2 className="h-5 w-5 text-gold" />
                <h2 className="text-xl font-semibold text-gold">9. Data Sharing & Third Parties</h2>
              </div>
              <p className="text-sm leading-relaxed">
                We share your data only when necessary:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3 text-sm">
                <li><span className="text-gold font-semibold">Africa's Talking</span> - For SMS OTP delivery (phone numbers only)</li>
                <li><span className="text-gold font-semibold">Supabase</span> - Our database and authentication provider</li>
                <li><span className="text-gold font-semibold">Vercel / VPS</span> - Our hosting platform</li>
                <li><span className="text-gold font-semibold">IEBC</span> - As required by electoral regulations</li>
                <li><span className="text-gold font-semibold">Pasbest Ventures Ltd</span> - Data protection and security partner</li>
                <li><span className="text-gold font-semibold">No Marketing Companies</span> - We never sell your data to third parties</li>
              </ul>
            </section>

            {/* Section 10 - Children's Privacy */}
            <section className="space-y-3">
              <div className="flex items-center gap-3 border-b border-gold/20 pb-2">
                <Users className="h-5 w-5 text-gold" />
                <h2 className="text-xl font-semibold text-gold">10. Children's Privacy</h2>
              </div>
              <p className="text-sm leading-relaxed">
                Our campaign services are intended for individuals 18 years and older (eligible voters in Kenya).
                We do not knowingly collect information from minors. If you believe a minor has provided us with
                personal information, please contact us immediately.
              </p>
            </section>

            {/* Section 11 - Updates to Policy */}
            <section className="space-y-3">
              <div className="flex items-center gap-3 border-b border-gold/20 pb-2">
                <Clock className="h-5 w-5 text-gold" />
                <h2 className="text-xl font-semibold text-gold">11. Updates to This Policy</h2>
              </div>
              <p className="text-sm leading-relaxed">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with
                an updated revision date. Significant changes will be notified via email or website banner.
              </p>
              <p className="text-sm mt-2">
                We encourage you to review this policy periodically to stay informed about how we protect your data.
              </p>
            </section>

            {/* Section 12 - Contact Information */}
            <section className="space-y-3">
              <div className="flex items-center gap-3 border-b border-gold/20 pb-2">
                <Server className="h-5 w-5 text-gold" />
                <h2 className="text-xl font-semibold text-gold">12. Contact Us</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p>For questions about this Privacy Policy or your data:</p>
                <div className="grid gap-3 mt-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gold/5 border border-gold/10">
                    <Mail className="h-5 w-5 text-gold" />
                    <div>
                      <p className="text-xs text-text-dim">Email</p>
                      <a href="mailto:info@pasbestventures.com" className="text-gold hover:underline">
                        info@pasbestventures.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gold/5 border border-gold/10">
                    <Phone className="h-5 w-5 text-gold" />
                    <div>
                      <p className="text-xs text-text-dim">Phone / WhatsApp</p>
                      <a href="tel:+254795751700" className="text-gold hover:underline">
                        +254 795 751 700
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gold/5 border border-gold/10">
                    <Building className="h-5 w-5 text-gold" />
                    <div>
                      <p className="text-xs text-text-dim">Data Protection Partner</p>
                      <p className="text-sm text-text-light">Pasbest Ventures Ltd</p>
                      <div className="flex items-center gap-2 mt-1">
                        <img
                          src="https://backoffice.pasbestventures.com/storage/uploads/logo/6-logo-dark.png?1775304496"
                          alt="Pasbest Ventures Ltd"
                          className="h-30 object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Summary Box */}
            <div className="mt-6 p-4 rounded-lg bg-gold/10 border border-gold/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-text-light text-sm mb-1">Summary of Data Collection</h3>
                  <p className="text-xs text-text-dim">
                    We collect only the information needed to build an accurate supporter database for Hon. Nicholas Mulila's
                    gubernatorial campaign in Kitui County. Your data is secured by <span className="text-gold">Pasbest Ventures Ltd</span>,
                    never sold, and used solely for campaign communications, event organization, and IEBC compliance.
                    You have full control over your data and can request deletion at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acceptance Button */}
          <div className="mt-8 pt-6 border-t border-gold/20 text-center">
            <button
              onClick={handleAcceptAndReturn}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-gold to-gold-light text-bg-dark font-semibold hover:shadow-lg hover:shadow-gold/20 transition-all"
            >
              <CheckCircle className="h-5 w-5" />
              I Accept the Privacy Policy
              <ExternalLink className="h-4 w-4" />
            </button>
            <p className="text-xs text-text-dim mt-3">
              By accepting, you agree to the collection and use of your information as described above.
              Your data is protected by <span className="text-gold">Pasbest Ventures Ltd</span>. You can withdraw your consent at any time.
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
