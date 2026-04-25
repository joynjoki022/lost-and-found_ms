"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Play, Pause, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface GalleryImage {
  id: number;
  src: string;
  objectPosition: string;
}

const galleryImages: GalleryImage[] = [
  { id: 1, src: "/images/profile1.jpg", objectPosition: "center 30%" },
  { id: 3, src: "/images/profile3.jpg", objectPosition: "center 35%" },
  { id: 4, src: "/images/profile4.jpg", objectPosition: "center 30%" },
  { id: 5, src: "/images/profile5.jpg", objectPosition: "center 40%" },
  { id: 6, src: "/images/profile6.jpg", objectPosition: "center 25%" },
  { id: 7, src: "/images/profile7.jpg", objectPosition: "center 30%" },
  { id: 8, src: "/images/profile8.jpg", objectPosition: "center 35%" },
  { id: 9, src: "/images/profile9.jpg", objectPosition: "center 30%" },
];

export default function GallerySection() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [showLightbox, setShowLightbox] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isLightboxZoomed, setIsLightboxZoomed] = useState<boolean>(false);

  const slideshowRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const currentImage = galleryImages[currentIndex];

  // Handle image load
  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set(prev).add(id));
  };

  // Handle image error
  const handleImageError = (id: number) => {
    setImageErrors(prev => new Set(prev).add(id));
  };

  // Zoom animation function
  const startZoomIn = useCallback(() => {
    setZoomLevel(1);
    setTimeout(() => {
      setZoomLevel(1.15);
    }, 100);
  }, []);

  const startZoomOut = useCallback(() => {
    setZoomLevel(1.15);
    setTimeout(() => {
      setZoomLevel(1);
    }, 100);
  }, []);

  // Auto-play slideshow with zoom effect
  useEffect(() => {
    if (!isAutoPlaying || isTransitioning) return;

    startZoomIn();

    autoPlayRef.current = setInterval(() => {
      setIsTransitioning(true);
      startZoomOut();

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
        setTimeout(() => {
          startZoomIn();
          setIsTransitioning(false);
        }, 200);
      }, 800);
    }, 7000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, startZoomIn, startZoomOut, isTransitioning]);

  // Reset zoom when index changes manually
  useEffect(() => {
    startZoomIn();
  }, [currentIndex, startZoomIn]);

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsAutoPlaying(false);
    setIsTransitioning(true);

    startZoomOut();
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
      setTimeout(() => {
        startZoomIn();
        setIsTransitioning(false);
      }, 200);
    }, 500);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsAutoPlaying(false);
    setIsTransitioning(true);

    startZoomOut();
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
      setTimeout(() => {
        startZoomIn();
        setIsTransitioning(false);
      }, 200);
    }, 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsAutoPlaying(false);
    setIsTransitioning(true);

    startZoomOut();
    setTimeout(() => {
      setCurrentIndex(index);
      setTimeout(() => {
        startZoomIn();
        setIsTransitioning(false);
      }, 200);
    }, 500);
  };

  const openLightbox = () => {
    setLightboxIndex(currentIndex);
    setShowLightbox(true);
    setIsAutoPlaying(false);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setIsLightboxZoomed(false);
    setZoomLevel(1);
  };

  const goToPreviousLightbox = () => {
    setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const goToNextLightbox = () => {
    setLightboxIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const toggleLightboxZoom = () => {
    setIsLightboxZoomed(!isLightboxZoomed);
  };

  // Preload adjacent images for smoother transitions
  useEffect(() => {
    const preloadIndexes = [
      (currentIndex + 1) % galleryImages.length,
      (currentIndex - 1 + galleryImages.length) % galleryImages.length
    ];

    preloadIndexes.forEach(index => {
      const img = new window.Image();
      img.src = galleryImages[index].src;
    });
  }, [currentIndex]);

  return (
    <section id="gallery" className="w-full py-12 md:py-20 bg-gradient-to-b from-bg-dark to-bg-dark/80 overflow-hidden">
      <div className="w-full px-4 md:px-6">
        {/* Section Header with Animation */}
        <div className="mb-8 md:mb-12 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-xs font-semibold text-gold">GALLERY</span>
          </div>
          <h2 className="font-montserrat text-3xl md:text-4xl lg:text-5xl font-bold">
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
              MOMENTS
            </span>
            <span className="text-text-light"> IN MOTION</span>
          </h2>
          <p className="mt-2 md:mt-4 text-sm md:text-base text-text-dim max-w-2xl mx-auto">
            Capturing our journey across Kitui County
          </p>
        </div>

        {/* Full Width Slideshow Container */}
        <div
          ref={slideshowRef}
          className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-bg-card to-bg-dark shadow-2xl border border-gold/10 group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Animated Border Glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold/20 via-gold/5 to-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Main Image with Zoom Effect */}
          <div
            className="relative w-full cursor-pointer overflow-hidden"
            onClick={openLightbox}
          >
            <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh]">
              {/* Loading Skeleton */}
              {!loadedImages.has(currentImage.id) && !imageErrors.has(currentImage.id) && (
                <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-card to-bg-dark animate-shimmer bg-[length:200%_auto]" />
              )}

              {/* Error Fallback */}
              {imageErrors.has(currentImage.id) && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-dark">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📷</div>
                    <p className="text-text-dim text-sm">Image not available</p>
                  </div>
                </div>
              )}

              <div
                className="absolute inset-0 transition-transform duration-[10000ms] ease-out"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)",
                }}
              >
                <Image
                  src={currentImage.src}
                  alt={`Gallery ${currentIndex + 1}`}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-700",
                    loadedImages.has(currentImage.id) ? "opacity-100" : "opacity-0"
                  )}
                  style={{
                    objectPosition: currentImage.objectPosition,
                  }}
                  onLoad={() => handleImageLoad(currentImage.id)}
                  onError={() => handleImageError(currentImage.id)}
                  priority={currentIndex === 0}
                  sizes="100vw"
                  quality={90}
                />
              </div>

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Navigation Arrows - Appear on hover */}
          <button
            onClick={goToPrevious}
            disabled={isTransitioning}
            className={cn(
              "absolute left-2 md:left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 md:p-3 text-white transition-all duration-300 hover:bg-gold hover:text-bg-dark backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed z-10",
              isHovering ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 md:opacity-100 md:translate-x-0"
            )}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            onClick={goToNext}
            disabled={isTransitioning}
            className={cn(
              "absolute right-2 md:right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 md:p-3 text-white transition-all duration-300 hover:bg-gold hover:text-bg-dark backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed z-10",
              isHovering ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 md:opacity-100 md:translate-x-0"
            )}
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          {/* Controls */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="rounded-full bg-black/60 p-2 md:p-2.5 text-white transition-all duration-300 hover:bg-gold hover:text-bg-dark backdrop-blur-sm"
              aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isAutoPlaying ? <Pause className="h-4 w-4 md:h-5 md:w-5" /> : <Play className="h-4 w-4 md:h-5 md:w-5" />}
            </button>
            <button
              onClick={openLightbox}
              className="rounded-full bg-black/60 p-2 md:p-2.5 text-white transition-all duration-300 hover:bg-gold hover:text-bg-dark backdrop-blur-sm"
              aria-label="Fullscreen"
            >
              <Maximize2 className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>

          {/* Dots Navigation */}
          <div className="absolute bottom-16 md:bottom-20 left-0 right-0 z-10">
            <div className="flex justify-center gap-1.5 md:gap-2 px-4">
              {galleryImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  disabled={isTransitioning}
                  className={cn(
                    "h-1.5 md:h-2 rounded-full transition-all duration-500",
                    currentIndex === idx
                      ? "w-8 md:w-10 bg-gold shadow-lg shadow-gold/50"
                      : "w-1.5 md:w-2 bg-white/40 hover:bg-white/80"
                  )}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Slide Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <div className="rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 md:px-4 md:py-1.5 border border-gold/20">
              <p className="text-xs md:text-sm text-text-light font-mono">
                {String(currentIndex + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Auto-play Indicator */}
          {isAutoPlaying && (
            <div className="absolute bottom-4 left-4 z-10">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-gold animate-pulse" />
                <span className="text-[10px] text-text-dim">Auto-playing</span>
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail Preview */}
        <div className="mt-6 flex justify-center gap-2 overflow-x-auto pb-2 px-4">
          {galleryImages.map((image, idx) => (
            <button
              key={image.id}
              onClick={() => goToSlide(idx)}
              className={cn(
                "relative w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden transition-all duration-300 flex-shrink-0",
                currentIndex === idx
                  ? "ring-2 ring-gold scale-105 shadow-lg shadow-gold/30"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={image.src}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal for Fullscreen View */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-lg animate-fade-in"
          onClick={closeLightbox}
        >
          <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-20 text-white/80 hover:text-gold transition-all duration-300 hover:scale-110"
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6 md:h-8 md:w-8" />
            </button>

            {/* Zoom Button */}
            <button
              onClick={toggleLightboxZoom}
              className="absolute top-4 right-16 z-20 text-white/80 hover:text-gold transition-all duration-300 hover:scale-110"
              aria-label="Zoom"
            >
              <Maximize2 className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            {/* Previous Button */}
            <button
              onClick={goToPreviousLightbox}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 md:p-3 text-white transition-all duration-300 hover:bg-gold hover:text-bg-dark z-20 backdrop-blur-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
            </button>

            {/* Next Button */}
            <button
              onClick={goToNextLightbox}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 md:p-3 text-white transition-all duration-300 hover:bg-gold hover:text-bg-dark z-20 backdrop-blur-sm"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
            </button>

            {/* Image Container */}
            <div className="flex h-full w-full items-center justify-center p-4 md:p-8">
              <div
                className={cn(
                  "relative transition-transform duration-500",
                  isLightboxZoomed ? "scale-150" : "scale-100"
                )}
              >
                <div className="relative w-full max-w-7xl h-[80vh] md:h-[85vh]">
                  <Image
                    src={galleryImages[lightboxIndex].src}
                    alt={`Gallery ${lightboxIndex + 1}`}
                    fill
                    className="object-contain"
                    priority
                    sizes="100vw"
                    quality={100}
                  />
                </div>
              </div>
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
              <div className="rounded-full bg-black/60 backdrop-blur-sm px-4 py-2 border border-gold/20">
                <p className="text-sm text-text-light font-mono">
                  {String(lightboxIndex + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
