// hooks/useBlogPosts.ts
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';

export function useRecentPosts(limit: number = 3) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentPosts() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*, author:author_id(*)')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        
        // Transform the data to ensure it matches BlogPost interface
        const transformedData = data?.map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt || '',
          content: item.content,
          author_id: item.author_id,
          author_name: item.author_name,
          author_bio: item.author_bio,
          author_avatar: item.author_avatar,
          category: item.category,
          tags: item.tags || [],
          status: item.status as BlogStatus,
          is_featured: item.is_featured || false,
          published_at: item.published_at,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          featured_image: item.featured_image,
          thumbnail_url: item.thumbnail_url,
          views_count: item.views_count || 0,
          likes_count: item.likes_count || 0,
          reading_time_minutes: item.reading_time_minutes || Math.ceil(item.content.length / 1000),
          author: item.author ? {
            name: item.author.name,
            avatar_url: item.author.avatar_url
          } : undefined
        })) || [];
        
        setPosts(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recent posts');
        console.error('Error fetching recent posts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentPosts();
  }, [limit]);

  return { posts, loading, error };
}

export function useFeaturedPosts(limit: number = 3) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeaturedPosts() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*, author:author_id(*)')
          .eq('status', 'published')
          .eq('is_featured', true)
          .order('published_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        
        // Transform the data to ensure it matches BlogPost interface
        const transformedData = data?.map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt || '',
          content: item.content,
          author_id: item.author_id,
          author_name: item.author_name,
          author_bio: item.author_bio,
          author_avatar: item.author_avatar,
          category: item.category,
          tags: item.tags || [],
          status: item.status as BlogStatus,
          is_featured: item.is_featured || false,
          published_at: item.published_at,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          featured_image: item.featured_image,
          thumbnail_url: item.thumbnail_url,
          views_count: item.views_count || 0,
          likes_count: item.likes_count || 0,
          reading_time_minutes: item.reading_time_minutes || Math.ceil(item.content.length / 1000),
          author: item.author ? {
            name: item.author.name,
            avatar_url: item.author.avatar_url
          } : undefined
        })) || [];
        
        setPosts(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch featured posts');
        console.error('Error fetching featured posts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedPosts();
  }, [limit]);

  return { posts, loading, error };
}

// Optional: Add a hook to get a single post by slug
export function usePostBySlug(slug: string) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPostBySlug() {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*, author:author_id(*)')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (error) throw error;
        
        if (data) {
          const transformedData = {
            id: data.id,
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt || '',
            content: data.content,
            author_id: data.author_id,
            author_name: data.author_name,
            author_bio: data.author_bio,
            author_avatar: data.author_avatar,
            category: data.category,
            tags: data.tags || [],
            status: data.status as BlogStatus,
            is_featured: data.is_featured || false,
            published_at: data.published_at,
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || new Date().toISOString(),
            featured_image: data.featured_image,
            thumbnail_url: data.thumbnail_url,
            views_count: data.views_count || 0,
            likes_count: data.likes_count || 0,
            reading_time_minutes: data.reading_time_minutes || Math.ceil(data.content.length / 1000),
            author: data.author ? {
              name: data.author.name,
              avatar_url: data.author.avatar_url
            } : undefined
          };
          setPost(transformedData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch post');
        console.error('Error fetching post by slug:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPostBySlug();
  }, [slug]);

  return { post, loading, error };
}