"use client";

import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Item } from "./types";
import Image from "next/image";

interface ItemsSectionProps {
  activeTab: 'lost' | 'found';
  onTabChange: (value: string) => void;
  filteredItems: Item[];
  onItemClick: (item: Item) => void;
}

const getPlaceholderImage = (category: string) => {
  const images: Record<string, string> = {
    "Electronics": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=500&fit=crop",
    "Books & Notes": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=500&fit=crop",
    "ID Cards": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop",
    "Keys": "https://images.unsplash.com/photo-1581849018426-5ab69d79e0d0?w=800&h=500&fit=crop",
    "Bags & Backpacks": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=500&fit=crop",
    "Water Bottles": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=500&fit=crop",
  };
  return images[category] || "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=500&fit=crop";
};

export function ItemsSection({
  activeTab,
  onTabChange,
  filteredItems,
  onItemClick
}: ItemsSectionProps) {
  const displayItems = filteredItems.slice(0, 6);

  return (
    <section id="items" className="py-20 bg-transparent">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-3">
            <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-50 rounded-full px-4 py-1 text-xs font-medium">
              Latest Listings
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Browse {activeTab === 'lost' ? 'Lost' : 'Found'} Items
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            {activeTab === 'lost'
              ? "Recently reported lost items across campus"
              : "Items that have been found by fellow students"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-full bg-gray-100 p-1 text-gray-500">
              <TabsTrigger
                value="lost"
                className="rounded-full px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                Lost Items
              </TabsTrigger>
              <TabsTrigger
                value="found"
                className="rounded-full px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                Found Items
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Items Grid */}
        {displayItems.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {displayItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="overflow-hidden bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl"
                    onClick={() => onItemClick(item)}
                  >
                    {/* Image Section */}
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={getPlaceholderImage(item.category)}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Colored Status Badge */}
                      <div className="absolute top-4 left-4">
                        {item.type === 'lost' ? (
                          <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 text-xs px-3 py-1 font-semibold shadow-md">
                            LOST
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 text-xs px-3 py-1 font-semibold shadow-md">
                            FOUND
                          </Badge>
                        )}
                      </div>

                      {/* Category Badge */}
                      <div className="absolute bottom-4 left-4">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white/90 text-xs px-3 py-1 font-medium">
                          {item.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Section */}
                    <CardContent className="p-5">
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="line-clamp-1">{item.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{new Date(item.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {item.description}
                      </p>

                      <Button
                        variant="ghost"
                        className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl font-medium text-sm group/btn"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* View More Button */}
            {filteredItems.length > 6 && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  className="rounded-full px-8 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 transition-all"
                >
                  View All {filteredItems.length} Items
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No items found</p>
            <p className="text-gray-400 text-sm mt-1">Check back later or try a different category</p>
          </div>
        )}
      </div>
    </section>
  );
}
