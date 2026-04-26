"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Grid3x3,
  List,
  MapPin,
  Calendar,
  Clock,
  User,
  Tag,
  X,
  SlidersHorizontal,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Laptop,
  Book,
  Watch,
  Shirt,
  Package,
  Camera,
  Headphones,
  Key,
  Wallet,
  Briefcase,
  Sparkles,
  ArrowRight,
  Shield,
  Loader2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from '../../../lib/supabase/client';

// Types
interface Item {
  id: string;
  title: string;
  description: string;
  type: "lost" | "found";
  category: string;
  location: string;
  date: string;
  status: "pending" | "resolved" | "claimed";
  image_urls?: string[];
  created_at: string;
}

// Categories with icons
const CATEGORIES = [
  { id: "all", name: "All Categories", icon: Package },
  { id: "electronics", name: "Electronics", icon: Laptop },
  { id: "documents", name: "Documents", icon: Book },
  { id: "accessories", name: "Accessories", icon: Watch },
  { id: "clothing", name: "Clothing", icon: Shirt },
  { id: "bags", name: "Bags & Luggage", icon: Briefcase },
  { id: "keys", name: "Keys", icon: Key },
  { id: "wallets", name: "Wallets & Cards", icon: Wallet },
  { id: "cameras", name: "Cameras", icon: Camera },
  { id: "audio", name: "Audio Devices", icon: Headphones },
  { id: "misc", name: "Miscellaneous", icon: Package },
];

// Locations
const LOCATIONS = [
  "All Locations",
  "Library",
  "Cafeteria",
  "Science Block",
  "Engineering Building",
  "Business School",
  "Student Center",
  "Gymnasium",
  "Football Field",
  "Parking Lot",
  "Dormitories",
];

export default function BrowsePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "lost" | "found">("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchItems();
    window.scrollTo(0, 0);
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both lost and found items
      const [lostResult, foundResult] = await Promise.all([
        supabase
          .from('lost_items')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('found_items')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
      ]);

      if (lostResult.error) throw lostResult.error;
      if (foundResult.error) throw foundResult.error;

      // Transform lost items to common format
      const lostItems: Item[] = (lostResult.data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: 'lost' as const,
        category: item.category,
        location: item.location,
        date: item.lost_date,
        status: item.status as Item['status'],
        image_urls: item.image_urls,
        created_at: item.created_at
      }));

      // Transform found items to common format
      const foundItems: Item[] = (foundResult.data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: 'found' as const,
        category: item.category,
        location: item.location,
        date: item.found_date,
        status: item.status as Item['status'],
        image_urls: item.image_urls,
        created_at: item.created_at
      }));

      setItems([...lostItems, ...foundItems]);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch = searchTerm === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesLocation = selectedLocation === "All Locations" || item.location.includes(selectedLocation);

    return matchesSearch && matchesType && matchesCategory && matchesLocation;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-700";
      case "claimed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-3 w-3" />;
      case "claimed":
        return <Shield className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedCategory("all");
    setSelectedLocation("All Locations");
  };

  const hasActiveFilters = searchTerm !== "" || selectedType !== "all" || selectedCategory !== "all" || selectedLocation !== "All Locations";

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading items...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Items</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchItems}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200/80 shadow-sm rounded-full px-4 py-1.5 mb-6 hover:shadow-md transition-all duration-300 group">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
              Browse All Items
            </span>
            <Sparkles className="h-3 w-3 text-gray-400 group-hover:text-yellow-500 transition-colors" />
          </div>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            <span className="text-gray-900">Find Your</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent bg-300% animate-gradient">
              Lost Belongings
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Search through hundreds of lost and found items reported by students across campus
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow duration-300"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Type Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              {[
                { value: "all", label: "All Items", color: "gray" },
                { value: "lost", label: "Lost Items", color: "red" },
                { value: "found", label: "Found Items", color: "green" },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value as any)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    selectedType === type.value
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                  showFilters || hasActiveFilters
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm font-medium">Filters</span>
                {hasActiveFilters && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white text-blue-600 rounded-full text-xs font-bold">
                    {[
                      selectedCategory !== "all" ? 1 : 0,
                      selectedLocation !== "All Locations" ? 1 : 0,
                    ].reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {(showFilters || hasActiveFilters) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <div className="mt-4 text-right">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Stats */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            Found <span className="font-semibold text-gray-900">{filteredItems.length}</span> items
          </p>
        </div>

        {/* Items Grid/List View */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group block"
              >
                {/* Image Container */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {item.image_urls && item.image_urls[0] ? (
                    <Image
                      src={item.image_urls[0]}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", getStatusColor(item.status))}>
                      {getStatusIcon(item.status)}
                      <span className="capitalize">{item.status}</span>
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      item.type === "lost" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    )}>
                      {item.type === "lost" ? "Lost" : "Found"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-heading font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Tag className="h-3 w-3" />
                      <span className="capitalize">{item.category}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1 group">
                      View Details
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-300 cursor-pointer group block"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Image */}
                  <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image_urls && item.image_urls[0] ? (
                      <Image
                        src={item.image_urls[0]}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h3 className="font-heading font-semibold text-xl text-gray-900">
                        {item.title}
                      </h3>
                      <div className="flex gap-2">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          item.type === "lost" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        )}>
                          {item.type === "lost" ? "Lost" : "Found"}
                        </span>
                        <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", getStatusColor(item.status))}>
                          {getStatusIcon(item.status)}
                          <span className="capitalize">{item.status}</span>
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span className="capitalize">{item.category}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1 group">
                        View Details
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="container mx-auto px-4 mt-12 pb-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs text-gray-400">
            <Shield className="h-3 w-3" />
            <span>Protected by FindIT Security</span>
            <span>•</span>
            <span>Verified claims only</span>
            <span>•</span>
            <span>No personal information shared</span>
          </div>
        </div>
      </div>
    </main>
  );
}
