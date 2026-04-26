"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  date: string;
  avatarInitial: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "John Kamau",
    role: "Computer Science Student",
    content: "I lost my MacBook Pro with all my semester projects. Within 2 days, FindIT matched me with someone who found it in the library. The AI matching is incredible! I got my laptop back with all my work safe.",
    rating: 5,
    date: "2 weeks ago",
    avatarInitial: "J"
  },
  {
    id: 2,
    name: "Mary Wanjiku",
    role: "Engineering Student",
    content: "Found someone's student ID in the cafeteria. Reported it on FindIT and within hours, the owner claimed it. The verification questions made sure it went to the right person. Such a relief!",
    rating: 5,
    date: "1 month ago",
    avatarInitial: "M"
  },
  {
    id: 3,
    name: "Peter Ochieng",
    role: "Business Student",
    content: "Lost my wallet with all my cards. I thought it was gone forever. FindIT notified me of a match within 24 hours. The finder was so honest. This platform is a lifesaver!",
    rating: 5,
    date: "3 weeks ago",
    avatarInitial: "P"
  },
  {
    id: 4,
    name: "Sarah Muthoni",
    role: "Medicine Student",
    content: "The community feature is amazing. I shared a tip about labeling valuables and got so many positive responses. It's great to see students helping each other.",
    rating: 5,
    date: "1 week ago",
    avatarInitial: "S"
  },
  {
    id: 5,
    name: "James Otieno",
    role: "Law Student",
    content: "Found a scientific calculator in the engineering building. Posted it on FindIT and the owner claimed it the next day. The process was smooth and secure. Highly recommend!",
    rating: 5,
    date: "2 months ago",
    avatarInitial: "J"
  }
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [visibleTestimonials, setVisibleTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    // Show 3 testimonials on desktop, 1 on mobile
    const updateVisibleCount = () => {
      if (window.innerWidth >= 1024) {
        setVisibleTestimonials(testimonials.slice(0, 3));
      } else {
        setVisibleTestimonials([testimonials[currentIndex]]);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, [currentIndex]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-yellow-400 text-lg">
            {i < rating ? "★" : "☆"}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200/80 shadow-sm rounded-full px-4 py-1.5 mb-4">
          <span className="text-xs font-medium text-gray-700">Testimonials</span>
        </div>
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          <span className="text-gray-900">What Our</span>
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> Community Says</span>
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Real stories from students who found their lost items or helped others recover theirs.
        </p>
      </div>

      {/* Desktop View - Grid */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {testimonials.slice(0, 3).map((testimonial, idx) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            {/* Quote Icon */}
            <div className="text-4xl text-blue-200 mb-3">"</div>

            {/* Content */}
            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">
              {testimonial.content}
            </p>

            {/* Rating */}
            <div className="mb-3">
              {renderStars(testimonial.rating)}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                {testimonial.avatarInitial}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                <p className="text-xs text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile View - Carousel */}
      <div className="lg:hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="text-4xl text-blue-200 mb-3">"</div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {visibleTestimonials[0]?.content}
            </p>
            <div className="mb-3">
              {renderStars(visibleTestimonials[0]?.rating || 5)}
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                {visibleTestimonials[0]?.avatarInitial}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{visibleTestimonials[0]?.name}</p>
                <p className="text-xs text-gray-500">{visibleTestimonials[0]?.role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-600">←</span>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-600">→</span>
        </button>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                currentIndex === idx ? "w-6 bg-blue-600" : "bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-6 flex-wrap justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">100% Verified Stories</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Real Students</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Successfully Recovered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
