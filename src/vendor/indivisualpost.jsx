import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, Share2, Send, MoreVertical, Edit, Trash2, AlertCircle, Megaphone, Lightbulb, TrendingUp, Tag, Users, Eye, Calendar, MapPin } from 'lucide-react';
import { BASE_URL } from '../baseUrl';
function IndividualPostPage() {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error, setError] = useState('');
  const [currentVendorId, setCurrentVendorId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Get post ID from URL (e.g., /community/post/:id)
  const postId = window.location.pathname.split('/').pop();

  const postTypeInfo = {
    announcement: { icon: Megaphone, color: '#3B82F6', label: 'Announcement' },
    tip: { icon: Lightbulb, color: '#EAB308', label: 'Tip & Advice' },
    update: { icon: TrendingUp, color: '#10B981', label: 'Update' },
    promotion: { icon: Tag, color: '#8B5CF6', label: 'Promotion' }
  };

  useEffect(() => {
    fetchCurrentVendor();
    fetchPost();
    fetchComments();
  }, [postId]);

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

  const fetchPost = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/community/posts/${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

    console.log(data)
      if (data.success) {
        setPost(data.post);
      } else {
        setError(data.error || 'Post not found');
      }

    } catch (err) {
      console.error('Fetch post error:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/community/posts/${postId}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setComments(data.comments || []);
      }

    } catch (err) {
      console.error('Fetch comments error:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      // Handle both populated and non-populated user objects
      const isLiked = post.likes?.some(like => {
        const likeUserId = typeof like.user === 'object' ? like.user._id : like.user;
        return likeUserId === currentVendorId;
      });
      
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
        setPost(prev => {
          const newLikes = isLiked 
            ? prev.likes.filter(like => {
                const likeUserId = typeof like.user === 'object' ? like.user._id : like.user;
                return likeUserId !== currentVendorId;
              })
            : [...(prev.likes || []), { user: currentVendorId, createdAt: new Date() }];
          
          return {
            ...prev,
            likes: newLikes,
            engagement: { 
              ...prev.engagement, 
              likes: data.likes || newLikes.length 
            }
          };
        });
      }

    } catch (err) {
      console.error('Like error:', err);
      setError('Failed to like post');
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: commentText })
      });

      const data = await response.json();

      if (data.success) {
        setComments(prev => [data.comment, ...prev]);
        setPost(prev => ({
          ...prev,
          engagement: { 
            ...prev.engagement, 
            comments: data.totalComments || prev.engagement.comments + 1 
          }
        }));
        setCommentText('');
        setSuccessMessage('Comment added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }

    } catch (err) {
      console.error('Comment error:', err);
      setError('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/community/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setComments(prev => prev.filter(c => c._id !== commentId));
        setPost(prev => ({
          ...prev,
          engagement: { 
            ...prev.engagement, 
            comments: data.totalComments || prev.engagement.comments - 1 
          }
        }));
        setSuccessMessage('Comment deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }

    } catch (err) {
      console.error('Delete comment error:', err);
      setError('Failed to delete comment');
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = window.location.href;
      const shareData = {
        title: document.title || 'Check this out!',
        text: 'I found this interesting link:',
        url: shareUrl,
      };
  
     
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('Shared successfully!');
      } else {
      
        await navigator.clipboard.writeText(shareUrl);
        setSuccessMessage('Link copied to clipboard!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };
  

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/community/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        window.location.href = '/community/feed';
      }

    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete post');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num?.toString() || '0';
  };

  const formatDate = (date) => {
    const postDate = new Date(date);
    return postDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (date) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#024a47] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/community/feed'}
            className="bg-[#024a47] text-white px-6 py-3 rounded-lg hover:bg-[#035d59] transition-colors"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const typeInfo = postTypeInfo[post.type] || postTypeInfo.announcement;
  const TypeIcon = typeInfo.icon;
  const isOwnPost = post.vendor?._id === currentVendorId;

const isLiked = post.likes?.some(like => {
    const likeUserId = typeof like.user === 'object' ? like.user._id : like.user;
    return likeUserId === currentVendorId;
  });
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button 
              onClick={() => {
                window.location.href='/feed'
              }}
              className="flex items-center space-x-2 text-gray-600 hover:text-[#024a47]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Feed</span>
            </button>
            <h1 className="text-xl font-bold text-[#024a47]">Community Post</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Main Post Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {/* Post Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                {/* Vendor Avatar */}
                <div className="w-16 h-16 bg-[#024a47] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {(post.vendor?.businessName || post.vendor?.name)?.charAt(0)?.toUpperCase() || 'V'}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-gray-900">
                      {post.vendor?.businessName || post.vendor?.name || 'Anonymous Vendor'}
                    </h2>
                    {isOwnPost && (
                      <span className="text-xs bg-[#024a47] text-white px-2 py-1 rounded font-semibold">
                        Your Post
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: typeInfo.color }}
                    >
                      <TypeIcon className="w-4 h-4" />
                      {typeInfo.label}
                    </span>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  {post.vendor?.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                      <MapPin className="w-4 h-4" />
                      {post.vendor.location}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Menu (only for own posts) */}
              {isOwnPost && (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <MoreVertical className="w-6 h-6 text-gray-500" />
                  </button>

                  {showDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowDropdown(false)}
                      />
                      
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                        <button
                          onClick={() => {
                            window.location.href = `/community/edit/${post._id}`;
                            setShowDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit Post</span>
                        </button>
                        <button
                          onClick={handleDelete}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
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
          <div className="p-6">
            <p className="text-gray-800 text-lg whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className={`mt-6 grid gap-3 ${
                post.images.length === 1 ? 'grid-cols-1' :
                post.images.length === 2 ? 'grid-cols-2' :
                post.images.length === 3 ? 'grid-cols-3' :
                'grid-cols-2'
              }`}>
                {post.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={`Post image ${idx + 1}`}
                    className={`w-full object-cover rounded-lg ${
                      post.images.length === 1 ? 'h-96' : 'h-64'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Linked Listing */}
            {post.linkedListing && (
              <div className="mt-6 p-4 bg-gradient-to-r from-[#024a47]/5 to-[#024a47]/10 rounded-lg border-2 border-[#024a47]/20">
                <p className="text-xs text-[#024a47] font-semibold mb-2 uppercase tracking-wide">
                  Featured Listing
                </p>
              
              </div>
            )}
          </div>

          {/* Engagement Stats */}
          <div className="px-6 py-4 border-y border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  <span className="font-semibold text-gray-700">
                    {formatNumber(post.engagement?.likes || 0)} likes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-gray-700">
                    {formatNumber(post.engagement?.comments || 0)} comments
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-gray-700">
                  {formatNumber(post.engagement?.shares || 0)} shares
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-around gap-2">
            <button
              onClick={handleLike}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all font-semibold ${
                isLiked
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-600' : ''}`} />
              <span>{isLiked ? 'Liked' : 'Like'}</span>
            </button>

            <button
              onClick={() => document.getElementById('comment-input')?.focus()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors font-semibold"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Comment</span>
            </button>

            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors font-semibold"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>

          {/* Comment Input */}
          <div className="p-6 bg-gray-50">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-[#024a47] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                U
              </div>
              <div className="flex-1">
                <textarea
                  id="comment-input"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent resize-none"
                  rows="3"
                  maxLength={1000}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {commentText.length}/1000 characters
                  </span>
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                    className="bg-[#024a47] text-white px-6 py-2 rounded-lg hover:bg-[#035d59] transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-[#024a47]" />
            Comments ({comments.length})
          </h3>

          {loadingComments ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#024a47]"></div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map(comment => {
                const isCommentOwner = comment.user?._id === currentVendorId;
                
                return (
                  <div key={comment._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#024a47] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {comment.user?.businessName?.charAt(0)?.toUpperCase() || 'V'}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {comment.user?.businessName || 'Vendor'}
                              </span>
                              {isCommentOwner && (
                                <span className="text-xs bg-[#024a47] text-white px-2 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          
                          {(isCommentOwner || isOwnPost) && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mt-2 leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-700 mb-2">No comments yet</h4>
              <p className="text-gray-500">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>

        {/* Related Posts or Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Community Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Be respectful and professional in your comments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Provide constructive feedback and helpful insights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Report any inappropriate content to moderators</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default IndividualPostPage;