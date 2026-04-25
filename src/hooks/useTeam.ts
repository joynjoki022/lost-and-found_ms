// hooks/useTeam.ts
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';

interface TeamMember {
  id: string;
  name: string;
  slug: string;
  role: string;
  title: string;
  bio?: string;
  email?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  avatar_url?: string;
  skills?: string[];
  is_core?: boolean;
  is_featured?: boolean;
  display_order?: number;
}

export function useTeamMembers(options?: { featured?: boolean; limit?: number }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        setLoading(true);
        let query = supabase
          .from('team_members')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (options?.featured) {
          query = query.eq('is_featured', true);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        setMembers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch team members');
        console.error('Error fetching team members:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamMembers();
  }, [options?.featured, options?.limit]);

  return { members, loading, error };
}

export function useCoreTeam() {
  return useTeamMembers({ featured: true });
}