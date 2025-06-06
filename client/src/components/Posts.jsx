import React, { useEffect, useState } from "react";

const CURRENT_USER = {
  name: "John Doe",
  position: "HR Consultant",
  avatar: "https://randomuser.me/api/portraits/men/47.jpg",
};

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [sharedLinks, setSharedLinks] = useState({});
  const [savedPosts, setSavedPosts] = useState({});

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/posts");
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data);
      // Set saved posts
      const saved = {};
      data.forEach((p) => {
        if (p.saved) saved[p._id] = true;
      });
      setSavedPosts(saved);
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Listen for post created event to refresh
    const handler = () => fetchPosts();
    window.addEventListener("postCreated", handler);
    return () => window.removeEventListener("postCreated", handler);
  }, []);

  const handleLike = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/api/posts/${id}/like`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to update like");
      const updatedPost = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p._id === id ? updatedPost : p))
      );
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
      const res = await fetch(`http://localhost:4000/api/posts/${id}/comment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: CURRENT_USER.name, text: commentText }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      const updatedPost = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p._id === id ? updatedPost : p))
      );
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
      const res = await fetch(`http://localhost:4000/api/posts/${id}/save`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to toggle save");
      const updatedPost = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p._id === id ? updatedPost : p))
      );

      setSavedPosts((prev) => ({
        ...prev,
        [id]: updatedPost.saved,
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <div className="max-w-5xl mx-auto px-6 flex flex-col lg:flex-row gap-6">
        <div className="lg:w-3/4 w-full space-y-6">
          <div className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-blue-800">Posts</h2>
              <p className="text-base font-normal text-gray-600">
                Stay updated with your network
              </p>
            </div>
          </div>

          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white p-5 shadow rounded space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{post.name}</h4>
                    <p className="text-sm text-gray-500">{post.position}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSave(post._id)}
                  className="text-sm text-gray-600 hover:text-blue-600 transition"
                >
                  {savedPosts[post._id] ? "💾 Saved" : "💾 Save"}
                </button>
              </div>

              <p className="text-gray-700">{post.content}</p>

              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full rounded-md object-cover max-h-64"
                />
              )}

              <p className="text-sm text-gray-500">
                {post.views} views · {post.comments.length} comments · {post.shares} shares
              </p>

              <div className="flex justify-between text-sm text-gray-600">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`transition ${
                    post.liked ? "text-blue-600 font-semibold" : "hover:text-blue-600"
                  }`}
                >
                  👍 Like ({post.likes})
                </button>
                <button
                  onClick={() => toggleComments(post._id)}
                  className="hover:text-blue-600 transition"
                >
                  💬 Comment ({post.comments.length})
                </button>
                <button
                  onClick={() => handleShare(post._id)}
                  className="hover:text-blue-600 transition"
                >
                  🔗 Share
                </button>
              </div>

              {expandedComments[post._id] && (
                <div className="mt-3 space-y-2">
                  {post.comments.map((comment, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-gray-700 bg-gray-100 p-2 rounded"
                    >
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

        {/* Sidebar */}
        <div className="lg:w-1/4 w-full space-y-6">
          <div className="bg-white p-4 shadow rounded text-center">
            <img
              src={CURRENT_USER.avatar}
              alt="User Avatar"
              className="w-24 h-24 rounded-full mx-auto mb-2"
            />
            <h2 className="text-xl font-semibold">{CURRENT_USER.name}</h2>
            <p className="text-sm text-gray-500">{CURRENT_USER.position}</p>
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

          <div className="bg-white p-4 shadow rounded">
            <h3 className="font-semibold mb-2">Recommended Connections</h3>
            <ul className="text-sm space-y-2">
              <li>Lisa Clark (HR Partner)</li>
              <li>Daniel Kim (HR Analyst)</li>
              <li>Rachel Scott (Workplace Coach)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posts;
