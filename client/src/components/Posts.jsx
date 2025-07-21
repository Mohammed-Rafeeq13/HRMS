import React, { useEffect, useState } from "react";



const Posts = ({user}) => {
  const [posts, setPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [sharedLinks, setSharedLinks] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const CURRENT_USER =user

  const fetchPosts = async (useRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = useRefresh ?
        "http://localhost:5000/api/posts/refresh" :
        "http://localhost:5000/api/posts";

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();

      // Posts are already randomized by the server
      setPosts(data);

      const saved = {};
      data.forEach((p) => {
        if (p.saved) saved[p._id] = true;
      });
      setSavedPosts(saved);

      if (useRefresh) {
        console.log(`✅ Refreshed and loaded ${data.length} posts`);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleRefresh = () => {
    fetchPosts(true); // Use refresh endpoint to sync and get latest posts
  };

  // Auto-refresh every 30 seconds to catch new posts
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPosts(true);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Listen for post creation events
  useEffect(() => {
    const handlePostCreated = (event) => {
      console.log('New post created:', event.detail);
      // Refresh posts when a new post is created
      setTimeout(() => {
        fetchPosts(true);
      }, 1000); // Small delay to ensure sync is complete
    };

    window.addEventListener('postCreated', handlePostCreated);

    return () => {
      window.removeEventListener('postCreated', handlePostCreated);
    };
  }, []);

  const handleLike = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/like`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to update like");
      const updatedPost = await res.json();
      setPosts((prev) => prev.map((p) => (p._id === id ? updatedPost : p)));
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleComments = (id) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddComment = async (id) => {
    const commentText = commentInputs[id]?.trim();
    if (!commentText) return;

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/comment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: CURRENT_USER.name, text: commentText }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      const updatedPost = await res.json();
      setPosts((prev) => prev.map((p) => (p._id === id ? updatedPost : p)));
      setCommentInputs((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleShare = (id) => {
    const shareLink = `https://example.com/post/${id}`;
    setSharedLinks((prev) => ({ ...prev, [id]: shareLink }));
    navigator.clipboard.writeText(shareLink);
    alert("Post link copied to clipboard!");
  };

  const toggleSave = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/save`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to toggle save");
      const updatedPost = await res.json();
      setPosts((prev) => prev.map((p) => (p._id === id ? updatedPost : p)));
      setSavedPosts((prev) => ({ ...prev, [id]: updatedPost.saved }));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-4 lg:py-6">
      <div className="container-main flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="lg:w-3/4 w-full space-y-4 lg:space-y-6">
          <div className="bg-white p-4 rounded shadow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
            <div className="flex-1">
              <h2 className="text-xl lg:text-2xl font-bold text-blue-800">Posts</h2>
              <p className="text-sm lg:text-base font-normal text-gray-600">
                Browse updates from your network ({posts.length} posts)
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`px-4 py-2 rounded transition flex items-center gap-2 btn-touch flex-shrink-0 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {loading && posts.length === 0 && (
            <div className="bg-white p-8 rounded shadow text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading posts...</p>
            </div>
          )}

          {!loading && posts.length === 0 && !error && (
            <div className="bg-white p-8 rounded shadow text-center">
              <p className="text-gray-600 mb-4">No posts available yet.</p>
              <p className="text-sm text-gray-500">Create some posts to see them here!</p>
            </div>
          )}

          {posts.map((post) => (
            <div key={post._id} className="bg-white p-4 lg:p-5 shadow rounded space-y-3 card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      user?.name?.split(' ').map(n => n[0]).join('') || 'U'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-800 truncate">{user?.name || 'User'}</h4>
                    <p className="text-sm text-gray-500 truncate">{user?.role || 'Employee'}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSave(post._id)}
                  className="text-sm text-gray-600 hover:text-blue-600 transition btn-touch flex-shrink-0 ml-2"
                >
                  {savedPosts[post._id] ? "💾 Saved" : "💾 Save"}
                </button>
              </div>

              <div className="text-gray-700">
                {post.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className={index === 0 ? "font-semibold text-gray-900 mb-2" : "mb-2"}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full rounded-md object-cover max-h-48 lg:max-h-64"
                />
              )}

              <p className="text-sm text-gray-500">
                {post.views} views · {post.comments.length} comments · {post.shares} shares
              </p>

              <div className="flex flex-wrap gap-2 lg:justify-between text-sm text-gray-600">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`transition btn-touch ${
                    post.liked ? "text-blue-600 font-semibold" : "hover:text-blue-600"
                  }`}
                >
                  👍 Like ({post.likes})
                </button>
                <button
                  onClick={() => toggleComments(post._id)}
                  className="hover:text-blue-600 transition btn-touch"
                >
                  💬 Comment ({post.comments.length})
                </button>
                <button
                  onClick={() => handleShare(post._id)}
                  className="hover:text-blue-600 transition btn-touch"
                >
                  🔗 Share
                </button>
              </div>

              {expandedComments[post._id] && (
                <div className="mt-3 space-y-2">
                  {post.comments.map((comment, idx) => (
                    <div key={idx} className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                      <span className="font-semibold text-gray-800">{comment.name}:</span>{" "}
                      {comment.text}
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      value={commentInputs[post._id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post._id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      onClick={() => handleAddComment(post._id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}

              {sharedLinks[post._id] && (
                <div className="text-xs text-gray-400 mt-2">
                  Link copied: <code>{sharedLinks[post._id]}</code>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="lg:w-1/4 w-full space-y-6">
          <div className="bg-white p-4 shadow rounded text-center">
            <img
              src={CURRENT_USER.image}
              alt="User Avatar"
              className="w-24 h-24 rounded-full mx-auto mb-2"
            />
            <h2 className="text-xl font-semibold">{CURRENT_USER.name}</h2>
            <p className="text-sm text-gray-500">{CURRENT_USER.role}</p>
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>
                <strong>1,284</strong> connections
              </p>
              <p>
                <strong>258</strong> followers
              </p>
            </div>
          </div>

          <div className="bg-white p-4 shadow rounded">
            <h3 className="font-semibold mb-2">Trending in HR</h3>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>#EmployeeEngagement</li>
              <li>#RemoteWork</li>
              <li>#HRTech</li>
              <li>#FutureOfWork</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posts;
