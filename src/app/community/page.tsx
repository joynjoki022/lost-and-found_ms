"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from '../../../lib/supabase/client';
import { useToast } from "@/hooks/useToast";

// Types
interface Post {
  id: string;
  userId: string;
  userName: string;
  userInitial: string;
  userBadge: "newcomer" | "helper" | "hero" | "legend";
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  isLiked: boolean;
  location?: string;
  tags: string[];
  isPinned?: boolean;
  postType: "success-story" | "tip" | "feedback" | "announcement";
}

interface TopHelper {
  id: string;
  name: string;
  initial: string;
  badge: "newcomer" | "helper" | "hero" | "legend";
  itemsFound: number;
  itemsReturned: number;
  reward: string;
  reputation: number;
  rank: number;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userInitial: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  helpfulCount: number;
}

const BADGE_NAMES = {
  newcomer: "Newcomer",
  helper: "Helper",
  hero: "Hero",
  legend: "Legend"
};

const TAGS = ["all", "feedback", "success-story", "tip", "suggestion", "announcement"];

export default function CommunityPage() {
  const router = useRouter();
  const { showToast, currentToast, removeToast, showSuccess, showError, showInfo } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [topHelpers, setTopHelpers] = useState<TopHelper[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    itemsReturned: 0,
    feedbackSubmitted: 0,
    satisfactionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState<"feedback" | "tip" | "success-story">("feedback");
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});

  // Fetch all data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Transform posts
      const transformedPosts: Post[] = (postsData || []).map(post => ({
        id: post.id,
        userId: post.user_id,
        userName: post.user_name || 'Anonymous',
        userInitial: (post.user_name || 'A')[0].toUpperCase(),
        userBadge: post.user_badge || 'newcomer',
        content: post.content,
        images: post.images || [],
        likes: post.likes || 0,
        comments: post.comments_count || 0,
        shares: post.shares || 0,
        timestamp: post.created_at,
        isLiked: false,
        location: post.location,
        tags: post.tags || [],
        isPinned: post.is_pinned || false,
        postType: post.post_type
      }));

      setPosts(transformedPosts);

      // Fetch comments for posts
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: true });

      if (!commentsError && commentsData) {
        const commentsByPost: Record<string, Comment[]> = {};
        commentsData.forEach(comment => {
          if (!commentsByPost[comment.post_id]) {
            commentsByPost[comment.post_id] = [];
          }
          commentsByPost[comment.post_id].push({
            id: comment.id,
            userId: comment.user_id,
            userName: comment.user_name || 'Anonymous',
            userInitial: (comment.user_name || 'A')[0].toUpperCase(),
            content: comment.content,
            timestamp: comment.created_at,
            likes: comment.likes || 0,
            isLiked: false,
            helpfulCount: comment.helpful_count || 0
          });
        });
        setCommentsMap(commentsByPost);
      }

      // Fetch top helpers (profiles with highest items_returned)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, badge, items_found, items_returned, reputation')
        .order('items_returned', { ascending: false })
        .limit(5);

      if (!profilesError && profilesData) {
        const helpers: TopHelper[] = profilesData.map((profile, index) => ({
          id: profile.id,
          name: profile.full_name?.split(' ')[0] + ' ' + (profile.full_name?.split(' ')[1]?.[0] || ''),
          initial: (profile.full_name || 'U')[0].toUpperCase(),
          badge: profile.badge || 'newcomer',
          itemsFound: profile.items_found || 0,
          itemsReturned: profile.items_returned || 0,
          reward: getRewardByRank(index + 1),
          reputation: profile.reputation || 0,
          rank: index + 1
        }));
        setTopHelpers(helpers);
      }

      // Fetch stats
      const { count: membersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { data: returnedData } = await supabase
        .from('profiles')
        .select('items_returned');

      const totalReturned = returnedData?.reduce((sum, p) => sum + (p.items_returned || 0), 0) || 0;

      const { count: feedbackCount } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .eq('post_type', 'feedback');

      setStats({
        totalMembers: membersCount || 0,
        itemsReturned: totalReturned,
        feedbackSubmitted: feedbackCount || 0,
        satisfactionRate: 92 // This would come from a survey or calculation
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const getRewardByRank = (rank: number): string => {
    switch (rank) {
      case 1: return "Hero of the Month";
      case 2: return "Silver Helper";
      case 3: return "Bronze Helper";
      case 4: return "Top Contributor";
      default: return "Community Star";
    }
  };

  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newLikes = post.isLiked ? post.likes - 1 : post.likes + 1;

    // Optimistic update
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, likes: newLikes, isLiked: !p.isLiked }
        : p
    ));

    // Update in database
    const { error } = await supabase
      .from('community_posts')
      .update({ likes: newLikes })
      .eq('id', postId);

    if (error) {
      console.error('Error updating likes:', error);
      // Revert on error
      setPosts(posts.map(p =>
        p.id === postId
          ? { ...p, likes: post.likes, isLiked: post.isLiked }
          : p
      ));
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      showError("Please enter some content");
      return;
    }

    setIsSubmitting(true);
    showInfo("Creating your post...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || crypto.randomUUID();
      const userName = user?.email?.split('@')[0] || 'Anonymous';

      const { data: newPost, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: userId,
          user_name: userName,
          content: newPostContent,
          post_type: newPostType,
          tags: [newPostType === "feedback" ? "feedback" : newPostType === "tip" ? "tip" : "success-story"],
          likes: 0,
          comments_count: 0,
          shares: 0,
          is_pinned: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const newPostObj: Post = {
        id: newPost.id,
        userId: newPost.user_id,
        userName: newPost.user_name || 'Anonymous',
        userInitial: (newPost.user_name || 'A')[0].toUpperCase(),
        userBadge: 'newcomer',
        content: newPost.content,
        images: [],
        likes: 0,
        comments: 0,
        shares: 0,
        timestamp: newPost.created_at,
        isLiked: false,
        tags: newPost.tags || [],
        postType: newPost.post_type
      };

      setPosts([newPostObj, ...posts]);
      setNewPostContent("");
      setShowCreateForm(false);
      showSuccess("Post created successfully!");
    } catch (error) {
      console.error('Error creating post:', error);
      showError("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) {
      showError("Please enter a comment");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || crypto.randomUUID();
      const userName = user?.email?.split('@')[0] || 'Anonymous';

      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          user_name: userName,
          content: commentText,
          likes: 0,
          helpful_count: 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update comments map
      const newCommentObj: Comment = {
        id: newComment.id,
        userId: newComment.user_id,
        userName: newComment.user_name || 'Anonymous',
        userInitial: (newComment.user_name || 'A')[0].toUpperCase(),
        content: newComment.content,
        timestamp: newComment.created_at,
        likes: 0,
        isLiked: false,
        helpfulCount: 0
      };

      setCommentsMap(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newCommentObj]
      }));

      // Update post comment count
      const post = posts.find(p => p.id === postId);
      if (post) {
        const newCommentCount = (post.comments || 0) + 1;
        setPosts(posts.map(p =>
          p.id === postId
            ? { ...p, comments: newCommentCount }
            : p
        ));

        await supabase
          .from('community_posts')
          .update({ comments_count: newCommentCount })
          .eq('id', postId);
      }

      setCommentText("");
      showSuccess("Comment added!");
    } catch (error) {
      console.error('Error adding comment:', error);
      showError("Failed to add comment");
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const minutes = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 60000);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const getBadgeClass = (badge: string) => {
    switch (badge) {
      case "legend": return "bg-yellow-100 text-yellow-700";
      case "hero": return "bg-blue-100 text-blue-700";
      case "helper": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getPostTypeClass = (type: string) => {
    switch (type) {
      case "feedback": return "bg-purple-100 text-purple-700";
      case "success-story": return "bg-green-100 text-green-700";
      case "tip": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case "feedback": return "Feedback";
      case "success-story": return "Success Story";
      case "tip": return "Tip";
      default: return "Post";
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === "" ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === "all" || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-20">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-20">
      {/* Toast Notification */}
      {currentToast && (
        <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
          <div className={cn(
            "px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 min-w-[300px] max-w-md",
            currentToast.type === "success" && "bg-green-50 text-green-800 border-green-200",
            currentToast.type === "error" && "bg-red-50 text-red-800 border-red-200",
            currentToast.type === "warning" && "bg-yellow-50 text-yellow-800 border-yellow-200",
            currentToast.type === "info" && "bg-blue-50 text-blue-800 border-blue-200"
          )}>
            <div className="flex-1 text-sm">{currentToast.message}</div>
            <button onClick={removeToast} className="opacity-70 hover:opacity-100">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200/80 shadow-sm rounded-full px-4 py-1.5 mb-4">
              <span className="text-xs font-medium text-gray-700">Community Forum</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gray-900">Join the</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> FindIT Community</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Share feedback, success stories, and tips to help improve the lost and found system for everyone.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{stats.totalMembers.toLocaleString()}</div>
              <div className="text-xs text-blue-600">Community Members</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
              <div className="text-2xl font-bold text-green-700">{stats.itemsReturned.toLocaleString()}</div>
              <div className="text-xs text-green-600">Items Returned</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">{stats.feedbackSubmitted.toLocaleString()}</div>
              <div className="text-xs text-purple-600">Feedback Submitted</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{stats.satisfactionRate}%</div>
              <div className="text-xs text-yellow-600">Satisfaction Rate</div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Feed */}
            <div className="flex-1">
              {/* Create Post Toggle Button */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                    Y
                  </div>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex-1 text-left px-4 py-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    {showCreateForm ? "Cancel" : "Share feedback, tips, or success story..."}
                  </button>
                </div>
              </div>

              {/* Inline Create Post Form */}
              {showCreateForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Post Type</label>
                    <div className="flex gap-3">
                      {(["feedback", "tip", "success-story"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setNewPostType(type)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            newPostType === type
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          {type === "feedback" ? "Feedback" : type === "tip" ? "Tip" : "Success Story"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={
                      newPostType === "feedback"
                        ? "Share your feedback or suggestion to help improve the system..."
                        : newPostType === "tip"
                          ? "Share a helpful tip with the community..."
                          : "Share your success story of finding a lost item..."
                    }
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim() || isSubmitting}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Posting..." : "Share Post"}
                    </button>
                  </div>
                </div>
              )}

              {/* Search & Filter Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search discussions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-4 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all",
                          selectedTag === tag
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {tag.replace("-", " ").toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Posts Feed */}
              <div className="space-y-6">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                    <p className="text-gray-500">No posts found. Be the first to share!</p>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                      <div className="p-5">
                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                              {post.userInitial}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900">{post.userName}</span>
                                <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs", getBadgeClass(post.userBadge))}>
                                  {BADGE_NAMES[post.userBadge]}
                                </span>
                                <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs", getPostTypeClass(post.postType))}>
                                  {getPostTypeLabel(post.postType)}
                                </span>
                                {post.isPinned && <span className="text-xs text-blue-600">📌 Pinned</span>}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                <span>{formatTimeAgo(post.timestamp)}</span>
                                {post.location && <span>• {post.location}</span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Post Content */}
                        <p className="text-gray-700 mb-3 leading-relaxed">{post.content}</p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.map((tag) => (
                            <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Post Actions */}
                        <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={cn(
                              "flex items-center gap-2 text-sm transition-colors",
                              post.isLiked ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
                            )}
                          >
                            <span>❤️</span>
                            <span>{post.likes}</span>
                          </button>
                          <button
                            onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <span>💬</span>
                            <span>{post.comments}</span>
                          </button>
                        </div>

                        {/* Comments Section */}
                        {expandedPostId === post.id && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="space-y-4 mb-4">
                              {commentsMap[post.id]?.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                                    {comment.userInitial}
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-gray-50 rounded-xl p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-sm text-gray-900">{comment.userName}</span>
                                          <span className="text-xs text-gray-400">{formatTimeAgo(comment.timestamp)}</span>
                                        </div>
                                        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600">
                                          <span>👍</span>
                                          <span>{comment.helpfulCount}</span>
                                        </button>
                                      </div>
                                      <p className="text-sm text-gray-700">{comment.content}</p>
                                      <div className="mt-2 flex items-center gap-3">
                                        <button className="text-xs text-gray-400 hover:text-blue-600">Reply</button>
                                        <button className="text-xs text-gray-400 hover:text-green-600">Mark Helpful</button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {(!commentsMap[post.id] || commentsMap[post.id].length === 0) && (
                                <p className="text-center text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
                              )}
                            </div>
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                                Y
                              </div>
                              <div className="flex-1">
                                <textarea
                                  placeholder="Share your feedback or suggestion..."
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                                />
                                <div className="flex justify-end mt-2">
                                  <button
                                    onClick={() => handleAddComment(post.id)}
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                  >
                                    Post Comment
                                  </button>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-3 text-center">
                              Your feedback helps improve the system for everyone
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-80 space-y-6">
              {/* How to Find Lost Items */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">🔍 How to Find Lost Items</h3>
                <p className="text-sm text-gray-700 mb-3">Use our dedicated search system to find lost items:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2"><span className="text-blue-600">1.</span><span className="text-gray-600">Go to <button onClick={() => router.push("/find")} className="text-blue-600 font-medium hover:underline">Find Lost Item</button> page</span></div>
                  <div className="flex items-start gap-2"><span className="text-blue-600">2.</span><span className="text-gray-600">Describe your lost item in detail</span></div>
                  <div className="flex items-start gap-2"><span className="text-blue-600">3.</span><span className="text-gray-600">Our AI matches with found reports</span></div>
                  <div className="flex items-start gap-2"><span className="text-blue-600">4.</span><span className="text-gray-600">View matches and claim your item</span></div>
                </div>
                <button onClick={() => router.push("/find")} className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Find Lost Item Now</button>
              </div>

              {/* Community Guidelines */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Community Guidelines</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2"><span>✓</span><span>Share constructive feedback</span></li>
                  <li className="flex items-start gap-2"><span>✓</span><span>Be respectful and helpful</span></li>
                  <li className="flex items-start gap-2"><span>✓</span><span>No spam or self-promotion</span></li>
                  <li className="flex items-start gap-2"><span>✓</span><span>Use the find page for lost items</span></li>
                </ul>
              </div>

              {/* Top Helpers Leaderboard */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-gray-900">Top Helpers</h3><span className="text-xs text-blue-600">This Month</span></div>
                <div className="space-y-3">
                  {topHelpers.map((helper) => (
                    <div key={helper.id} className="flex items-center gap-3">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", helper.rank === 1 ? "bg-yellow-100 text-yellow-700" : helper.rank === 2 ? "bg-gray-100 text-gray-700" : helper.rank === 3 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-500")}>{helper.rank}</div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">{helper.initial}</div>
                      <div className="flex-1"><div className="flex items-center gap-1"><span className="font-medium text-sm text-gray-900">{helper.name}</span><span className={cn("text-xs px-1.5 py-0.5 rounded", getBadgeClass(helper.badge))}>{BADGE_NAMES[helper.badge]}</span></div><p className="text-xs text-gray-500">{helper.itemsReturned} items returned</p></div>
                      <div className="text-right"><p className="text-xs font-medium text-blue-600">{helper.reward}</p><p className="text-xs text-gray-400">{helper.reputation} pts</p></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reward System Info */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">🏆 Reward System</h3>
                <p className="text-sm text-gray-700 mb-3">Help return lost items and earn recognition!</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center"><span className="text-gray-600">5 items returned</span><span className="font-medium text-amber-700">Helper Badge</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-600">15 items returned</span><span className="font-medium text-blue-700">Hero Badge</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-600">30+ items returned</span><span className="font-medium text-yellow-700">Legend Badge + Certificate</span></div>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-200"><p className="text-xs text-gray-600">Top helpers receive monthly rewards and recognition from the university!</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
