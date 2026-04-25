// hooks/useEvents.ts
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';

// Types for event status and type
type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled" | "postponed";
type EventType = "workshop" | "webinar" | "meetup" | "conference" | "hackathon" | "training" | "seminar" | "panel_discussion" | "networking" | "other";

// Helper function to transform database item to AppEvent
function transformEventData(item: any): AppEvent {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    full_description: item.full_description,
    event_type: item.event_type as EventType,
    status: item.status as EventStatus,
    start_date: item.start_date,
    end_date: item.end_date,
    timezone: item.timezone || 'Africa/Nairobi',
    is_virtual: item.is_virtual || false,
    venue_name: item.venue_name,
    venue_address: item.venue_address,
    venue_city: item.venue_city,
    venue_country: item.venue_country || 'Kenya',
    online_platform: item.online_platform,
    meeting_link: item.meeting_link,
    meeting_password: item.meeting_password,
    organizer_name: item.organizer_name,
    organizer_email: item.organizer_email,
    organizer_phone: item.organizer_phone,
    organizer_website: item.organizer_website,
    speakers: item.speakers || [],
    agenda: item.agenda || [],
    banner_image: item.banner_image,
    thumbnail_url: item.thumbnail_url,
    gallery_images: item.gallery_images || [],
    video_recording_url: item.video_recording_url,
    presentation_slides_url: item.presentation_slides_url,
    requires_registration: item.requires_registration || false,
    registration_url: item.registration_url,
    registration_deadline: item.registration_deadline,
    max_attendees: item.max_attendees,
    current_attendees: item.current_attendees || 0,
    ticket_price: item.ticket_price,
    currency: item.currency || 'KES',
    payment_methods: item.payment_methods || [],
    tags: item.tags || [],
    topics: item.topics || [],
    target_audience: item.target_audience || [],
    prerequisites: item.prerequisites || [],
    resource_links: item.resource_links || [],
    social_links: item.social_links || {},
    event_hashtag: item.event_hashtag,
    feedback_form_url: item.feedback_form_url,
    average_rating: item.average_rating,
    feedback_count: item.feedback_count || 0,
    is_featured: item.is_featured || false,
    is_recurring: item.is_recurring || false,
    recurring_pattern: item.recurring_pattern,
    parent_event_id: item.parent_event_id,
    meta_title: item.meta_title,
    meta_description: item.meta_description,
    meta_keywords: item.meta_keywords || [],
    created_by: item.created_by,
    created_at: item.created_at,
    updated_at: item.updated_at,
    published_at: item.published_at
  };
}

export function useUpcomingEvents(limit: number = 50) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUpcomingEvents() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'upcoming')
          .order('start_date', { ascending: true })
          .limit(limit);

        if (error) throw error;

        const transformedData = data?.map(transformEventData) || [];
        setEvents(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch upcoming events');
        console.error('Error fetching upcoming events:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUpcomingEvents();
  }, [limit]);

  return { events, loading, error };
}

export function usePastEvents(limit: number = 50) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPastEvents() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'completed')
          .order('start_date', { ascending: false })
          .limit(limit);

        if (error) throw error;

        const transformedData = data?.map(transformEventData) || [];
        setEvents(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch past events');
        console.error('Error fetching past events:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPastEvents();
  }, [limit]);

  return { events, loading, error };
}

export function useEventsByCity(city: string, limit: number = 50) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEventsByCity() {
      if (!city) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('venue_city', city)
          .order('start_date', { ascending: false })
          .limit(limit);

        if (error) throw error;

        const transformedData = data?.map(transformEventData) || [];
        setEvents(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events by city');
        console.error('Error fetching events by city:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEventsByCity();
  }, [city, limit]);

  return { events, loading, error };
}

export function useEventBySlug(slug: string) {
  const [event, setEvent] = useState<AppEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEventBySlug() {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;

        if (data) {
          setEvent(transformEventData(data));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch event');
        console.error('Error fetching event by slug:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEventBySlug();
  }, [slug]);

  return { event, loading, error };
}

export function useAllEvents(limit: number = 50) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllEvents() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('start_date', { ascending: false })
          .limit(limit);

        if (error) throw error;

        const transformedData = data?.map(transformEventData) || [];
        setEvents(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllEvents();
  }, [limit]);

  return { events, loading, error };
}

export function useFeaturedEvents(limit: number = 3) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeaturedEvents() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_featured', true)
          .eq('status', 'upcoming')
          .order('start_date', { ascending: true })
          .limit(limit);

        if (error) throw error;

        const transformedData = data?.map(transformEventData) || [];
        setEvents(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch featured events');
        console.error('Error fetching featured events:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedEvents();
  }, [limit]);

  return { events, loading, error };
}
