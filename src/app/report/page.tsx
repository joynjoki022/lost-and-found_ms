"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles, Shield, Zap, Brain, Search } from "lucide-react";
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
  "Black", "White", "Red", "Blue", "Green", "Yellow", "Purple", "Pink",
  "Orange", "Brown", "Gray", "Silver", "Gold", "Other"
];

const CONDITIONS = [
  "New", "Like New", "Good", "Fair", "Poor", "Damaged"
];

const SHAPES = [
  "Rectangle", "Square", "Circle", "Oval", "Triangle", "Irregular", "Other"
];

export default function ReportFoundPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentToast, showToast, removeToast, showSuccess, showError, showWarning, showInfo } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [foundItemId, setFoundItemId] = useState<string | null>(null);

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
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: "" }));
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Please tell us what item you found";
      if (!formData.category) newErrors.category = "Please select a category";
      if (!imageFile && !previewImage) newErrors.image = "Please upload a photo of the item";
    } else if (step === 2) {
      if (!formData.color) newErrors.color = "Please select a color";
      if (!formData.condition) newErrors.condition = "Please select the condition";
      if (!formData.shape) newErrors.shape = "Please select the shape";
    } else if (step === 3) {
      if (!formData.location.trim()) newErrors.location = "Please tell us where you found it";
      if (!formData.date) newErrors.date = "Please tell us when you found it";
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
    const filePath = `found-items/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error('Image upload error:', uploadError);
      showError("Failed to upload image. Please try again.");
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('item-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    showInfo("Submitting your report...");

    try {
      // Upload image first
      const imageUrl = await uploadImage();

      // Generate temporary user ID
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

      // Insert found item
      const { data: foundItem, error: foundError } = await supabase
        .from('found_items')
        .insert({
          user_id: profileId,
          title: formData.title,
          description: `${formData.title} - ${formData.specialFeatures ? `Special features: ${formData.specialFeatures}` : ''}`.trim(),
          category: formData.category.toLowerCase(),
          brand: formData.brand || null,
          color: formData.color,
          condition: formData.condition,
          shape: formData.shape,
          size: formData.size || null,
          material: formData.material || null,
          special_features: formData.specialFeatures || null,
          location: formData.location,
          found_date: formData.date,
          status: 'pending',
          image_urls: imageUrl ? [imageUrl] : [],
        })
        .select()
        .single();

      if (foundError) {
        console.error('Error saving found item:', foundError);
        showError("Failed to save your report. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setFoundItemId(foundItem.id);

      // Try to invoke edge function for matching (non-blocking)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/find-matches-for-found`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            foundItemId: foundItem.id,
            userId: profileId,
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.matches && result.matches.length > 0) {
            showSuccess(`Found ${result.matches.length} potential match${result.matches.length > 1 ? 'es' : ''}! The owner might be notified.`);
          }
        }
      } catch (edgeError) {
        console.error('Edge function error:', edgeError);
        // Non-critical, continue
      }

      showSuccess("Item reported successfully! Thank you for helping someone recover their belonging.");

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/report/success?type=found');
      }, 2000);

    } catch (error) {
      console.error('Submission error:', error);
      showError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200/80 shadow-sm rounded-full px-4 py-1.5 mb-4">
              <span className="text-xs font-medium text-gray-700">Report Found Item</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gray-900">Found Something?</span>
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> Report It Here</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Help someone recover their lost item. Report what you found and our AI will match it with potential owners.
            </p>
          </div>

          {/* AI Matching Instructions */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8 border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  How AI Finds the Owner
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                    <Sparkles className="h-3 w-3" />
                    Smart Match
                  </span>
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center text-xs font-bold text-purple-700 mt-0.5">1</div>
                    <div>
                      <p className="font-medium text-gray-800">Upload Photo</p>
                      <p className="text-xs text-gray-600">Our AI analyzes the image to identify item type, color, and features</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center text-xs font-bold text-purple-700 mt-0.5">2</div>
                    <div>
                      <p className="font-medium text-gray-800">Match with Reports</p>
                      <p className="text-xs text-gray-600">AI compares your found item with lost item reports in our database</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center text-xs font-bold text-purple-700 mt-0.5">3</div>
                    <div>
                      <p className="font-medium text-gray-800">Connect & Return</p>
                      <p className="text-xs text-gray-600">We notify potential owners and facilitate the return process</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-green-50 rounded-xl p-5 mb-8 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-3">How to report a found item</h3>
            <div className="grid md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-700">1</span>
                <span className="text-gray-700">Item details & photo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-700">2</span>
                <span className="text-gray-700">Item specifications</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-700">3</span>
                <span className="text-gray-700">Where & when found</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-700">4</span>
                <span className="text-gray-700">Your contact info</span>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                      currentStep >= step
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
                        : "bg-gray-200 text-gray-500"
                    )}>
                      {currentStep > step ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : step}
                    </div>
                    <p className={cn(
                      "text-xs mt-2 font-medium hidden sm:block",
                      currentStep >= step ? "text-green-600" : "text-gray-500"
                    )}>
                      {step === 1 && "Item"}
                      {step === 2 && "Specs"}
                      {step === 3 && "Location"}
                      {step === 4 && "Contact"}
                    </p>
                  </div>
                  {step < 4 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-4 transition-all duration-300",
                      currentStep > step ? "bg-green-600" : "bg-gray-200"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Item Details */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">What did you find?</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="e.g., MacBook Pro, Student ID Card, Black Backpack, Apple Watch"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all",
                        errors.title ? "border-red-500 bg-red-50" : "border-gray-200"
                      )}
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleChange("category", cat)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-left text-sm transition-all border",
                            formData.category === cat
                              ? "border-green-500 bg-green-50 text-green-700 font-medium"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    {errors.category && <p className="text-xs text-red-500 mt-2">{errors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload Photo <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4 flex-wrap">
                      {previewImage ? (
                        <div className="relative">
                          <Image src={previewImage} alt="Preview" width={120} height={120} className="rounded-lg object-cover border-2 border-green-500" />
                          <button
                            type="button"
                            onClick={() => { setPreviewImage(null); setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; if (errors.image) setErrors(prev => ({ ...prev, image: "" })); }}
                            className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            "px-8 py-4 border-2 border-dashed rounded-xl transition-all text-gray-600",
                            errors.image ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-green-500 hover:bg-green-50"
                          )}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm">Click to upload a photo</span>
                            <span className="text-xs text-gray-400">JPG, PNG up to 5MB</span>
                          </div>
                        </button>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </div>
                    {errors.image && <p className="text-xs text-red-500 mt-2">{errors.image}</p>}
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-purple-500" />
                      Our AI will analyze this photo to help identify and match the item
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Item Specifications */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Item Specifications</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Brand <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => handleChange("brand", e.target.value)}
                      placeholder="e.g., Apple, Samsung, Nike - leave blank if unknown"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">Helps narrow down matches if known</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Color <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.color}
                      onChange={(e) => handleChange("color", e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent",
                        errors.color ? "border-red-500 bg-red-50" : "border-gray-200"
                      )}
                    >
                      <option value="">Select color</option>
                      {COLORS.map((color) => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                    {errors.color && <p className="text-xs text-red-500 mt-1">{errors.color}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Condition <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => handleChange("condition", e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent",
                        errors.condition ? "border-red-500 bg-red-50" : "border-gray-200"
                      )}
                    >
                      <option value="">Select condition</option>
                      {CONDITIONS.map((condition) => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                    {errors.condition && <p className="text-xs text-red-500 mt-1">{errors.condition}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Shape <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.shape}
                      onChange={(e) => handleChange("shape", e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent",
                        errors.shape ? "border-red-500 bg-red-50" : "border-gray-200"
                      )}
                    >
                      <option value="">Select shape</option>
                      {SHAPES.map((shape) => (
                        <option key={shape} value={shape}>{shape}</option>
                      ))}
                    </select>
                    {errors.shape && <p className="text-xs text-red-500 mt-1">{errors.shape}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Size / Dimensions <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => handleChange("size", e.target.value)}
                      placeholder="e.g., 13 inches, Medium, 10cm x 5cm"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Material <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) => handleChange("material", e.target.value)}
                      placeholder="e.g., Leather, Plastic, Metal, Fabric"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Special Features / Identifiers <span className="text-gray-400 text-xs font-normal">(Optional but helpful)</span>
                    </label>
                    <textarea
                      value={formData.specialFeatures}
                      onChange={(e) => handleChange("specialFeatures", e.target.value)}
                      placeholder="e.g., Scratches, stickers, engravings, unique marks, custom case, initials, etc."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">These details help the owner verify it's theirs</p>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200">
                  <p className="text-sm text-green-800 flex items-start gap-2">
                    <Zap className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">AI Matching Tip:</span> The more details you provide, the better our AI can match this item with lost reports. Even small unique features help!</span>
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Location & Date */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Where and when did you find it?</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location Found <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      placeholder="e.g., Library 3rd floor, Cafeteria near the entrance, Science Block room 201, Parking lot"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all",
                        errors.location ? "border-red-500 bg-red-50" : "border-gray-200"
                      )}
                    />
                    {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                    <p className="text-xs text-gray-400 mt-1">Be specific about the exact location where you found the item</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date Found <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange("date", e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent",
                        errors.date ? "border-red-500 bg-red-50" : "border-gray-200"
                      )}
                    />
                    {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Contact Information */}
            {currentStep === 4 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Your contact information</h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="John Doe"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent",
                        errors.name ? "border-red-500 bg-red-50" : "border-gray-200"
                      )}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="john@example.com"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent",
                        errors.email ? "border-red-500 bg-red-50" : "border-gray-200"
                      )}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    <p className="text-xs text-gray-400 mt-1">We'll contact you to help connect with the owner</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+254 712 345 678"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent",
                        errors.phone ? "border-red-500 bg-red-50" : "border-gray-200"
                      )}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    <p className="text-xs text-gray-400 mt-1">So the owner can reach you to claim their item</p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 border border-green-200 mt-4">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-green-800">
                        <p className="font-semibold mb-1">Good Samaritan Note:</p>
                        <p>Your contact information will only be shared with the potential owner after our AI verifies the match. We'll never share your data publicly.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting Report...
                    </div>
                  ) : (
                    "Submit Found Item Report"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
