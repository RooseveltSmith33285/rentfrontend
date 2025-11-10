import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Users, TrendingUp, Megaphone, Lightbulb, Tag, Search, X, Send, MoreVertical, Edit, Trash2, AlertCircle } from 'lucide-react';
import { BASE_URL } from '../baseUrl';

function VendorCommunityFeed() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showComments, setShowComments] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [showDropdown, setShowDropdown] = useState(null);
  const [currentVendorId, setCurrentVendorId] = useState(null);
  const [postComments, setPostComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});

  const observer = useRef();
  const lastPostRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const postTypes = [
    { value: 'all', label: 'All Posts', icon: Users, color: 'gray' },
    { value: 'announcement', label: 'Announcements', icon: Megaphone, color: 'blue' },
    { value: 'tip', label: 'Tips & Tricks', icon: Lightbulb, color: 'yellow' },
    { value: 'update', label: 'Updates', icon: TrendingUp, color: 'green' },
    { value: 'promotion', label: 'Promotions', icon: Tag, color: 'purple' }
  ];

  useEffect(() => {
    fetchPosts();
    fetchCurrentVendor();
  }, [page, selectedType]);

  useEffect(() => {
    filterPosts();
  }, [posts, searchQuery]);

  const fetchCurrentVendor = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/vendor/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCurrentVendorId(data.vendor._id);
    } catch (err) {
      console.error('Error fetching vendor:', err);
    }
  };

  const fetchPosts = async () => {
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page,
        limit: 10
      });
      
      if (selectedType !== 'all') {
        params.append('type', selectedType);
      }

      const response = await fetch(`${BASE_URL}/posts?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        const newPosts = data.feedItems || [];
        
        if (page === 1) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }
        
        setHasMore(data.currentPage < data.totalPages);
      }

    } catch (err) {
      console.error('Fetch posts error:', err);
      setError('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = [...posts];

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.vendor?.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  };

  const handleLike = async (postId) => {
    try {
       
      const token = localStorage.getItem('token');
      const post = posts.find(p => p._id === postId);
      
      // Check if already liked
      const isLiked = post.likes?.some(like => like.user === currentVendorId);
      
      const url = `${BASE_URL}/community/posts/${postId}/like`;
      const method = isLiked ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setPosts(prev => prev.map(p => {
          if (p._id === postId) {
            const newLikes = isLiked 
              ? p.likes.filter(like => like.user !== currentVendorId)
              : [...(p.likes || []), { user: currentVendorId, createdAt: new Date() }];
            
            return {
              ...p,
              likes: newLikes,
              engagement: { 
                ...p.engagement, 
                likes: data.likes || newLikes.length 
              }
            };
          }
          return p;
        }));
      }

    } catch (err) {
      console.error('Like error:', err);
      setError('Failed to like post');
    }
  };

  const fetchComments = async (postId) => {
    if (loadingComments[postId]) return;
    
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/community/posts/${postId}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setPostComments(prev => ({ ...prev, [postId]: data.comments }));
      }

    } catch (err) {
      console.error('Fetch comments error:', err);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      if (data.success) {
        // Update post engagement
        setPosts(prev => prev.map(p => 
          p._id === postId 
            ? { 
                ...p, 
                engagement: { 
                  ...p.engagement, 
                  comments: data.totalComments || p.engagement.comments + 1 
                }
              }
            : p
        ));
        
        // Add new comment to comments list
        setPostComments(prev => ({
          ...prev,
          [postId]: [data.comment, ...(prev[postId] || [])]
        }));
        
        // Clear input
        setCommentText(prev => ({ ...prev, [postId]: '' }));
      }

    } catch (err) {
      console.error('Comment error:', err);
      setError('Failed to add comment');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/community/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        // Remove comment from list
        setPostComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).filter(c => c._id !== commentId)
        }));
        
        // Update engagement count
        setPosts(prev => prev.map(p => 
          p._id === postId 
            ? { 
                ...p, 
                engagement: { 
                  ...p.engagement, 
                  comments: data.totalComments || p.engagement.comments - 1 
                }
              }
            : p
        ));
      }

    } catch (err) {
      console.error('Delete comment error:', err);
      setError('Failed to delete comment');
    }
  };

  const handleShare = async (postId) => {
    try {
      const shareUrl = `${window.location.origin}/community/${postId}`;
      const shareData = {
        title: 'Check out this post!',
        text: 'I found this interesting post on the community:',
        url: shareUrl,
      };
  
    
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('Post shared successfully!');
      } else {
       
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };
  

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('token');
      
      await fetch(`${BASE_URL}/community/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setPosts(prev => prev.filter(p => p._id !== postId));
      setShowDropdown(null);
      alert('Post deleted successfully');

    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete post');
    }
  };

  const toggleComments = (postId) => {
    if (showComments === postId) {
      setShowComments(null);
    } else {
      setShowComments(postId);
      if (!postComments[postId]) {
        fetchComments(postId);
      }
    }
  };

  const getTypeInfo = (type) => {
    const info = postTypes.find(t => t.value === type);
    return info || postTypes[0];
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num?.toString() || '0';
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#024a47] flex items-center gap-2">
                <Users className="w-7 h-7" />
                Community Feed
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Connect with fellow vendors and share insights
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/community'}
              className="bg-[#024a47] text-white px-4 py-2 rounded-lg hover:bg-[#035d59] transition-colors font-semibold text-sm"
            >
              Create Post
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search community posts..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Type Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {postTypes.map(type => {
              const Icon = type.icon;
              const colors = {
                gray: '#6B7280',
                blue: '#3B82F6',
                yellow: '#EAB308',
                green: '#10B981',
                purple: '#8B5CF6'
              };
              
              return (
                <button
                  key={type.value}
                  onClick={() => {
                    setSelectedType(type.value);
                    setPage(1);
                    setPosts([]);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
                    selectedType === type.value
                      ? 'text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  style={selectedType === type.value ? {
                    backgroundColor: colors[type.color]
                  } : {}}
                >
                  <Icon className="w-4 h-4" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.map((post, index) => {
            const typeInfo = getTypeInfo(post.type);
            const TypeIcon = typeInfo.icon;
            const isOwnPost = post.vendor?._id === currentVendorId;
            const isLiked = post.likes?.some(like => like.user === currentVendorId);
            const comments = postComments[post._id] || [];

            const colors = {
              gray: '#6B7280',
              blue: '#3B82F6',
              yellow: '#EAB308',
              green: '#10B981',
              purple: '#8B5CF6'
            };

            return (
              <div
                key={post._id}
                ref={index === filteredPosts.length - 1 ? lastPostRef : null}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Post Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Vendor Avatar */}
                      <div className="w-12 h-12 bg-[#024a47] rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {(post.vendor?.businessName || post.vendor?.name)?.charAt(0)?.toUpperCase() || 'V'}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {post.vendor?.businessName || post.vendor?.name || 'Anonymous Vendor'}
                          </h3>
                          {isOwnPost && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-white"
                            style={{ backgroundColor: colors[typeInfo.color] }}
                          >
                            <TypeIcon className="w-3 h-3" />
                            {typeInfo.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu (only for own posts) */}
                    {isOwnPost && (
                      <div className="relative">
                        <button
                          onClick={() => setShowDropdown(showDropdown === post._id ? null : post._id)}
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>

                        {showDropdown === post._id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setShowDropdown(null)}
                            />
                            
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                              <button
                                onClick={() => {
                                  window.location.href = `/community/edit/${post._id}`;
                                  setShowDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Edit Post</span>
                              </button>
                              <button
                                onClick={() => handleDelete(post._id)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete Post</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Images */}
                  {post.images && post.images.length > 0 && (
                    <div className={`mt-4 grid gap-2 ${
                      post.images.length === 1 ? 'grid-cols-1' :
                      post.images.length === 2 ? 'grid-cols-2' :
                      'grid-cols-2 md:grid-cols-3'
                    }`}>
                      {post.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt={`Post image ${idx + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Linked Listing */}
                  {post.linkedListing && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Linked Listing</p>
                      <p className="font-semibold text-[#024a47]">
                        {post.linkedListing.title}
                      </p>
                      {post.linkedListing.price && (
                        <p className="text-sm text-gray-600">
                          ${post.linkedListing.price}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Engagement Bar */}
                <div className="px-4 py-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{formatNumber(post.engagement?.likes || 0)} likes</span>
                    <div className="flex items-center gap-3">
                      <span>{formatNumber(post.engagement?.comments || 0)} comments</span>
                      <span>{formatNumber(post.engagement?.shares || 0)} shares</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-around">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isLiked
                        ? 'text-red-500'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
                    <span className="font-semibold text-sm">Like</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post._id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-semibold text-sm">Comment</span>
                  </button>

                  <button
                    onClick={() => handleShare(post._id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="font-semibold text-sm">Share</span>
                  </button>
                </div>

                {/* Comment Section */}
                {showComments === post._id && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    {/* Comment Input */}
                    <div className="px-4 py-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentText[post._id] || ''}
                          onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                          placeholder="Write a comment..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleComment(post._id);
                          }}
                        />
                        <button
                          onClick={() => handleComment(post._id)}
                          disabled={!commentText[post._id]?.trim()}
                          className="bg-[#024a47] text-white px-4 py-2 rounded-lg hover:bg-[#035d59] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="px-4 pb-4 max-h-96 overflow-y-auto">
                      {loadingComments[post._id] ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#024a47]"></div>
                        </div>
                      ) : comments.length > 0 ? (
                        <div className="space-y-3">
                          {comments.map(comment => (
                            <div key={comment._id} className="bg-white rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex gap-2 flex-1">
                                  <div className="w-8 h-8 bg-[#024a47] rounded-full flex items-center justify-center text-white font-bold text-xs">
                                    {comment.user?.businessName?.charAt(0)?.toUpperCase() || 'V'}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-sm">
                                        {comment.user?.businessName || 'Vendor'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {formatDate(comment.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">
                                      {comment.text}
                                    </p>
                                  </div>
                                </div>
                                {(comment.user?._id === currentVendorId || isOwnPost) && (
                                  <button
                                    onClick={() => handleDeleteComment(post._id, comment._id)}
                                    className="text-gray-400 hover:text-red-500 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 text-sm py-4">
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#024a47]"></div>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredPosts.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Be the first to share something with the community!'}
            </p>
            <button 
              onClick={() => window.location.href = '/community'}
              className="bg-[#024a47] text-white px-6 py-3 rounded-lg hover:bg-[#035d59] transition-colors"
            >
              Create Post
            </button>
          </div>
        )}

        {/* End of Results */}
        {!loading && !hasMore && filteredPosts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">You've reached the end of the feed</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorCommunityFeed;