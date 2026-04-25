// types/global.d.ts
// Global type declarations - NO IMPORT NEEDED, available everywhere automatically

// ============================================
// PROJECT TYPES
// ============================================

// Project Status Types
type ProjectStatus = "live" | "in-production" | "in-development" | "completed" | null;
type ProjectIdeaStatus = "planning" | "in-progress" | "seeking-collaborators" | "on-hold" | "almost-complete" | "started";
type Priority = "low" | "medium" | "high";
type Complexity = "beginner" | "intermediate" | "advanced";

// Project from projects table (built projects)
interface Project {
  id: string;
  name: string;
  builder: string;
  description: string;
  full_description?: string;
  stack: string[];
  status: ProjectStatus;
  demo_url?: string;
  repo_url?: string;
  is_featured: boolean;
  client?: string;
  year?: number;
  highlights?: string[];
  is_open_source?: boolean;
  seeking_contributors?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ProjectIdea from project_ideas table (ideas/brainstorming)
interface ProjectIdea {
  id: string;
  slug: string;
  title: string;
  description: string;
  full_description?: string;
  problem: string;
  solution: string;
  technologies: string[];
  complexity: Complexity;
  status: ProjectIdeaStatus;
  seeking_collaborators: boolean;
  estimated_timeline?: string;
  category: string;
  motivation?: string;
  features?: string[];
  github_url?: string;
  discussion_url?: string;
  collaborators_needed?: string[];
  priority: Priority;
  date_added: string;
  docker_images?: string[];
  architecture?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// EVENT TYPES
// ============================================

type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled" | "postponed";
type EventType = "workshop" | "webinar" | "meetup" | "conference" | "hackathon" | "training" | "seminar" | "panel_discussion" | "networking" | "other";

interface Speaker {
  name: string;
  title?: string;
  bio?: string;
  photo?: string;
  social_links?: SocialLinks;
}

interface AgendaItem {
  time: string;
  topic: string;
  speaker?: string;
  description?: string;
}

interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  discord?: string;
  slack?: string;
  telegram?: string;
  website?: string;
}

// Complete Event interface with all properties used in EventCard
interface AppEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  full_description?: string;
  event_type: EventType;
  status: EventStatus;
  start_date: string;
  end_date: string;
  timezone?: string;
  is_virtual: boolean;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_country?: string;
  online_platform?: string;
  meeting_link?: string;
  meeting_password?: string;
  organizer_name: string;
  organizer_email?: string;
  organizer_phone?: string;
  organizer_website?: string;
  speakers?: Speaker[];
  agenda?: AgendaItem[];
  banner_image?: string;
  thumbnail_url?: string;
  gallery_images?: string[];
  video_recording_url?: string;
  presentation_slides_url?: string;
  requires_registration: boolean;
  registration_url?: string;
  registration_deadline?: string;
  max_attendees?: number;
  current_attendees?: number;
  ticket_price?: number;
  currency?: string;
  payment_methods?: string[];
  tags?: string[];
  topics?: string[];
  target_audience?: string[];
  prerequisites?: string[];
  resource_links?: string[];
  social_links?: SocialLinks;
  event_hashtag?: string;
  feedback_form_url?: string;
  average_rating?: number;
  feedback_count?: number;
  is_featured: boolean;
  is_recurring: boolean;
  recurring_pattern?: string;
  parent_event_id?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// ============================================
// BLOG POST TYPES
// ============================================

type BlogStatus = "draft" | "published" | "archived" | "under_review";

// Complete BlogPost interface
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author_id?: string;
  author_name: string;
  author_bio?: string;
  author_avatar?: string;
  category?: string;
  tags?: string[];
  status: BlogStatus;
  is_featured?: boolean;
  is_pinned?: boolean;
  allow_comments?: boolean;
  published_at?: string;
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
  featured_image?: string;
  banner_image?: string;
  thumbnail_url?: string;
  video_url?: string;
  podcast_url?: string;
  gallery_images?: string[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  canonical_url?: string;
  views_count?: number;
  likes_count?: number;
  shares_count?: number;
  comments_count?: number;
  reading_time_minutes?: number;
  related_posts?: string[];
  related_resources?: string[];
  related_events?: string[];
  series_name?: string;
  series_order?: number;
  series_id?: string;
  reference_links?: string[];
  footnotes?: Record<string, any>;
  table_of_contents?: Record<string, any>;
  code_snippets?: Record<string, any>;
  download_links?: string[];
  author?: {
    name: string;
    avatar_url?: string;
  };
}

// ============================================
// TEAM MEMBER TYPES
// ============================================

type TeamRole = "founder" | "lead" | "senior" | "junior" | "contributor" | "mentor" | "advisor" | "community_manager";

interface TeamMember {
  id: string;
  name: string;
  slug: string;
  role: TeamRole;
  title: string;
  bio?: string;
  full_bio?: string;
  email?: string;
  phone?: string;
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  discord?: string;
  slack?: string;
  telegram?: string;
  whatsapp?: string;
  calendly?: string;
  avatar_url?: string;
  cover_image?: string;
  profile_image?: string;
  skills?: string[];
  expertise?: string[];
  technologies?: string[];
  languages?: string[];
  interests?: string[];
  company?: string;
  position?: string;
  years_experience?: number;
  specialties?: string[];
  certifications?: string[];
  education?: Education[];
  current_projects?: string[];
  past_projects?: string[];
  open_source_contributions?: string[];
  blog_posts?: string[];
  resources_created?: string[];
  events_hosted?: string[];
  contributions_count: number;
  projects_count: number;
  followers_count: number;
  following_count: number;
  is_active: boolean;
  is_core: boolean;
  is_lead: boolean;
  is_mentor: boolean;
  join_date?: string;
  leave_date?: string;
  display_order: number;
  is_featured: boolean;
  timezone: string;
  location?: string;
  country: string;
  city?: string;
  testimonials?: Testimonial[];
  recommendations?: Recommendation[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  created_at: string;
  updated_at: string;
}

interface Education {
  degree: string;
  institution: string;
  year?: number;
  description?: string;
}

interface Testimonial {
  text: string;
  author: string;
  position?: string;
  company?: string;
  date?: string;
}

interface Recommendation {
  text: string;
  recommender: string;
  relationship?: string;
  date?: string;
}

// ============================================
// FAQ TYPES
// ============================================

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  views_count: number;
  helpful_count: number;
  not_helpful_count: number;
  created_by?: string;
  last_updated_by?: string;
  created_at: string;
  updated_at: string;
  related_links?: string[];
  related_faqs?: string[];
  meta_title?: string;
  meta_description?: string;
  slug?: string;
}

// ============================================
// RESOURCE TYPES
// ============================================

type ResourceType = "article" | "tutorial" | "video" | "ebook" | "whitepaper" | "case_study" | "template" | "tool" | "code_snippet" | "documentation" | "cheat_sheet" | "course" | "guide";
type SkillLevel = "beginner" | "intermediate" | "advanced" | "all";

interface ResourceBase {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  resource_type: ResourceType;
  category?: string;
  subcategory?: string;
  tags?: string[];
  topics?: string[];
  skill_level?: SkillLevel;
  author_id?: string;
  author_name?: string;
  author_bio?: string;
  author_avatar?: string;
  external_url?: string;
  file_url?: string;
  file_size?: number;
  file_format?: string;
  download_url?: string;
  github_repo?: string;
  documentation_url?: string;
  demo_url?: string;
  thumbnail_url?: string;
  preview_image?: string;
  video_url?: string;
  audio_url?: string;
  duration_minutes?: number;
  page_count?: number;
  version?: string;
  license: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  views_count: number;
  downloads_count: number;
  likes_count: number;
  saves_count: number;
  average_rating?: number;
  review_count: number;
  is_featured: boolean;
  is_free: boolean;
  is_premium: boolean;
  price?: number;
  currency?: string;
  related_resources?: string[];
  related_posts?: string[];
  related_events?: string[];
  prerequisite_resources?: string[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  additional_data?: Record<string, any>;
  author?: TeamMember;
}
// types/resources.ts
 interface Resource extends ResourceBase {
  id: string;
  title: string;
  icon?: string;
  image?: string;
  time?: string;
  href: string;
  description?: string | null;
  difficulty?: string | null;
  tags?: string[] | null;
  reading_time?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  category_id?: string | null;
  display_order?: number | null;
  is_published?: boolean | null;
  content?: any;
  categories?: Category | Category[] | null;
}

 interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
  description?: string | null;
  display_order?: number | null;
  resources?: Resource[] | null;
}

interface ResourceWithCategory extends Resource {
  categories: Category;
}

interface Category {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  display_order: number;
  resources: Resource[];
}

// ============================================
// COMMENT AND RECOMMENDATION TYPES
// ============================================

type CommentStatus = "pending" | "approved" | "spam" | "deleted";
type RecommendationType = "suggestion" | "resource" | "collaborator" | "improvement" | "bug_report" | "feature_request";
type RecommendationStatus = "open" | "under_review" | "implemented" | "declined" | "in_progress";

interface ProjectComment {
  id: string;
  project_id: string;
  user_name: string;
  user_email?: string;
  user_avatar?: string;
  comment: string;
  parent_comment_id?: string;
  status: CommentStatus;
  is_edited: boolean;
  likes_count: number;
  replies?: ProjectComment[];
  created_at: string;
  updated_at: string;
}

interface ProjectRecommendation {
  id: string;
  project_id: string;
  user_name: string;
  user_email?: string;
  recommendation_type: RecommendationType;
  title: string;
  description: string;
  status: RecommendationStatus;
  upvotes: number;
  downvotes: number;
  is_implemented: boolean;
  implemented_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// HOOK RETURN TYPES
// ============================================

interface HookReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

interface SingleHookReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ============================================
// UTILITY TYPES
// ============================================

type WithClassName<T = {}> = T & { className?: string };
type WithVariant<T = {}> = T & { variant?: "default" | "compact" | "featured" };
type WithChildren<T = {}> = T & { children?: React.ReactNode };

// Remove FAQCardProps from global - should be in component file
