// components/sections/SkillsCarousel.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import "devicon/devicon.min.css";
import { cn } from "@/lib/utils";

interface Skill {
  name: string;
  iconClass: string;
  category: string;
}

const skills: Skill[] = [
  // Frontend
  { name: "React", iconClass: "devicon-react-original", category: "frontend" },
  { name: "TypeScript", iconClass: "devicon-typescript-plain", category: "language" },
  { name: "JavaScript", iconClass: "devicon-javascript-plain", category: "language" },
  { name: "Tailwind CSS", iconClass: "devicon-tailwindcss-original", category: "frontend" },
  
  // Backend
  { name: "Node.js", iconClass: "devicon-nodejs-plain", category: "backend" },
  { name: "Python", iconClass: "devicon-python-plain", category: "language" },
  { name: "Java", iconClass: "devicon-java-plain", category: "language" },
  { name: "PHP", iconClass: "devicon-php-plain", category: "language" },
  
  // Databases
  { name: "PostgreSQL", iconClass: "devicon-postgresql-plain", category: "database" },
  { name: "MongoDB", iconClass: "devicon-mongodb-plain", category: "database" },
  { name: "MySQL", iconClass: "devicon-mysql-plain", category: "database" },
  { name: "Redis", iconClass: "devicon-redis-plain", category: "database" },
  
  // DevOps & Cloud
  { name: "Docker", iconClass: "devicon-docker-plain", category: "devops" },
  //{ name: "Kubernetes", iconClass: "devicon-kubernetes-plain", category: "devops" },
  { name: "GitHub Actions", iconClass: "devicon-githubactions-plain", category: "devops" },
  
  // Tools
  { name: "Git", iconClass: "devicon-git-plain", category: "tools" },
  { name: "GitHub", iconClass: "devicon-github-original", category: "tools" },
  { name: "VS Code", iconClass: "devicon-vscode-plain", category: "tools" },
  //{ name: "Figma", iconClass: "devicon-figma-plain", category: "design" },
  
  // Operating Systems
  { name: "Ubuntu", iconClass: "devicon-ubuntu-plain", category: "os" },
  { name: "Linux", iconClass: "devicon-linux-plain", category: "os" },
  
  // APIs
  //{ name: "GraphQL", iconClass: "devicon-graphql-plain", category: "api" },
  { name: "Postman", iconClass: "devicon-postman-plain", category: "tools" },
];

export function SkillsCarousel() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Infinite scroll duplication
  const duplicatedSkills = [...skills, ...skills, ...skills, ...skills];

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isDragging || isHovering) return;

    let animationFrame: number;
    const scrollSpeed = 0.8;

    const scroll = () => {
      if (!scrollContainer || isDragging || isHovering) return;
      
      scrollContainer.scrollLeft += scrollSpeed;
      
      // Smooth infinite loop reset
      const totalWidth = scrollContainer.scrollWidth / 4;
      if (scrollContainer.scrollLeft >= totalWidth * 3) {
        scrollContainer.scrollLeft = totalWidth;
      }
      
      animationFrame = requestAnimationFrame(scroll);
    };

    animationFrame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrame);
  }, [isDragging, isHovering]);

  // Center on mount
  useEffect(() => {
    if (scrollRef.current) {
      const totalWidth = scrollRef.current.scrollWidth / 4;
      scrollRef.current.scrollLeft = totalWidth * 1.5;
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovering(false);
  };

  return (
    <div className="w-full mt-8">
      {/* Scrolling container with gradient edges */}
      <div className="relative">
        {/* Gradient edges for smooth fade */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-bg-primary via-bg-primary/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-bg-primary via-bg-primary/80 to-transparent z-10 pointer-events-none" />
        
        {/* Main carousel */}
        <div
          ref={scrollRef}
          className={cn(
            "overflow-x-auto scrollbar-hide cursor-grab select-none",
            isDragging && "cursor-grabbing"
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={() => setIsHovering(true)}
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex gap-4 py-4 px-8">
            {duplicatedSkills.map((skill, index) => (
              <div
                key={`${skill.name}-${index}`}
                className="relative flex-shrink-0 group"
                onMouseEnter={() => setHoveredSkill(`${skill.name}-${index}`)}
                onMouseLeave={() => setHoveredSkill(null)}
              >
                <div className={cn(
                  "w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-border-default bg-bg-secondary/80 flex items-center justify-center transition-all duration-300 backdrop-blur-sm",
                  "hover:border-green-primary/50 hover:scale-110 hover:shadow-lg hover:shadow-green-primary/20",
                  hoveredSkill === `${skill.name}-${index}` && "border-green-primary/50 scale-110 shadow-lg shadow-green-primary/20"
                )}>
                  <i className={cn(
                    skill.iconClass,
                    "colored text-3xl sm:text-4xl transition-transform duration-300",
                    hoveredSkill === `${skill.name}-${index}` && "scale-110"
                  )} />
                </div>
                
                {/* Tooltip - Enhanced with higher z-index and better visibility */}
                {hoveredSkill === `${skill.name}-${index}` && (
                  <>
                    {/* Backdrop blur for better readability */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-bg-card/95 backdrop-blur-md border-2 border-green-primary rounded-lg shadow-2xl z-50 whitespace-nowrap">
                      <p className="font-mono text-sm font-bold text-green-primary">
                        {skill.name}
                      </p>
                      <p className="font-mono text-[10px] text-text-dim text-center mt-0.5">
                        {skill.category}
                      </p>
                    </div>
                    
                    {/* Tooltip arrow */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-bg-card border-l-2 border-t-2 border-green-primary rotate-45 z-40" />
                    
                    {/* Glow effect behind tooltip */}
                    <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 w-full h-10 bg-green-primary/20 blur-xl rounded-full z-30" />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls and hints */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <button
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollLeft -= 300;
            }
          }}
          className="p-2.5 rounded-full border-2 border-border-default hover:border-green-primary/50 transition-all group"
          aria-label="Scroll left"
        >
          <svg className="w-4 h-4 text-text-dim group-hover:text-green-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              isHovering ? "bg-amber" : "bg-green-primary"
            )} />
            <span className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              isHovering ? "bg-amber" : "bg-green-primary"
            )} />
          </span>
          <span className="font-mono text-xs text-text-dim">
            {isHovering ? "paused" : "auto-scrolling"}
          </span>
        </div>
        
        <button
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollLeft += 300;
            }
          }}
          className="p-2.5 rounded-full border-2 border-border-default hover:border-green-primary/50 transition-all group"
          aria-label="Scroll right"
        >
          <svg className="w-4 h-4 text-text-dim group-hover:text-green-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Hint text */}
      <p className="text-center text-text-dim font-mono text-xs mt-3 opacity-60">
        ← hover to pause • drag to scroll • hover for details →
      </p>
    </div>
  );
}