"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  Package,
  Sparkles,
  Shield,
  Brain,
  Zap,
  Upload,
  Search,
  Target,
  Award,
  ArrowRight,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from '../../../lib/supabase/client';
import { useToast } from "@/hooks/useToast";

const CATEGORIES = [
  "Electronics",
  "Documents",
  "Accessories",
  "Clothing",
  "Bags",
  "Keys",
  "Books",
  "Sports",
  "Other"
];

const COLORS = [
  "Black", "White", "Red", "Blue", "Green", "Yellow",
  "Purple", "Pink", "Orange", "Brown", "Gray", "Silver", "Gold"
];

const CONDITIONS = [
  "New", "Like New", "Good", "Fair", "Poor"
];

const SHAPES = [
  "Rectangle", "Square", "Circle", "Oval", "Triangle", "Irregular", "Other"
];

interface Match {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  matchScore: number;
  imageUrl?: string;
  category: string;
  color: string;
  condition: string;
  shape: string;
  brand?: string;
  size?: string;
  specialFeatures?: string;
  found_item_id: string;
}

export default function FindLostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentToast, showToast, removeToast, showSuccess, showError, showWarning, showInfo, checkRateLimit } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [lostItemId, setLostItemId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    brand: "",
    color: "",
    condition: "",
    shape: "",
    size: "",
    material: "",
    specialFeatures: "",
    location: "",
    date: "",
    name: "",
    email: "",
    phone: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Please tell us what you lost";
      if (!formData.category) newErrors.category = "Please select a category";
    } else if (step === 2) {
      if (!formData.color) newErrors.color = "Please select a color";
      if (!formData.condition) newErrors.condition = "Please select the condition";
      if (!formData.shape) newErrors.shape = "Please select the shape";
    } else if (step === 3) {
      if (!formData.location.trim()) newErrors.location = "Please tell us where you lost it";
      if (!formData.date) newErrors.date = "Please tell us when you lost it";
    } else if (step === 4) {
      if (!formData.name.trim()) newErrors.name = "Please enter your name";
      if (!formData.email.trim()) newErrors.email = "Please enter your email";
      if (!formData.phone.trim()) newErrors.phone = "Please enter your phone number";
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
      if (formData.phone && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(formData.phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `lost-items/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error('Image upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('item-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const searchForMatches = async () => {
    if (!validateStep(4)) return;

    // Check rate limit
    const rateCheck = await checkRateLimit(formData.email);
    if (!rateCheck.allowed) {
      showError(rateCheck.reason || "Rate limit exceeded. Please try again later.");
      return;
    }

    setIsSearching(true);

    try {
      const imageUrl = await uploadImage();
      const tempUserId = crypto.randomUUID();

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

      let profileId = existingProfile?.id;

      if (!profileId) {
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: tempUserId,
            email: formData.email,
            full_name: formData.name,
            phone: formData.phone,
            role: 'user',
          })
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          profileId = tempUserId;
        } else {
          profileId = newProfile.id;
        }
      }

      const fullDescription = `${formData.description || ''} ${formData.specialFeatures ? `Special features: ${formData.specialFeatures}` : ''}`.trim();

      // Insert lost item
      const { data: lostItem, error: lostError } = await supabase
        .from('lost_items')
        .insert({
          user_id: profileId,
          title: formData.title,
          description: fullDescription || formData.title,
          category: formData.category.toLowerCase(),
          brand: formData.brand || null,
          color: formData.color,
          condition: formData.condition,
          shape: formData.shape,
          size: formData.size || null,
          material: formData.material || null,
          special_features: formData.specialFeatures || null,
          location: formData.location,
          lost_date: formData.date,
          status: 'pending',
          image_urls: imageUrl ? [imageUrl] : [],
        })
        .select()
        .single();

      if (lostError) {
        console.error('Error saving lost item:', lostError);
        showWarning('Your item has been reported, but we encountered an issue. Our team will review it shortly.');
        setShowResults(true);
        setMatches([]);
        setIsSearching(false);
        return;
      }

      setLostItemId(lostItem.id);

      // Invoke the find-matches edge function
      const { data: edgeResponse, error: edgeError } = await supabase.functions.invoke('find-matches', {
        body: JSON.stringify({
          lostItemId: lostItem.id,
          userId: profileId,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
        }),
      });

      if (edgeError) {
        console.error('Edge function error:', edgeError);
        // Fallback to local matching
        const { data: foundItems } = await supabase
          .from('found_items')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (foundItems) {
          const localMatches = calculateLocalMatches(lostItem, foundItems);
          setMatches(localMatches);
          if (localMatches.length > 0) {
            showSuccess(`Found ${localMatches.length} potential match${localMatches.length > 1 ? 'es' : ''}!`);
          } else {
            showInfo('No matches found yet. We will notify you if something matches later.');
          }
        }
      } else if (edgeResponse?.matches) {
        setMatches(edgeResponse.matches);

        if (edgeResponse.matches.length > 0) {
          showSuccess(`Found ${edgeResponse.matches.length} potential match${edgeResponse.matches.length > 1 ? 'es' : ''}!`);

          // Send notification if matches found
          await supabase.functions.invoke('send-match-notification', {
            body: JSON.stringify({
              email: formData.email,
              name: formData.name,
              itemTitle: formData.title,
              matchCount: edgeResponse.matches.length,
              searchDate: new Date().toISOString(),
            }),
          });
        } else {
          showInfo('No matches found yet. We will notify you if something matches later.');
        }
      }

      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      showError('An error occurred while searching for matches. Your item has been reported.');
      setShowResults(true);
      setMatches([]);
    } finally {
      setIsSearching(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const calculateLocalMatches = (lostItem: any, foundItems: any[]): Match[] => {
    const matches: Match[] = [];

    for (const foundItem of foundItems) {
      let score = 0;

      if (lostItem.title.toLowerCase() === foundItem.title.toLowerCase()) score += 25;
      else if (lostItem.title.toLowerCase().includes(foundItem.title.toLowerCase()) ||
        foundItem.title.toLowerCase().includes(lostItem.title.toLowerCase())) score += 15;

      if (lostItem.category === foundItem.category) score += 20;
      if (lostItem.color === foundItem.color) score += 15;
      if (lostItem.condition === foundItem.condition) score += 10;
      if (lostItem.shape === foundItem.shape) score += 10;
      if (lostItem.location === foundItem.location) score += 10;
      if (lostItem.brand && foundItem.brand && lostItem.brand === foundItem.brand) score += 10;

      score = Math.min(score, 100);

      if (score >= 50) {
        matches.push({
          id: crypto.randomUUID(),
          title: foundItem.title,
          description: foundItem.description,
          location: foundItem.location,
          date: foundItem.found_date,
          matchScore: score,
          imageUrl: foundItem.image_urls?.[0],
          category: foundItem.category,
          color: foundItem.color,
          condition: foundItem.condition,
          shape: foundItem.shape,
          brand: foundItem.brand,
          size: foundItem.size,
          specialFeatures: foundItem.special_features,
          found_item_id: foundItem.id,
        });
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  };

  const initiateClaim = async (match: Match) => {
    setIsClaiming(true);
    try {
      const { error } = await supabase.functions.invoke('initiate-claim', {
        body: JSON.stringify({
          matchId: match.id,
          lostItemId: lostItemId,
          foundItemId: match.found_item_id,
          claimantEmail: formData.email,
          claimantName: formData.name,
          claimantPhone: formData.phone,
          itemTitle: match.title,
        }),
      });

      if (error) throw error;

      showSuccess('Claim request sent! The finder will be notified and contact you soon.');
      setSelectedMatch(null);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Claim error:', error);
      showError('Failed to initiate claim. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100 border-green-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    return "text-gray-600 bg-gray-100 border-gray-200";
  };

  const getMatchScoreIcon = (score: number) => {
    if (score >= 90) return <Award className="h-3 w-3" />;
    if (score >= 70) return <Target className="h-3 w-3" />;
    return <Search className="h-3 w-3" />;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-20">
      {/* Toast Notification */}
      {currentToast && (
        <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
          <div className={cn(
            "px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 min-w-[300px] max-w-md",
            currentToast.type === "success" && "bg-green-50 text-green-800 border-green-200",
            currentToast.type === "error" && "bg-red-50 text-red-800 border-red-200",
            currentToast.type === "warning" && "bg-yellow-50 text-yellow-800 border-yellow-200",
            currentToast.type === "info" && "bg-blue-50 text-blue-800 border-blue-200"
          )}>
            <div className="flex-1 text-sm">{currentToast.message}</div>
            <button onClick={removeToast} className="opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200/80 shadow-sm rounded-full px-4 py-1.5 mb-4">
              <span className="text-xs font-medium text-gray-700">Find Lost Item</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gray-900">Find What</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> You've Lost</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Describe your lost item in detail. Our AI will search through found reports to find potential matches.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 mb-8 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  How AI Matching Works
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                    <Sparkles className="h-3 w-3" /> Smart Matching
                  </span>
                </h3>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 mt-0.5">1</div>
                    <div><p className="font-medium text-gray-800">Describe Your Item</p><p className="text-xs text-gray-600">Fill in details about what you lost</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 mt-0.5">2</div>
                    <div><p className="font-medium text-gray-800">AI Searches Database</p><p className="text-xs text-gray-600">Compares with all found reports</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 mt-0.5">3</div>
                    <div><p className="font-medium text-gray-800">View Matches</p><p className="text-xs text-gray-600">See potential matches with match scores</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showResults && (
            <div className="mb-8">
              <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div><h2 className="font-semibold text-gray-900">Search Complete</h2><p className="text-sm text-gray-600">Found {matches.length} potential matches</p></div>
                  <button onClick={() => { setShowResults(false); setCurrentStep(1); setFormData({ title: "", category: "", brand: "", color: "", condition: "", shape: "", size: "", material: "", specialFeatures: "", location: "", date: "", name: "", email: "", phone: "", description: "" }); setPreviewImage(null); setImageFile(null); setLostItemId(null); }} className="text-sm text-blue-600 hover:text-blue-700">New Search</button>
                </div>
              </div>

              {matches.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4"><Package className="h-12 w-12 text-gray-400" /></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
                  <p className="text-gray-500 mb-4">We couldn't find any items matching your description. We'll notify you via email if something matches later.</p>
                  <button onClick={() => router.push("/report/lost")} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg">Report Lost Item</button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matches.map((match) => (
                    <div key={match.id} onClick={() => setSelectedMatch(match)} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        {match.imageUrl ? <Image src={match.imageUrl} alt={match.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="flex items-center justify-center h-full"><Package className="h-16 w-16 text-gray-400" /></div>}
                        <div className="absolute top-3 right-3"><span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold", getMatchScoreColor(match.matchScore))}>{getMatchScoreIcon(match.matchScore)}{match.matchScore}% Match</span></div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-heading font-semibold text-lg text-gray-900 mb-1 line-clamp-1">{match.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{match.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500"><MapPin className="h-3 w-3" /><span>{match.location}</span></div>
                          <div className="flex items-center gap-2 text-xs text-gray-500"><Calendar className="h-3 w-3" /><span>Found {new Date(match.date).toLocaleDateString()}</span></div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100"><button className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1">View Details <ArrowRight className="h-3 w-3" /></button></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!showResults && (
            <>
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex-1 flex items-center">
                      <div className="flex flex-col items-center flex-1">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300", currentStep >= step ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md" : "bg-gray-200 text-gray-500")}>
                          {currentStep > step ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : step}
                        </div>
                        <p className={cn("text-xs mt-2 font-medium hidden sm:block", currentStep >= step ? "text-blue-600" : "text-gray-500")}>
                          {step === 1 && "Item"}{step === 2 && "Specs"}{step === 3 && "Location"}{step === 4 && "Contact"}
                        </p>
                      </div>
                      {step < 4 && <div className={cn("flex-1 h-0.5 mx-4 transition-all duration-300", currentStep > step ? "bg-blue-600" : "bg-gray-200")} />}
                    </div>
                  ))}
                </div>
              </div>

              {currentStep === 1 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">What did you lose?</h2>
                  <div className="space-y-6">
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Item Name <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="e.g., MacBook Pro, Student ID Card" className={cn("w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent", errors.title ? "border-red-500 bg-red-50" : "border-gray-200")} />
                      {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {CATEGORIES.map((cat) => (<button key={cat} type="button" onClick={() => handleChange("category", cat)} className={cn("px-4 py-2 rounded-lg text-left text-sm transition-all border", formData.category === cat ? "border-blue-500 bg-blue-50 text-blue-700 font-medium" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50")}>{cat}</button>))}
                      </div>
                      {errors.category && <p className="text-xs text-red-500 mt-2">{errors.category}</p>}
                    </div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Upload Photo <span className="text-gray-400 text-xs font-normal">(Optional)</span></label>
                      <div className="flex items-center gap-4 flex-wrap">
                        {previewImage ? (<div className="relative"><Image src={previewImage} alt="Preview" width={100} height={100} className="rounded-lg object-cover border-2 border-blue-500" /><button type="button" onClick={() => { setPreviewImage(null); setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"><X className="h-3 w-3" /></button></div>) : (<button type="button" onClick={() => fileInputRef.current?.click()} className="px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600"><div className="flex flex-col items-center gap-1"><Camera className="h-6 w-6" /><span className="text-sm">Upload a photo</span></div></button>)}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <p className="text-xs text-gray-400">Max 5MB. Photos help AI match better!</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Item Description & Specifications</h2>
                  <div className="space-y-6">
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Describe your item <span className="text-red-500">*</span></label>
                      <textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Describe your item - brand, color, size, unique marks, etc." rows={4} className={cn("w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent", errors.description ? "border-red-500 bg-red-50" : "border-gray-200")} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div><label className="block text-sm font-semibold text-gray-700 mb-2">Brand <span className="text-gray-400 text-xs font-normal">(Optional)</span></label>
                        <input type="text" value={formData.brand} onChange={(e) => handleChange("brand", e.target.value)} placeholder="e.g., Apple, Samsung" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-2">Color <span className="text-red-500">*</span></label>
                        <select value={formData.color} onChange={(e) => handleChange("color", e.target.value)} className={cn("w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500", errors.color ? "border-red-500 bg-red-50" : "border-gray-200")}><option value="">Select color</option>{COLORS.map((color) => (<option key={color}>{color}</option>))}</select>
                        {errors.color && <p className="text-xs text-red-500 mt-1">{errors.color}</p>}
                      </div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-2">Condition <span className="text-red-500">*</span></label>
                        <select value={formData.condition} onChange={(e) => handleChange("condition", e.target.value)} className={cn("w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500", errors.condition ? "border-red-500 bg-red-50" : "border-gray-200")}><option value="">Select condition</option>{CONDITIONS.map((cond) => (<option key={cond}>{cond}</option>))}</select>
                        {errors.condition && <p className="text-xs text-red-500 mt-1">{errors.condition}</p>}
                      </div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-2">Shape <span className="text-red-500">*</span></label>
                        <select value={formData.shape} onChange={(e) => handleChange("shape", e.target.value)} className={cn("w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500", errors.shape ? "border-red-500 bg-red-50" : "border-gray-200")}><option value="">Select shape</option>{SHAPES.map((shape) => (<option key={shape}>{shape}</option>))}</select>
                        {errors.shape && <p className="text-xs text-red-500 mt-1">{errors.shape}</p>}
                      </div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-2">Size/Dimensions <span className="text-gray-400 text-xs font-normal">(Optional)</span></label>
                        <input type="text" value={formData.size} onChange={(e) => handleChange("size", e.target.value)} placeholder="e.g., 13 inches, Medium" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                      </div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-2">Material <span className="text-gray-400 text-xs font-normal">(Optional)</span></label>
                        <input type="text" value={formData.material} onChange={(e) => handleChange("material", e.target.value)} placeholder="e.g., Leather, Plastic" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                      </div>
                      <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Special Features <span className="text-gray-400 text-xs font-normal">(Optional)</span></label>
                        <textarea value={formData.specialFeatures} onChange={(e) => handleChange("specialFeatures", e.target.value)} placeholder="e.g., Scratch on bottom, sticker on back, engraved initials" rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Where and when did you lose it?</h2>
                  <div className="space-y-6">
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Location Lost <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.location} onChange={(e) => handleChange("location", e.target.value)} placeholder="e.g., Library 3rd floor, Cafeteria near the entrance" className={cn("w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500", errors.location ? "border-red-500 bg-red-50" : "border-gray-200")} />
                      {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                    </div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Date Lost <span className="text-red-500">*</span></label>
                      <input type="date" value={formData.date} onChange={(e) => handleChange("date", e.target.value)} className={cn("w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500", errors.date ? "border-red-500 bg-red-50" : "border-gray-200")} />
                      {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Your contact information</h2>
                  <div className="space-y-5">
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Your Full Name <span className="text-red-500">*</span></label>
                      <div className="relative"><User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="John Doe" className={cn("w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500", errors.name ? "border-red-500 bg-red-50" : "border-gray-200")} /></div>
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                      <div className="relative"><Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="john@example.com" className={cn("w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500", errors.email ? "border-red-500 bg-red-50" : "border-gray-200")} /></div>
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                      <div className="relative"><Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="tel" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+254 712 345 678" className={cn("w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500", errors.phone ? "border-red-500 bg-red-50" : "border-gray-200")} /></div>
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4"><Shield className="h-4 w-4 text-blue-600 inline mr-2" /><span className="text-sm text-blue-800">Your contact information will only be shared with the finder when you decide to claim a match.</span></div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6 gap-4">
                {currentStep > 1 && <button onClick={prevStep} className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">Back</button>}
                {currentStep < 4 ? <button onClick={nextStep} className="ml-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg">Continue</button> :
                  <button onClick={searchForMatches} disabled={isSearching} className="ml-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50">
                    {isSearching ? <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> AI Searching...</div> : <div className="flex items-center gap-2"><Search className="h-5 w-5" /> Search for Matches</div>}
                  </button>
                }
              </div>
            </>
          )}
        </div>
      </div>

      {/* Match Detail Modal - Fixed z-index to be above navbar */}
      {selectedMatch && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="font-heading text-xl font-semibold text-gray-900">Match Details</h2>
              <button onClick={() => setSelectedMatch(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="relative h-56 bg-gray-100 rounded-xl overflow-hidden mb-4">
                {selectedMatch.imageUrl ? (
                  <Image src={selectedMatch.imageUrl} alt={selectedMatch.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold", getMatchScoreColor(selectedMatch.matchScore))}>
                    {getMatchScoreIcon(selectedMatch.matchScore)}{selectedMatch.matchScore}% Match
                  </span>
                </div>
              </div>

              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-4">{selectedMatch.title}</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">Location Found</p><p className="text-sm text-gray-900">{selectedMatch.location}</p></div>
                <div><p className="text-xs text-gray-500">Date Found</p><p className="text-sm text-gray-900">{new Date(selectedMatch.date).toLocaleDateString()}</p></div>
                {selectedMatch.brand && <div><p className="text-xs text-gray-500">Brand</p><p className="text-sm text-gray-900">{selectedMatch.brand}</p></div>}
                <div><p className="text-xs text-gray-500">Color</p><div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedMatch.color.toLowerCase() }} /><p className="text-sm text-gray-900">{selectedMatch.color}</p></div></div>
                <div><p className="text-xs text-gray-500">Condition</p><p className="text-sm text-gray-900">{selectedMatch.condition}</p></div>
                <div><p className="text-xs text-gray-500">Shape</p><p className="text-sm text-gray-900">{selectedMatch.shape}</p></div>
                {selectedMatch.size && <div><p className="text-xs text-gray-500">Size</p><p className="text-sm text-gray-900">{selectedMatch.size}</p></div>}
              </div>

              {selectedMatch.specialFeatures && (
                <div className="mt-4"><p className="text-xs text-gray-500">Special Features</p><p className="text-sm text-gray-900">{selectedMatch.specialFeatures}</p></div>
              )}

              <div className="mt-6 bg-green-50 rounded-xl p-4 border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600 inline mr-2" />
                <span className="text-sm text-green-800">The finder will be notified and you'll be connected to arrange the return.</span>
              </div>

              <button
                onClick={() => initiateClaim(selectedMatch)}
                disabled={isClaiming}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing Claim...
                  </>
                ) : (
                  "Claim This Item"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
