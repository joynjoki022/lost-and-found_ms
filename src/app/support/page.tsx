"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Types
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: "general" | "reporting" | "finding" | "claiming" | "technical";
}

const FAQS: FAQ[] = [
  {
    id: "1",
    question: "How do I report a found item?",
    answer: "Go to the 'Report Found Item' page from the navigation menu. Fill in the item details including category, color, condition, shape, and upload a photo. Our AI will then match it with lost item reports.",
    category: "reporting"
  },
  {
    id: "2",
    question: "How does the AI matching system work?",
    answer: "Our AI analyzes the details you provide about lost or found items, including photos, descriptions, categories, and specifications. It then compares these against our database to find potential matches with high confidence scores.",
    category: "general"
  },
  {
    id: "3",
    question: "What if I can't find my lost item?",
    answer: "If you don't find a match immediately, report your item as lost. Our system will continue searching and notify you via email or SMS when potential matches are found. You can also check back regularly as new items are reported daily.",
    category: "finding"
  },
  {
    id: "4",
    question: "How do I claim an item that matches mine?",
    answer: "When you find a potential match, click 'Claim This Item'. You'll be asked verification questions about the item. Once verified, we'll connect you with the finder to arrange return.",
    category: "claiming"
  },
  {
    id: "5",
    question: "Is my personal information safe?",
    answer: "Yes! We never share your personal information publicly. Your contact details are only shared with verified matches after you decide to claim an item. All data is encrypted and protected.",
    category: "general"
  },
  {
    id: "6",
    question: "How long does it take to find a match?",
    answer: "Match times vary depending on item popularity and how recently it was lost. Some items match within hours, others may take weeks. Our AI continuously searches as new reports come in.",
    category: "finding"
  },
  {
    id: "7",
    question: "What if someone claims my item falsely?",
    answer: "Our verification process asks detailed questions about the item that only the true owner would know. This prevents false claims and ensures items go to the right person.",
    category: "claiming"
  },
  {
    id: "8",
    question: "Can I report anonymously?",
    answer: "Yes! When reporting a found item, you can choose to remain anonymous. Your identity will only be revealed if you agree to connect with the owner after verification.",
    category: "reporting"
  },
  {
    id: "9",
    question: "What should I do if I can't upload a photo?",
    answer: "Make sure your photo is under 5MB and in JPG or PNG format. If issues persist, try compressing the image or contact support for assistance.",
    category: "technical"
  },
  {
    id: "10",
    question: "How do I earn badges and rewards?",
    answer: "You earn points for every item you help return. 5 items returned earns Helper badge, 15 earns Hero badge, 30+ earns Legend badge plus certificates and monthly recognition.",
    category: "general"
  },
  {
    id: "11",
    question: "Can I edit or delete my report?",
    answer: "Yes, you can edit or delete your reports from your dashboard. Go to 'My Reports' and click on the item you want to modify.",
    category: "reporting"
  },
  {
    id: "12",
    question: "What happens after I claim an item?",
    answer: "After claiming, our system notifies the finder. You'll receive their contact information to arrange pickup. Both parties can rate the experience afterward.",
    category: "claiming"
  }
];

const CATEGORIES = [
  { id: "all", name: "All Questions" },
  { id: "general", name: "General" },
  { id: "reporting", name: "Reporting Items" },
  { id: "finding", name: "Finding Items" },
  { id: "claiming", name: "Claiming Items" },
  { id: "technical", name: "Technical Issues" }
];

export default function SupportPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = searchTerm === "" ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmitTicket = async () => {
    if (!ticketSubject.trim() || !ticketMessage.trim() || !ticketEmail.trim()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitSuccess(true);
    setIsSubmitting(false);

    setTimeout(() => {
      setShowTicketForm(false);
      setTicketSubject("");
      setTicketMessage("");
      setTicketEmail("");
      setSubmitSuccess(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200/80 shadow-sm rounded-full px-4 py-1.5 mb-4">
              <span className="text-xs font-medium text-gray-700">Support Center</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gray-900">How Can We</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> Help You?</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Find answers to common questions, get help with lost and found items, or contact our support team.
            </p>
          </div>


          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Categories */}
            <div className="lg:w-64 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                        selectedCategory === cat.id
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3">Still need help?</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Our support team is available Monday-Friday, 9am-5pm
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>📧</span>
                    <a href="mailto:support@findit.com" className="text-blue-600 hover:underline">
                      support@findit.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <span className="text-gray-600">+254 123 456 789</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 mt-1 border-t border-blue-200">
                    <span>⏰</span>
                    <span className="text-gray-600">Response within 24h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - FAQs */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl font-semibold text-gray-900">
                    Frequently Asked Questions
                  </h2>
                  <span className="text-xs text-gray-400">
                    {filteredFaqs.length} questions
                  </span>
                </div>

                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-gray-500">No questions found matching your search</p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                      }}
                      className="mt-3 text-blue-600 text-sm hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredFaqs.map((faq) => (
                      <div key={faq.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                          className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          <span className="text-gray-400 text-xl">
                            {openFaqId === faq.id ? "−" : "+"}
                          </span>
                        </button>
                        {openFaqId === faq.id && (
                          <div className="px-5 pb-4 pt-0 border-t border-gray-100 bg-gray-50">
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Still Have Questions */}
              <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Still have questions?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <button
                  onClick={() => setShowTicketForm(true)}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Ticket Modal */}
      {showTicketForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="font-heading text-xl font-semibold text-gray-900">Contact Support</h2>
                <p className="text-sm text-gray-500 mt-1">We'll get back to you within 24 hours</p>
              </div>
              <button
                onClick={() => {
                  setShowTicketForm(false);
                  setSubmitSuccess(false);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span>✕</span>
              </button>
            </div>
            <div className="p-6">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">✓</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ticket Submitted!</h3>
                  <p className="text-gray-600 text-sm">
                    Thank you for reaching out. Our support team will respond to your inquiry shortly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={ticketEmail}
                      onChange={(e) => setTicketEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Please provide details about your issue or question..."
                      rows={6}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-blue-800">
                      💡 Before submitting, check if our FAQ section has already answered your question.
                      Common issues are often resolved quickly through our help articles.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowTicketForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitTicket}
                      disabled={!ticketSubject.trim() || !ticketMessage.trim() || !ticketEmail.trim() || isSubmitting}
                      className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Ticket"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
