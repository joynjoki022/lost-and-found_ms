"use client";

import { useState } from "react";
import { Users, Award, Globe, Heart } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

const constituencies = [
  "Kitui Central", "Kitui West", "Kitui East", "Kitui South",
  "Kitui Rural", "Mwingi Central", "Mwingi North", "Mwingi West"
];

const wards: Record<string, string[]> = {
  "Kitui Central": ["Township", "Kisasi", "Miambani", "Mulango", "Kyangwithya"],
  "Kitui West": ["Mutitu", "Kauwi", "Matinyani", "Kwa Mutonga"],
  "Kitui East": ["Zombe", "Nzunguni", "Voo Kyamatu", "Endau Malalani", "Mutito", "Mbusyani"],
  "Kitui South": ["Ikanga", "Mutomo", "Mutha", "Ikutha", "Kanziko", "Athi"],
  "Kitui Rural": ["Kisasi", "Mwitika", "Kanyangi", "Migwani"],
  "Mwingi Central": ["Mwingi", "Nuu", "Mui", "Waita", "Kivou"],
  "Mwingi North": ["Kyuso", "Tseikuru", "Tharaka", "Nguni", "Ngomeni", "Mumoni"],
  "Mwingi West": ["Migwani", "Ngomeni", "Kivou", "Nguni"],
};

export default function VolunteerSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    constituency: "",
    ward: "",
    skills: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for volunteering! Our team will contact you soon.");
    setFormData({ name: "", email: "", phone: "", constituency: "", ward: "", skills: "" });
  };

  return (
    <section id="volunteer" className="bg-bg-card py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-montserrat text-4xl font-bold md:text-5xl">
            <span className="text-gold">VOLUNTEER</span> WITH US
          </h2>
          <p className="mt-4 text-text-dim">
            Be part of the change. Your time and skills can make a difference in Kitui County.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Info Cards */}
          <div className="space-y-6">
            <Card title="Why Volunteer?" className="bg-bg-dark">
              <ul className="space-y-3">
                {[
                  { icon: Users, text: "Be part of Kitui's transformation" },
                  { icon: Award, text: "Gain leadership experience" },
                  { icon: Globe, text: "Build your network across the county" },
                  { icon: Heart, text: "Make a real impact in your community" },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-text-light">
                    <item.icon className="h-5 w-5 text-gold" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Movement Stats" className="bg-bg-dark">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold">5,234+</div>
                  <div className="text-sm text-text-dim">Active Volunteers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold">8</div>
                  <div className="text-sm text-text-dim">Constituencies</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Form */}
          <Card title="Join Our Team" className="bg-bg-dark">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gold/20 bg-bg-dark/50 p-3 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gold/20 bg-bg-dark/50 p-3 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none"
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-gold/20 bg-bg-dark/50 p-3 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none"
                required
              />
              <select
                name="constituency"
                value={formData.constituency}
                onChange={handleChange}
                className="w-full rounded-lg border border-gold/20 bg-bg-dark/50 p-3 text-text-light focus:border-gold focus:outline-none"
                required
              >
                <option value="">Select Constituency</option>
                {constituencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                disabled={!formData.constituency}
                className="w-full rounded-lg border border-gold/20 bg-bg-dark/50 p-3 text-text-light focus:border-gold focus:outline-none disabled:opacity-50"
                required
              >
                <option value="">Select Ward</option>
                {formData.constituency && wards[formData.constituency]?.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              <textarea
                name="skills"
                placeholder="Your Skills/Experience"
                value={formData.skills}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-gold/20 bg-bg-dark/50 p-3 text-text-light placeholder:text-text-dim focus:border-gold focus:outline-none"
              />
              <Button variant="primary" className="w-full justify-center">
                Join Volunteer Team
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
}
