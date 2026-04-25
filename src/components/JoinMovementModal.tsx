"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  X, Shield, User, Mail, Phone, MapPin, CheckCircle, AlertCircle,
  Sparkles, Fingerprint, MousePointer, Clock, ExternalLink, Lock, ChevronDown
} from "lucide-react";

// Import the libraries
import * as clientTrace from "client-trace";
import {
  getConstituencies,
  getWards
} from "kenya-locations";
import { registerSupporter } from "../../lib/supabase/functions";
import { useToast } from "../components/ui/Toast";
import OTPVerificationModal from './OTPVerificationModal';
import { DeviceFingerprint } from '../lib/device-fingerprint';

interface JoinMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistrationSuccess?: () => void; // Add callback for successful registration
}

interface ConstituencyOption {
  code: string;
  name: string;
  county: string;
}

interface WardOption {
  code: string;
  name: string;
  constituency: string;
}

export default function JoinMovementModal({ isOpen, onClose, onRegistrationSuccess }: JoinMovementModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPrivacyWarning, setShowPrivacyWarning] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingPhone, setPendingPhone] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("");

  // Initialize with empty values - NO PREFILLING
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    idNumber: "",
    county: "Kitui",
    constituency: "",
    ward: "",
  });

  // Data from library
  const [constituencies, setConstituencies] = useState<ConstituencyOption[]>([]);
  const [wards, setWards] = useState<WardOption[]>([]);
  const [filteredConstituencies, setFilteredConstituencies] = useState<ConstituencyOption[]>([]);
  const [filteredWards, setFilteredWards] = useState<WardOption[]>([]);

  // UI states
  const [showConstituencyDropdown, setShowConstituencyDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [botScore, setBotScore] = useState<number>(0);
  const [isHuman, setIsHuman] = useState<boolean>(false);
  const [securityReport, setSecurityReport] = useState<any>(null);

  // Mouse tracking refs
  const mouseMovementsRef = useRef<{ x: number; y: number; timestamp: number }[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const clicksRef = useRef<number>(0);
  const keyPressesRef = useRef<number>(0);
  const formInitializedRef = useRef<boolean>(false);
  const toastShownRef = useRef<boolean>(false);

  // Generate device fingerprint on mount
  useEffect(() => {
    const generateFingerprint = async () => {
      const fingerprint = DeviceFingerprint.getInstance();
      const fp = await fingerprint.generateFingerprint();
      setDeviceFingerprint(fp);
      console.log("🔐 Device fingerprint generated:", fp.substring(0, 20) + "...");
    };
    generateFingerprint();
  }, []);

  // Load Kenya locations data on mount
  useEffect(() => {
    if (formInitializedRef.current) return;
    formInitializedRef.current = true;

    try {
      const allConstituencies = getConstituencies();
      const constituenciesList: ConstituencyOption[] = allConstituencies.map((c: any) => ({
        code: c.code,
        name: c.name,
        county: c.county
      }));
      setConstituencies(constituenciesList);

      const kituiConstituencies = constituenciesList.filter(c => c.county === "Kitui");
      setFilteredConstituencies(kituiConstituencies);

      const allWards = getWards();
      const wardsList: WardOption[] = allWards.map((w: any) => ({
        code: w.code,
        name: w.name,
        constituency: w.constituency
      }));
      setWards(wardsList);

    } catch (error) {
      console.error("Error loading Kenya locations:", error);
      showToast("Error loading location data. Please refresh the page.", "error");
    }
  }, []);

  // Update wards when constituency changes
  useEffect(() => {
    if (formData.constituency) {
      const wardsForConstituency = wards.filter(w => w.constituency === formData.constituency);
      setFilteredWards(wardsForConstituency);
      setFormData(prev => ({ ...prev, ward: "" }));
    } else {
      setFilteredWards([]);
    }
  }, [formData.constituency, wards]);

  // Check if privacy policy was already accepted
  useEffect(() => {
    const accepted = localStorage.getItem("privacyPolicyAccepted") === "true";
    setPrivacyAccepted(accepted);
  }, []);

  // Advanced bot detection using client-trace
  useEffect(() => {
    if (!isOpen) return;

    const runClientTraceChecks = async () => {
      try {
        const report = await clientTrace.collectSecurityReport({
          bundleUrl: '/_next/static/chunks/main.js',
          pingUrl: '/api/ping',
          userUniqueId: `user-${Date.now()}`,
          secret: 'temp-secret-123'
        });
        setSecurityReport(report);

        const botDetection = await clientTrace.detectBot();
        const networkCheck = clientTrace.detectNetworkAPITampering();

        let score = 0;

        if (mouseMovementsRef.current.length > 5) score += 15;
        if (mouseMovementsRef.current.length > 15) score += 15;
        if (mouseMovementsRef.current.length > 30) score += 10;

        const timeSpent = (Date.now() - startTimeRef.current) / 1000;
        if (timeSpent > 2) score += 10;
        if (timeSpent > 5) score += 10;
        if (timeSpent > 10) score += 10;

        if (clicksRef.current > 0) score += 10;
        if (keyPressesRef.current > 3) score += 10;

        if (botDetection && !botDetection.botLikely) score += 10;
        if (networkCheck && !networkCheck.tampered) score += 10;

        const finalScore = Math.min(100, score + 30);
        setBotScore(finalScore);
        setIsHuman(finalScore >= 40);

      } catch (error) {
        console.error("Client-trace security check failed:", error);
        setIsHuman(true);
        setBotScore(70);
      }
    };

    runClientTraceChecks();

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameRef.current) return;

      animationFrameRef.current = requestAnimationFrame(() => {
        mouseMovementsRef.current.push({
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now()
        });

        if (mouseMovementsRef.current.length > 200) {
          mouseMovementsRef.current = mouseMovementsRef.current.slice(-200);
        }

        animationFrameRef.current = undefined;
      });
    };

    const handleClick = () => {
      clicksRef.current++;
    };

    const handleKeyPress = () => {
      keyPressesRef.current++;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keypress", handleKeyPress);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectConstituency = (constituencyName: string) => {
    setFormData(prev => ({ ...prev, constituency: constituencyName, ward: "" }));
    setShowConstituencyDropdown(false);
  };

  const handleSelectWard = (wardName: string) => {
    setFormData(prev => ({ ...prev, ward: wardName }));
    setShowWardDropdown(false);
  };

  const handlePrivacyAccept = () => {
    router.push("/privacy");
  };

  const validateForm = () => {
    if (!privacyAccepted) {
      setShowPrivacyWarning(true);
      showToast("Please accept the Privacy Policy to continue", "warning");
      return false;
    }
    if (!formData.fullName || formData.fullName.length < 3) {
      showToast("Please enter your full name", "error");
      return false;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showToast("Please enter a valid email address", "error");
      return false;
    }
    if (!formData.phone || formData.phone.length < 10) {
      showToast("Please enter a valid phone number", "error");
      return false;
    }
    const kenyanPhoneRegex = /^(07|01|02)[0-9]{8}$/;
    if (!kenyanPhoneRegex.test(formData.phone)) {
      showToast("Please enter a valid Kenyan phone number", "error");
      return false;
    }
    if (!formData.idNumber || formData.idNumber.length < 6) {
      showToast("Please enter a valid ID number", "error");
      return false;
    }
    if (!formData.constituency) {
      showToast("Please select your constituency", "error");
      return false;
    }
    if (!formData.ward) {
      showToast("Please select your ward", "error");
      return false;
    }
    if (!isHuman) {
      showToast("Please interact with the form to verify you're human", "warning");
      return false;
    }
    return true;
  };

  const handleOTPVerified = () => {
    setIsPhoneVerified(true);
    submitRegistration();
  };

  const submitRegistration = async () => {
    setIsSubmitting(true);
    setVerificationStatus("verifying");

    try {
      const finalBotCheck = await clientTrace.detectBot();
      const finalNetworkCheck = clientTrace.detectNetworkAPITampering();

      if (finalBotCheck?.botLikely || finalNetworkCheck?.tampered) {
        setVerificationStatus("error");
        setIsSubmitting(false);
        showToast("Registration failed. Please try again.", "error");
        return;
      }

      const result = await registerSupporter({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        idNumber: formData.idNumber,
        county: formData.county,
        constituency: formData.constituency,
        ward: formData.ward,
        botScore: botScore,
        isHuman: isHuman,
        mouseMovements: mouseMovementsRef.current.length,
        clicks: clicksRef.current,
        keyPresses: keyPressesRef.current,
        timeSpent: Math.floor((Date.now() - startTimeRef.current) / 1000),
        securityReport: securityReport,
        deviceFingerprint: deviceFingerprint
      });

      if (result.success) {
        setVerificationStatus("success");

        // Show single success toast only once
        if (!toastShownRef.current) {
          toastShownRef.current = true;
          showToast("Successfully joined Team Mulila! Welcome aboard! 🎉", "success");
        }

        // Call the success callback to refresh parent component data
        if (onRegistrationSuccess) {
          onRegistrationSuccess();
        }

        // Force a hard refresh of the page to update all counters
        setTimeout(() => {
          // Option 1: Soft refresh - reload the page
          window.location.reload();

          // Option 2: Or just refresh the counter by calling the callback
          // The parent component will handle the refresh
        }, 1500);

        setTimeout(() => {
          setFormData({
            fullName: "",
            email: "",
            phone: "",
            idNumber: "",
            county: "Kitui",
            constituency: "",
            ward: "",
          });
          setVerificationStatus("idle");
          setIsPhoneVerified(false);
          toastShownRef.current = false;
          onClose();
        }, 2000);
      } else {
        // Generic error - no details exposed
        setVerificationStatus("error");
        showToast("Registration failed. Please try again.", "error");
      }

    } catch (error) {
      console.error("Submission failed:", error);
      setVerificationStatus("error");
      showToast("Registration failed. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setRegistrationData(formData);
    setPendingPhone(formData.phone);
    setShowOTPModal(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-bg-dark to-bg-card rounded-2xl shadow-2xl animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated Golden Border */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none animate-border-pulse">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold via-gold-light to-gold opacity-30 blur-xl" />
            <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-bg-dark to-bg-card" />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 rounded-full bg-black/50 p-2 text-text-dim hover:text-gold transition-colors backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="relative z-10 text-center p-6 border-b border-gold/20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/20 mb-4">
              <Shield className="h-8 w-8 text-gold" />
            </div>
            <h2 className="font-montserrat text-2xl md:text-3xl font-bold text-gold">
              Join The Movement
            </h2>
            <p className="mt-2 text-sm text-text-dim">
              Become part of Team Mulila and help build a better Kitui County
            </p>
          </div>

          {/* Bot Verification Status */}
          <div className="relative z-10 mx-6 mt-4 p-3 rounded-lg bg-gold/5 border border-gold/20">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-3 w-3 text-gold" />
                <span className="text-text-dim">Status: {isHuman ? "✓ Human Verified" : "⏳ Verification in progress..."}</span>
              </div>
              <div className="flex items-center gap-2">
                <MousePointer className="h-3 w-3 text-gold" />
                <span className="text-text-dim">Activity: {mouseMovementsRef.current.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-gold" />
                <span className="text-text-dim">Time: {Math.floor((Date.now() - startTimeRef.current) / 1000)}s</span>
              </div>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gold/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-all duration-500"
                style={{ width: `${botScore}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-text-dim">
              {isHuman
                ? "✓ Human verification complete - You can submit the form"
                : "⏳ Please interact with the form (move mouse, type, click) to verify you're human..."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative z-10 p-6 space-y-4">
            {/* County - Read Only */}
            <div>
              <label className="block text-xs font-semibold text-gold mb-1">
                County <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
                <input
                  type="text"
                  value="Kitui County"
                  disabled
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gold/20 bg-gold/5 text-text-light opacity-70 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Full Name */}
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
                  onChange={handleChange}
                  placeholder="e.g., John Mwangi"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Email */}
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
                  onChange={handleChange}
                  placeholder="e.g., john@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Phone */}
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
                  onChange={handleChange}
                  placeholder="e.g., 0712345678"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none transition-colors"
                  required
                />
              </div>
              <p className="mt-1 text-[10px] text-text-dim">Enter your Safaricom, Airtel, or Telkom Kenya number</p>
            </div>

            {/* ID Number */}
            <div>
              <label className="block text-xs font-semibold text-gold mb-1">
                ID Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  placeholder="e.g., 12345678"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Constituency - Pure Dropdown */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gold mb-1">
                Constituency <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim z-10" />
                <button
                  type="button"
                  onClick={() => setShowConstituencyDropdown(!showConstituencyDropdown)}
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light text-left focus:border-gold focus:outline-none transition-colors cursor-pointer"
                >
                  {formData.constituency || "Select Constituency"}
                </button>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim pointer-events-none"
                />
              </div>
              {showConstituencyDropdown && filteredConstituencies.length > 0 && (
                <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gold/20 bg-bg-dark shadow-lg">
                  {filteredConstituencies.map(c => (
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

            {/* Ward - Pure Dropdown */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gold mb-1">
                Ward <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim z-10" />
                <button
                  type="button"
                  onClick={() => formData.constituency && setShowWardDropdown(!showWardDropdown)}
                  className={`w-full pl-10 pr-10 py-3 rounded-lg border border-gold/20 bg-bg-dark/50 text-text-light text-left focus:border-gold focus:outline-none transition-colors ${!formData.constituency ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={!formData.constituency}
                >
                  {formData.ward || (formData.constituency ? "Select Ward" : "Select constituency first")}
                </button>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim pointer-events-none"
                />
              </div>
              {showWardDropdown && filteredWards.length > 0 && (
                <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gold/20 bg-bg-dark shadow-lg">
                  {filteredWards.map(w => (
                    <button
                      key={w.code}
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm text-text-light hover:bg-gold/10 transition-colors"
                      onClick={() => handleSelectWard(w.name)}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy Policy Agreement */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={() => setPrivacyAccepted(!privacyAccepted)}
                  className="mt-0.5 h-4 w-4 rounded border-gold/20 bg-bg-dark text-gold focus:ring-gold"
                />
                <label className="text-xs text-text-dim">
                  I have read and agree to the{" "}
                  <button
                    type="button"
                    onClick={handlePrivacyAccept}
                    className="text-gold hover:underline inline-flex items-center gap-1"
                  >
                    Privacy Policy <ExternalLink className="h-3 w-3" />
                  </button>
                </label>
              </div>
              {showPrivacyWarning && !privacyAccepted && (
                <p className="text-xs text-red-400">
                  You must accept the Privacy Policy to continue.
                </p>
              )}
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isHuman || verificationStatus === "success"}
              className="w-full py-3 rounded-full bg-gradient-to-r from-gold to-gold-light text-bg-dark font-semibold transition-all hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-bg-dark border-t-transparent rounded-full animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Join The Movement
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gold-light to-gold transition-transform duration-500 group-hover:translate-x-0" />
            </button>

            <p className="text-center text-[10px] text-text-dim">
              🔒 Your information is secure and will only be used for campaign purposes.
            </p>
          </form>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        phoneNumber={pendingPhone}
        deviceFingerprint={deviceFingerprint}  // ADD THIS LINE - pass the fingerprint
        email={formData.email}
        onClose={() => {
          setShowOTPModal(false);
          setIsPhoneVerified(false);
        }}
        onVerified={handleOTPVerified}
      />
    </>
  );
}
