// hooks/useResources.ts
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';

interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string;
  resource_type: string;
  category?: string;
  tags?: string[];
  skill_level?: string;
  author_name?: string;
  external_url?: string;
  file_url?: string;
  thumbnail_url?: string;
  is_featured?: boolean;
}

export function useFeaturedResources(limit: number = 6) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeaturedResources() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setResources(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch featured resources');
        console.error('Error fetching featured resources:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedResources();
  }, [limit]);

  return { resources, loading, error };
}

export function useResourcesByType(type: string, limit: number = 10) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResourcesByType() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('resource_type', type)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setResources(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch resources');
        console.error('Error fetching resources by type:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchResourcesByType();
  }, [type, limit]);

  return { resources, loading, error };
}