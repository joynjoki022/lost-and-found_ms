// hooks/useProjectIdeas.ts
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';

export function useProjectIdeas(options?: { 
  status?: string; 
  seeking?: boolean;
  limit?: number;
}) {
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjectIdeas() {
      try {
        setLoading(true);
        setError(null);
        
        let query = supabase
          .from('project_ideas')
          .select('*')
          .order('date_added', { ascending: false });

        if (options?.status) {
          query = query.eq('status', options.status);
        }

        if (options?.seeking) {
          query = query.eq('seeking_collaborators', true);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        setIdeas(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch project ideas');
        console.error('Error fetching project ideas:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjectIdeas();
  }, [options?.status, options?.seeking, options?.limit]);

  return { ideas, loading, error };
}

export function useUpcomingIdeas(limit: number = 6) {
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUpcomingIdeas() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('project_ideas')
          .select('*')
          .neq('status', 'on-hold')
          .order('priority', { ascending: true })
          .order('date_added', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setIdeas(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch upcoming ideas');
        console.error('Error fetching upcoming ideas:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUpcomingIdeas();
  }, [limit]);

  return { ideas, loading, error };
}

export function useIdeasSeekingCollaborators(limit: number = 4) {
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSeekingIdeas() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('project_ideas')
          .select('*')
          .eq('seeking_collaborators', true)
          .order('priority', { ascending: true })
          .order('date_added', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setIdeas(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ideas seeking collaborators');
        console.error('Error fetching ideas seeking collaborators:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSeekingIdeas();
  }, [limit]);

  return { ideas, loading, error };
}