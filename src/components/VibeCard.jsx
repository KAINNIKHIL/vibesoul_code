import { Link } from "react-router-dom";
import React from "react";
import { account } from "../appwrite/config";


const VibeCard = ({
  vibe,
  userProfile,
  currentUserId,
  commentInput,
  commentsMap,
  showComments,
  handleLike,
  handleCommentSubmit,
  handleCommentChange,
  setShowComments,
  commentUserProfilesMap,
  commentCount
}) => {
  const comments = commentsMap[vibe.$id] || [];
  return (
    <div
      key={vibe.$id}
      className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 "
    >
      <p className="text-sm text-gray-300 mb-2">
  <Link to={vibe.userId === currentUserId ? "/profile" : `/profile/${vibe.userId}`} className="flex items-center gap-2">
    <img
      src={userProfile?.profilePicUrl || "/default-avatar.png"}
      alt="user"
      className="w-8 h-8 rounded-full object-cover"
    />
    <span className="font-semibold text-xl">{userProfile?.username || "Anonymous"}</span>
  </Link>
</p>
      <p className="text-xl font-medium">{vibe.vibeText}</p>

      {vibe.imageUrl && (
        <img
          src={vibe.imageUrl}
          alt="vibe-img"
          className="mt-4 rounded-xl max-h-140 w-full border border-white/10"
        />
      )}

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-gray-200">
          {new Date(vibe.createdAt).toLocaleString()}
        </p>
        <button
          onClick={() => handleLike(vibe)}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-transform duration-200 ${
            vibe.likedBy?.includes(currentUserId)
              ? "bg-pink-400 text-white hover:bg-pink-700 scale-105"
              : "bg-white text-pink-600 hover:bg-pink-100 scale-100"
          }`}
        >
          ❤️ <span className="text-sm font-bold">{vibe.likes || 0}</span>
        </button>
      </div>

      {/* Toggle Comments */}
      <button
        onClick={() =>
          setShowComments((prev) => ({
            ...prev,
            [vibe.$id]: !prev[vibe.$id],
          }))
        }
        className="text-sm text-gray-300 mt-4"
      >
        {showComments[vibe.$id]
  ? "Hide comments"
  : `💬 ${commentCount} comment${commentCount !== 1 ? "s" : ""}`}
      </button>
      {/* Comments Section */}
      {showComments[vibe.$id] && (
        <div className="mt-4 bg-white/10 rounded-xl p-4 space-y-3">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
  key={comment.$id}
  className="border-l-4 border-pink-500 pl-3 text-white/90"
>
  <div className="flex items-center gap-2 mb-1">
  <Link to={comment.userId === currentUserId ? "/profile" : `/profile/${comment.userId}`} className="flex items-center gap-2">
    <img
      src={commentUserProfilesMap[comment.userId]?.profilePicUrl || "/default-avatar.png"}
      alt="avatar"
      className="w-6 h-6 rounded-full object-cover"
    />
    <span className="text-sm font-semibold text-gray-300">
      {commentUserProfilesMap[comment.userId]?.username || "Anonymous"}
    </span>
    </Link>
  </div>
  <p className="text-white">{comment.content}</p>
  <p className="text-xs text-gray-300">
    {new Date(comment.createdAt).toLocaleString()}
  </p>
</div>

            ))
          ) : (
            <p className="text-sm text-gray-300">
              No comments yet ✨
            </p>
          )}
        </div>
      )}

      {/* Comment Form */}
      <form
        onSubmit={(e) => handleCommentSubmit(e, vibe.$id)}
        className="mt-3 flex gap-2"
      >
        <input
          type="text"
          placeholder="Write a comment..."
          className="flex-1 rounded-lg p-1 text-black"
          value={commentInput[vibe.$id] || ""}
          onChange={(e) => handleCommentChange(e, vibe.$id)}
        />
        <button
          type="submit"
          className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded-lg"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default VibeCard;
