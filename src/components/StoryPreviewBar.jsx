import { useEffect, useState } from "react";
import { fetchActiveStories } from "../lib/fetchStories";
import client, {account, databases, IDUtils as ID } from "../appwrite/config";
import { Query } from "appwrite";

const StoryPreviewBar = ({ onStoryClick }) => {
  const [groupedStories, setGroupedStories] = useState({});

  useEffect(() => {
    const loadStories = async () => {
      try {
        const currentUser = await account.get();
        const currentUserId = currentUser.$id;
  
        //Fetch follow relationships
        const followRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID,
          [Query.equal("followerId", currentUserId)]
        );
  
        const followingIds = followRes.documents.map(doc => doc.followingId);
        followingIds.push(currentUserId); // Include self in followingIds
        //Fetch stories
        const res = await fetchActiveStories();
        const allStories = Array.isArray(res) ? res : res.documents;
  
        //Group stories by user, but only if userId is in followingIds
        const grouped = {};
        allStories.forEach((story) => {
          if (followingIds.includes(story.userId)) {
            if (!grouped[story.userId]) {
              grouped[story.userId] = {
                userId: story.userId,
                username: story.username,
                profilePicUrl: story.profilePicUrl,
                items: [],
              };
            }
            grouped[story.userId].items.push(story);
          }
        });
        const sorted = {};
    if (grouped[currentUserId]) {
      sorted[currentUserId] = grouped[currentUserId];
    }
    for (const userId in grouped) {
      if (userId !== currentUserId) {
        sorted[userId] = grouped[userId];
      }
    }
        setGroupedStories(grouped);
      } catch (error) {
        console.error("Failed to load stories or follows:", error);
      }
    };
  
    loadStories();
  
    const unsubscribe = client.subscribe(
      `databases.${import.meta.env.VITE_APPWRITE_DATABASE_ID}.collections.${import.meta.env.VITE_APPWRITE_STORIES_COLLECTION_ID}.documents`,
      () => {
        loadStories(); // Refresh on changes
      }
    );
  
    return () => {
      unsubscribe(); // Cleanup
    };
  }, []);
  
  useEffect(() => {
    
  }, [groupedStories]);
  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {Object.keys(groupedStories).length === 0 ? (
  <p className="text-white">No stories yet</p>
) : (
  Object.values(groupedStories).map((userStory) => (
    <div
      key={userStory.userId}
      className="flex flex-col items-center cursor-pointer"
      onClick={() => {
        onStoryClick({...userStory,
          currentIndex: 0,});
      }}
       

      
    >
      <img
        src={userStory.profilePicUrl || "/default-avatar.png"}
        className="w-14 h-14 rounded-full border-2 border-pink-400"
      />
      <span className="text-xs mt-1 text-white">{userStory.username}</span>
    </div>
  ))
)}


    </div>
  );
};

export default StoryPreviewBar;
