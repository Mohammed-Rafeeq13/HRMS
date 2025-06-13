import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const CreatePost = () => {
  const [posts, setPosts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const users = ["@alice", "@bob", "@carol", "@dave"]; // Mentionable users
  const emojiList = [
    "😀", "😁", "😂", "🤣", "😊", "😉", "😍", "🥰", "😘", "😋", "🤪", "😎", "😭", "😤", "😡", "🤯", "🥳", "😅", "🤔",
    "❤", "💕", "💖", "💗", "💘", "💝", "💞", "💟", "❣",
    "👍", "👎", "👏", "🙌", "🙏", "🤝", "👋", "🤞", "✌", "👊",
    "🎉", "🎊", "🎈", "🥂", "🍾", "✨", "🔥", "🚀",
    "💻", "📱", "🖥", "📸", "🎥", "🎤", "📊", "📈", "📚", "🧠", "💡",
    "🌈", "🌤", "❄", "🌙", "⭐", "🌻", "🌺"
  ];

  const descriptionRef = useRef(null);
  const fileInputRef = useRef(null);

  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    mediaFile: null,
    mediaURL: "",
    mediaType: "",
  });

  // Fetch posts from backend on mount
  useEffect(() => {
    // UPDATED: Changed endpoint from /api/events to /api/createposts
    axios
      .get("http://localhost:4000/api/createposts")
      .then((res) => {
        setPosts(res.data);
      })
      .catch((err) => {
        console.error("❌ Error fetching posts:", err);
      });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setNewPost((prev) => ({
        ...prev,
        mediaFile: null,
        mediaURL: "",
        mediaType: "",
      }));
      return;
    }

    const fileType = file.type.startsWith("video") ? "video" : "image";
    const previewURL = URL.createObjectURL(file);

    setNewPost((prev) => ({
      ...prev,
      mediaFile: file,
      mediaURL: previewURL,
      mediaType: fileType,
    }));
  };

  const openEditModal = (post) => {
    setNewPost({
      title: post.title,
      description: post.description,
      mediaFile: null,
      mediaURL: post.mediaURL,
      mediaType: post.mediaType,
    });
    setEditingPostId(post.id);
    setModalOpen(true);
  };

  // NEW FUNCTION: To open the modal for creating a new post
  const openCreatePostModal = () => {
    setEditingPostId(null); // Ensure we are creating, not editing
    setNewPost({ // Reset the form fields
      title: "",
      description: "",
      mediaFile: null,
      mediaURL: "",
      mediaType: "",
    });
    setMentionSuggestions([]);
    setEmojiPickerOpen(false);
    setModalOpen(true); // Open the modal
  };


  const handleCreateOrEditPost = async (e) => {
    e.preventDefault();

    if (!newPost.title || !newPost.description) {
      alert("Title and description are required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", newPost.title);
    formData.append("description", newPost.description);

    if (newPost.mediaFile) {
      formData.append("media", newPost.mediaFile);
    } else {
      formData.append("mediaURL", newPost.mediaURL || '');
      formData.append("mediaType", newPost.mediaType || '');
    }

    try {
      let res;
      if (editingPostId) {
        // UPDATED: Changed endpoint from /api/events to /api/createposts
        res = await axios.put(`http://localhost:4000/api/createposts/${editingPostId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const updatedPosts = posts.map((post) =>
          post.id === editingPostId ? res.data : post
        );
        setPosts(updatedPosts);
        setEditingPostId(null);
        setModalOpen(false);
        if (newPost.mediaFile && newPost.mediaURL) {
          URL.revokeObjectURL(newPost.mediaURL);
        }
      } else {
        // UPDATED: Changed endpoint from /api/events to /api/createposts
        res = await axios.post("http://localhost:4000/api/createposts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setPosts([res.data, ...posts]);
        setModalOpen(false);
        if (newPost.mediaFile && newPost.mediaURL) {
          URL.revokeObjectURL(newPost.mediaURL);
        }
      }
      setNewPost({
        title: "",
        description: "",
        mediaFile: null,
        mediaURL: "",
        mediaType: "",
      });
    } catch (err) {
      console.error("❌ Error handling post:", err);
      alert(`Failed to ${editingPostId ? "update" : "create"} post.`);
    }
  };


  const handleDelete = () => {
    // UPDATED: Changed endpoint from /api/events to /api/createposts
    axios
      .delete(`http://localhost:4000/api/createposts/${confirmDeleteId}`)
      .then(() => {
        setPosts(posts.filter((post) => post.id !== confirmDeleteId));
        setConfirmDeleteId(null);
      })
      .catch((err) => {
        console.error("❌ Error deleting post:", err);
        alert("Failed to delete post.");
      });
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmojiSelect = (emoji) => {
    setNewPost((prev) => ({
      ...prev,
      description: prev.description + emoji,
    }));
    setEmojiPickerOpen(false);
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setNewPost((prev) => ({
      ...prev,
      description: value,
    }));

    const lastWord = value.split(" ").pop();
    if (lastWord.startsWith("@")) {
      const keyword = lastWord.toLowerCase();
      const suggestions = users.filter((u) => u.toLowerCase().startsWith(keyword));
      setMentionSuggestions(suggestions);
    } else {
      setMentionSuggestions([]);
    }
  };

  const handleSuggestionClick = (mention) => {
    const parts = newPost.description.split(" ");
    parts.pop();
    const updatedText = [...parts, mention].join(" ") + " ";
    setNewPost((prev) => ({
      ...prev,
      description: updatedText,
    }));
    setMentionSuggestions([]);
  };

  const closeModalAndReset = () => {
    setModalOpen(false);
    setEditingPostId(null);
    if (newPost.mediaFile && newPost.mediaURL) {
      URL.revokeObjectURL(newPost.mediaURL);
    }
    setNewPost({
      title: "",
      description: "",
      mediaFile: null,
      mediaURL: "",
      mediaType: "",
    });
    setMentionSuggestions([]);
    setEmojiPickerOpen(false);
  };


  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <button
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition duration-300"
          onClick={openCreatePostModal} // Corrected handler
        >
          + Create a Post
        </button>
        <input
          type="text"
          className="w-full sm:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Posts */}
      <h3 className="text-3xl font-extrabold mb-6 text-gray-800">Recent Posts</h3>

      {filteredPosts.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-gray-400 text-xl">
          {posts.length === 0 ? "No posts yet. Create one!" : "No matching posts."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => {
                setSelectedPost(post);
                setDetailModalOpen(true);
              }}
            >
              <h4 className="font-bold text-xl text-gray-900 mb-2">{post.title}</h4>
              <p className="text-gray-700">{post.description}</p>
              {post.mediaURL && post.mediaType === "image" && (
                <img src={post.mediaURL} className="mt-4 rounded max-h-64 object-cover w-full" alt="media" />
              )}
              {post.mediaURL && post.mediaType === "video" && (
                <video controls className="mt-4 rounded max-h-72 w-full">
                  <source src={post.mediaURL} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              <div className="mt-4 flex gap-3 justify-end">
                <button
                  className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(post);
                  }}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteId(post.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg space-y-4"
            style={{ maxHeight: "80vh", overflowY: "auto" }}
          >
            <h2 className="text-2xl font-bold text-gray-900">
              {editingPostId ? "Edit Post" : "Create Post"}
            </h2>
            <form onSubmit={handleCreateOrEditPost} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <div className="relative">
                <textarea
                  ref={descriptionRef}
                  placeholder="Description (use @mention)"
                  value={newPost.description}
                  onChange={handleDescriptionChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setEmojiPickerOpen((prev) => !prev)}
                  className="absolute top-2 right-2 text-2xl hover:scale-110 transition"
                  aria-label="Toggle Emoji Picker"
                >
                  😊
                </button>

                {mentionSuggestions.length > 0 && (
                  <ul className="absolute left-0 mt-1 w-full bg-white border rounded shadow-md z-10 max-h-40 overflow-y-auto">
                    {mentionSuggestions.map((user, index) => (
                      <li
                        key={index}
                        onClick={() => handleSuggestionClick(user)}
                        className="px-4 py-2 cursor-pointer hover:bg-indigo-100"
                      >
                        {user}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {emojiPickerOpen && (
                <div className="flex flex-wrap gap-2 p-2 border rounded shadow max-w-xs">
                  {emojiList.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className="text-2xl hover:scale-125 transition"
                      aria-label={`Select emoji ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12V8a4 4 0 014-4h8a4 4 0 014 4v4m-4 4h.01"
                    />
                  </svg>
                  Media Picker
                </label>
                <span className="ml-3 text-gray-700">
                  {newPost.mediaFile?.name || (newPost.mediaURL ? "Existing Media" : "No file selected")}
                </span>
                {(newPost.mediaFile || newPost.mediaURL) && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewPost(prev => ({ ...prev, mediaFile: null, mediaURL: "", mediaType: "" }));
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="ml-3 text-red-500 hover:text-red-700 text-sm"
                  >
                    Clear Media
                  </button>
                )}
              </div>

              {newPost.mediaURL && (
                <div className="mt-4">
                  {newPost.mediaType === "image" ? (
                    <img
                      src={newPost.mediaURL}
                      alt="Preview"
                      className="max-h-60 rounded object-contain w-full"
                    />
                  ) : (
                    <video
                      controls
                      className="max-h-60 rounded w-full"
                      src={newPost.mediaURL}
                      type="video/mp4"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={closeModalAndReset}
                  className="bg-gray-400 px-5 py-2 rounded shadow hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-5 py-2 rounded shadow hover:bg-indigo-700 transition"
                >
                  {editingPostId ? "Save Changes" : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full space-y-4">
            <h3 className="text-xl font-semibold text-red-600">Confirm Delete</h3>
            <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {detailModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-3xl font-extrabold mb-4 text-gray-900">{selectedPost.title}</h2>
            <p className="text-gray-800 whitespace-pre-wrap mb-4">{selectedPost.description}</p>
            {selectedPost.mediaURL && selectedPost.mediaType === "image" && (
              <img
                src={selectedPost.mediaURL}
                alt="Post media"
                className="rounded mb-4 max-h-96 w-full object-contain"
              />
            )}
            {selectedPost.mediaURL && selectedPost.mediaType === "video" && (
              <video controls className="rounded mb-4 max-h-96 w-full">
                <source src={selectedPost.mediaURL} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            <button
              className="bg-indigo-600 text-white px-6 py-3 rounded shadow hover:bg-indigo-700 transition"
              onClick={() => setDetailModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;
