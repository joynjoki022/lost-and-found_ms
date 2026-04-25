// hooks/useFAQ.ts
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';


export function useFAQs(options?: { category?: string; featured?: boolean; limit?: number }) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFAQs() {
      try {
        setLoading(true);
        let query = supabase
          .from('faq')
          .select('*')
          .eq('is_published', true)
          .order('display_order', { ascending: true });

        if (options?.category) {
          query = query.eq('category', options.category);
        }

        if (options?.featured) {
          query = query.eq('is_featured', true);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        setFaqs(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch FAQs');
        console.error('Error fetching FAQs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFAQs();
  }, [options?.category, options?.featured, options?.limit]);

  return { faqs, loading, error };
}

export function useFAQCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('faq')
          .select('category')
          .eq('is_published', true)
          .not('category', 'is', null);

        if (error) throw error;
        
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch FAQ categories');
        console.error('Error fetching FAQ categories:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}