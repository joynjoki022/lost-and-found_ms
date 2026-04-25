// hooks/useToast.ts
"use client";

import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase/client";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [currentToast, setCurrentToast] = useState<ToastItem | null>(null);
  const [queue, setQueue] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, type };

    setQueue((prevQueue) => {
      // If there's already a toast showing, add to queue
      if (currentToast) {
        return [...prevQueue, newToast];
      }
      // Otherwise show immediately
      setCurrentToast(newToast);
      return prevQueue;
    });
  }, [currentToast]);

  const removeToast = useCallback(() => {
    setCurrentToast(null);
    
    // Show next toast from queue if any
    setQueue((prevQueue) => {
      if (prevQueue.length > 0) {
        const [nextToast, ...remainingQueue] = prevQueue;
        setCurrentToast(nextToast);
        return remainingQueue;
      }
      return [];
    });
  }, []);

  // Rate limit checker
  const checkRateLimit = useCallback(async (email: string): Promise<{ allowed: boolean; reason?: string }> => {
    try {
     
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('contact_messages')
        .select('id, created_at')
        .eq('email', email)
        .gte('created_at', today)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const lastSubmission = new Date(data[0].created_at);
        const hoursSinceLast = (Date.now() - lastSubmission.getTime()) / (1000 * 60 * 60);
        
        if (data.length >= 3) {
          return { 
            allowed: false, 
            reason: "You've reached the maximum number of submissions (3 per day). Please try again tomorrow." 
          };
        }
        
        if (hoursSinceLast < 1) {
          const minutesLeft = Math.ceil(60 - hoursSinceLast * 60);
          return { 
            allowed: false, 
            reason: `Please wait ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''} before sending another message.` 
          };
        }
      }
      
      return { allowed: true };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return { allowed: true };
    }
  }, []);

  return {
    currentToast,
    showToast,
    removeToast,
    checkRateLimit,
    showSuccess: (message: string) => showToast(message, "success"),
    showError: (message: string) => showToast(message, "error"),
    showWarning: (message: string) => showToast(message, "warning"),
    showInfo: (message: string) => showToast(message, "info"),
  };
}