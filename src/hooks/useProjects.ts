// hooks/useProjects.ts
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';

export function useFeaturedProjects(limit: number = 6) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeaturedProjects() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('is_featured', true)
          .order('year', { ascending: false })
          .limit(limit);

        if (error) throw error;
        
        // Transform data to match Project type
        const transformedData = data?.map(item => ({
          ...item,
          status: item.status as ProjectStatus
        })) || [];
        
        setProjects(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch featured projects');
        console.error('Error fetching featured projects:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProjects();
  }, [limit]);

  return { projects, loading, error };
}

export function useProjectsSeekingContributors(limit: number = 4) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSeekingContributors() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('seeking_contributors', true)
          .limit(limit);

        if (error) throw error;
        
        const transformedData = data?.map(item => ({
          ...item,
          status: item.status as ProjectStatus
        })) || [];
        
        setProjects(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects seeking contributors');
        console.error('Error fetching projects seeking contributors:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSeekingContributors();
  }, [limit]);

  return { projects, loading, error };
}