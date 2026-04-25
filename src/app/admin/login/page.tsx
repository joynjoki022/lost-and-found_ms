"use client";

import { useState, useEffect } from "react";
import {
  Shield, Lock, Mail, AlertCircle, Eye, EyeOff,
  Sparkles, Fingerprint, Key, Database
} from "lucide-react";
import { supabase } from '../../../../lib/supabase/client';

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{ left: string; top: string; delay: string; duration: string }>>([]);

  useEffect(() => {
    setMounted(true);
    const generatedParticles = Array.from({ length: 30 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 10 + 5}s`
    }));
    setParticles(generatedParticles);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Get IP address
      let ipAddress = "unknown";
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (ipError) {
        console.error("Failed to get IP:", ipError);
      }

      const { data, error: loginError } = await supabase.functions.invoke('admin-login', {
        body: JSON.stringify({
          email,
          password,
          ipAddress,
          userAgent: navigator.userAgent
        })
      });

      if (loginError || !data.success) {
        setError(data?.error || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      // Store session token
      localStorage.setItem("admin_token", data.data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.data.user));

      window.location.href = "/admin/dashboard";

    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0A0A0A] via-[#0F1F38] to-[#0A1628]">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gold/20 rounded-full animate-float"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.delay,
                animationDuration: particle.duration
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-2xl">
                <Shield className="h-10 w-10 text-bg-dark" />
              </div>
            </div>
            <h1 className="font-montserrat text-3xl font-bold text-gold mt-4 tracking-tight">
              Admin Portal
            </h1>
            <p className="text-text-dim text-sm mt-2">
              Secure access to campaign management dashboard
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gold to-gold-light rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-bg-card/80 backdrop-blur-xl rounded-2xl border border-gold/30 p-8 shadow-2xl">
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-1 text-gold/40">
                  <Fingerprint className="h-3 w-3" />
                  <span className="text-[10px]">Secure Login</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gold tracking-wider">
                    EMAIL ADDRESS
                  </label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'transform scale-[1.02]' : ''}`}>
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-gold' : 'text-text-dim'}`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="admin@pasbestventures.com"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-bg-dark/50 text-text-light placeholder:text-text-dim/50 focus:border-gold focus:outline-none transition-all duration-300"
                    />
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-gold to-gold-light transition-all duration-500 ${focusedField === 'email' ? 'w-full' : 'w-0'}`} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gold tracking-wider">
                    PASSWORD
                  </label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-gold' : 'text-text-dim'}`} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3 rounded-xl border-2 bg-bg-dark/50 text-text-light placeholder:text-text-dim/50 focus:border-gold focus:outline-none transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim hover:text-gold transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-gold to-gold-light transition-all duration-500 ${focusedField === 'password' ? 'w-full' : 'w-0'}`} />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 animate-shake">
                    <AlertCircle className="h-4 w-4 text-red-400 animate-pulse" />
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full py-3 rounded-xl bg-gradient-to-r from-gold to-gold-light text-bg-dark font-semibold overflow-hidden group/btn transition-all duration-300 hover:shadow-lg hover:shadow-gold/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-gold-light to-gold transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-bg-dark border-t-transparent rounded-full animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4" />
                        Access Dashboard
                        <Sparkles className="h-4 w-4" />
                      </>
                    )}
                  </span>
                </button>

                <div className="pt-4 border-t border-gold/20">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                        <Lock className="h-4 w-4 text-gold" />
                      </div>
                      <span className="text-[10px] text-text-dim">256-bit SSL</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                        <Database className="h-4 w-4 text-gold" />
                      </div>
                      <span className="text-[10px] text-text-dim">Encrypted</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-[10px] text-text-dim/40">
              © 2026 Team Mulila Campaign. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-float {
          animation: float linear infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        .delay-1000 { animation-delay: 1s; }
        .delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}
