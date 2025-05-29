import React, { useEffect, useState } from "react";
import client, { databases, account } from "../appwrite/config";
import VibeCard from "../components/VibeCard";
import { Query } from "appwrite";
import { useUser } from "../hooks/useUser";
import Stories from "../components/Stories"; 
import { createLikeNotification } from "../lib/notifications";
import { createCommentNotification } from "../lib/notifications";
import { createFollowNotification } from "../lib/notifications";



const Feed = () => {
  const [vibes, setVibes] = useState([]);
  const [commentUserProfilesMap, setCommentUserProfilesMap] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const [commentsCountMap, setCommentsCountMap] = useState({});
  const [showComments, setShowComments] = useState({});
  const [userProfilesMap, setUserProfilesMap] = useState({});
  const [filter, setFilter] = useState("same-mbti");
  const { user } = useUser();

  const fetchUserProfiles = async () => {
    try {
      const res = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID
      );
  
      const userMap = {};
      res.documents.forEach((profile) => {
        userMap[profile.userId] = profile;
      });
  
      setUserProfilesMap(userMap);
    } catch (err) {
      console.error("Failed to fetch user profiles ", err);
    }
  };
  
  

  const fetchVibes = async () => {
    try {
      const res = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COLLECTION_ID
      );
  
      let filteredVibes = res.documents;
  
      if (filter === "same-mbti" && currentUserId) {
        const currentUserProfile = userProfilesMap[currentUserId];
        if (currentUserProfile?.mbtiType) {
          filteredVibes = filteredVibes.filter((v) => {
            const authorProfile = userProfilesMap[v.userId];
            return authorProfile?.mbtiType === currentUserProfile.mbtiType;
          });
        }
      }
      
  
      const sorted = filteredVibes.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setVibes(sorted);
    } catch (error) {
      console.error("Failed to fetch vibes ", error);
    }
  };
  
    

  const handleLike = async (vibe) => {
    try {
      const user = await account.get();
      const currentUserId = user.$id;
  
      const likedByList = Array.isArray(vibe?.likedBy) ? vibe.likedBy : [];
      const currentLikes = typeof vibe?.likes === "number" ? vibe.likes : 0;
  
      const hasLiked = likedByList.includes(currentUserId);
  
      const updatedLikedBy = hasLiked
        ? likedByList.filter((id) => id !== currentUserId)
        : [...likedByList, currentUserId];
  
      const updatedLikes = hasLiked
        ? Math.max(currentLikes - 1, 0)
        : currentLikes + 1;
  
      const updated = await databases.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COLLECTION_ID,
        vibe.$id,
        {
          likedBy: updatedLikedBy,
          likes: updatedLikes,
        }
      );
  
      //  Update local state
      setVibes((prev) =>
        prev.map((v) => (v.$id === vibe.$id ? { ...v, ...updated } : v))
      );
  
      //  Only send notification when it's a new like
      if (!hasLiked) {
        const receiverId = vibe.userId; // The original poster's user ID
        const senderId = currentUserId;
        const vibeId = vibe.$id;
  
        await createLikeNotification(receiverId, senderId, vibeId);
      }
  
    } catch (err) {
      console.error("Failed to like/unlike ", err);
    }
  };
  
   
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {

    const unsubscribe = client.subscribe(
      `databases.${import.meta.env.VITE_APPWRITE_DATABASE_ID}.collections.${import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID}.documents`,
      (response) => {
        if (response.events.includes("databases.*.collections.*.documents.*.create")) {
          // Someone added a new comment
          fetchComments(); // Re-fetch updated comments
        }
      }
    );
    
    const getUser = async () => {
      try {
        const user = await account.get();
        setCurrentUserId(user.$id);
      } catch (err) {
        console.error("Failed to get current user ", err);
      }
    };
    getUser();
    return () => {
      unsubscribe(); // Clean up subscription on unmount
    };
  }, []);
  
  const handleCommentChange = (e, vibeId) => {
    setCommentInput((prev) => ({
      ...prev,
      [vibeId]: e.target.value,
    }));
  };
  
  const handleCommentSubmit = async (e, vibeId) => {
    e.preventDefault();
  
    try {
      const user = await account.get();
      const comment = commentInput[vibeId];
  
      if (!comment?.trim()) return;
  
      await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID, // new comments collection
        'unique()', 
        {
          vibeId: vibeId,
          userId: user.$id,
          content: comment,
          createdAt: new Date().toISOString(),
        }
      );
  
      // Clear input
      setCommentInput((prev) => ({
        ...prev,
        [vibeId]: '',
      }));
  
      
      fetchVibes();
      const commentedVibe = vibes.find(v => v.$id === vibeId);
if (!commentedVibe) return;

const receiverId = commentedVibe.userId;
const senderId = user.$id;

await createCommentNotification(receiverId, senderId, vibeId);

    } catch (error) {
      console.error("Failed to post comment ", error);
    }
  };
  
  const fetchComments = async () => {
    try {
      const res = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID
      );
  
      const grouped = res.documents.reduce(
        (acc, comment) => {
          if (!acc.map[comment.vibeId]) acc.map[comment.vibeId] = [];
          acc.map[comment.vibeId].push(comment);
          acc.counts[comment.vibeId] = (acc.counts[comment.vibeId] || 0) + 1;
          return acc;
        },
        { map: {}, counts: {} }
      );
  
      setCommentsMap(grouped.map);
      setCommentsCountMap(grouped.counts);
  
      // Fetch commenter profiles
      await fetchCommentUserProfiles(res.documents);
  
    } catch (error) {
      console.error("Failed to fetch comments ", error);
    }
  };

  

  const fetchCommentUserProfiles = async (comments) => {
    const uniqueUserIds = [...new Set(comments.map(c => c.userId))];
    const profiles = {};
  
    for (const userId of uniqueUserIds) {
      try {
        const res = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
          [Query.equal("userId", userId)]
        );
        if (res.documents[0]) {
          profiles[userId] = res.documents[0];
        }
      } catch (err) {
        console.error("Failed to fetch profile for", userId, err);
      }
    }
  
    setCommentUserProfilesMap(profiles);
  };
  
  const handleFollow = async (followedUserId) => {
    try {
      const currentUser = await account.get();
      const currentUserId = currentUser.$id;
  
      // Assuming you have a function to follow a user
      await followUser(currentUserId, followedUserId);
  
      // Send follow notification
      await createFollowNotification(followedUserId, currentUserId); // Trigger follow notification
      setFollowing(prev => [...prev, followedUserId]);
    } catch (err) {
      console.error("Failed to follow user", err);
    }
  };
  

  
  useEffect(() => {
    fetchUserProfiles();
  }, []);
  
  useEffect(() => {
    if (user && Object.keys(userProfilesMap).length > 0 && currentUserId) {
      fetchVibes();
      fetchComments();
    }
  }, [filter, user, userProfilesMap, currentUserId]);
  
  
  return (
    
    <div className="max-w-3xl  mx-auto px-4 bg-white text-black dark:bg-gray-900 dark:text-white p-6 rounded-lg space-y-6">
       <div className="flex justify-end mb-4">
  <select
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
    className="p-2 rounded border bg-white text-black dark:bg-gray-800 dark:text-white"
  >
    <option value="all">All Vibes</option>
    <option value="same-mbti">Soul Vibes</option>
  </select>
</div>

       <Stories currentUser={user}/>

       


      {vibes.map((vibe) => {
      const userProfile = userProfilesMap[vibe.userId]; 

      return (
        
        <VibeCard
          key={vibe.$id}
          vibe={vibe}
          currentUserId={currentUserId}
          commentInput={commentInput}
          commentsMap={commentsMap}
          showComments={showComments}
          handleLike={handleLike}
          handleCommentSubmit={(e) => handleCommentSubmit(e, vibe.$id)}
          handleCommentChange={handleCommentChange}
          setShowComments={setShowComments}
          commentCount={commentsCountMap[vibe.$id] || 0}
          userProfile={userProfile} 
          commentUserProfilesMap={commentUserProfilesMap}
        />
      );
    })}
  
      {vibes.length === 0 && (
        <div className="flex items-center justify-center h-full py-4">
        <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      )}
    </div>
  );
};
export default Feed;
