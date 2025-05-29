import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { databases,account } from "../appwrite/config";
import { Query } from "appwrite";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const PublicProfile = () => {
  const { userId } = useParams();
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const targetUserId = userId;
  const [isFollowing, setIsFollowing] = useState(false);
  const [vibes, setVibes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFollowCounts = async (userId) => {
    try {
      const followersRes = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID,
        [Query.equal("followingId", userId)]
      );
      setFollowersCount(followersRes.total);
  
      const followingRes = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID,
        [Query.equal("followerId", userId)]
      );
      setFollowingCount(followingRes.total);
    } catch (err) {
      console.error("Failed to fetch follow counts", err);
    }
  };
  

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await account.get();
        setCurrentUserId(user.$id);
      } catch (err) {
        console.error("Failed to get current user", err);
      }
    };
  
    fetchCurrentUser();
  }, []);
  
  useEffect(() => {
    const checkIfFollowing = async () => {
      if (!currentUserId || !userProfile?.userId) return;
  
      try {
        const followRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID, 
          [
            Query.equal("followerId", currentUserId),
            Query.equal("followingId", userProfile.userId),
          ]
        );
  
        setIsFollowing(followRes.documents.length > 0);
      } catch (error) {
        console.error("Failed to check follow status", error);
      }
    };
  
    checkIfFollowing();
  }, [currentUserId, userProfile]);
  
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        // Get public profile info
        const profileRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
          [Query.equal("userId", userId)]
        );

        if (profileRes.documents.length > 0) {
          setUserProfile(profileRes.documents[0]);
        }

        // Get this user's vibes
        const vibesRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_COLLECTION_ID,
          [Query.equal("userId", userId), Query.orderDesc("$createdAt")]
        );

        setVibes(vibesRes.documents);
      } catch (err) {
        console.error("Error loading public profile:", err);
      } finally {
        setLoading(false);
      }
      await fetchFollowCounts(userId);

    };

    fetchPublicData();
  }, [userId]);
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        // Unfollow: find and delete the follow document
        const followRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID,
          [
            Query.equal("followerId", currentUserId),
            Query.equal("followingId", targetUserId),
          ]
        );
  
        if (followRes.documents.length > 0) {
          await databases.deleteDocument(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID,
            followRes.documents[0].$id
          );
        }
  
        setIsFollowing(false);
        await fetchFollowCounts(targetUserId);
      } else {
        // Follow: create a new follow document
        await databases.createDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID,
          'unique()', // auto-generate ID
          {
            followerId: currentUserId,
            followingId: targetUserId,
            createdAt: new Date().toISOString()
          }
        );

        await databases.createDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID, // use correct env var
          'unique()',
          {
            type: "follow",
            senderId: currentUserId,
            receiverId: targetUserId,
            isRead: false,
            timestamp: new Date().toISOString()
          }
        );
  
        setIsFollowing(true);
        await fetchFollowCounts(targetUserId);
      }
    } catch (error) {
      console.error("Failed to toggle follow status", error);
    }
    

  };
  
  if (loading) return <div className="flex items-center justify-center h-full py-4">
        <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

  if (!userProfile) return <p className="text-center">User not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg">
      
      <div className="flex items-center gap-4 mb-6">
        <img
          src={userProfile.profilePicUrl || "/default-avatar.png"}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div>
          <h1 className="text-xl font-semibold">{userProfile.username || "VibeSoul User"}</h1>
          {userProfile.mbtiType && (
            <p className="text-sm text-gray-500 dark:text-gray-300">
              MBTI: {userProfile.mbtiType.toUpperCase()}
            </p>
          )}
        </div>
        <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-300">
  <Link to={`/profile/${targetUserId}/followers`} className="hover:underline">
    <span className="font-semibold">{followersCount}</span> Followers
  </Link>
  <Link to={`/profile/${targetUserId}/following`} className="hover:underline">
    <span className="font-semibold">{followingCount}</span> Following
  </Link>
</div>

      </div>
      {currentUserId !== targetUserId && (
  <button
    className={`px-4 py-2 rounded-lg text-sm font-medium ${
      isFollowing ? "bg-gray-400 text-white" : "bg-pink-600 text-white"
    }`}
    onClick={handleFollowToggle}
  >
    {isFollowing ? "Unfollow" : "Follow"}
  </button>
)}
{currentUserId !== targetUserId && (
  <button
    className={"mx-4 px-4 py-2 rounded-lg text-sm font-medium bg-pink-600 text-white"}
    onClick={() => navigate("/chat/" + targetUserId)}
  >
    MESSAGE
  </button>
)}

      {userProfile?.bio && (
  <h2 className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
    {userProfile.bio}
  </h2>
)}
      {/* Vibes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
      <h1 className="text-xl font-semibold">Vibes: {vibes.length}</h1>
        {vibes.length === 0 ? (
          <p>This user hasn’t posted any vibes yet.</p>
        ) : (
          vibes.map((vibe) => (
            <div key={vibe.$id} className="p-4 border dark:border-gray-700 rounded-lg">
              <p>{vibe.vibeText}</p>
              {vibe.imageUrl && (
        <img
          src={vibe.imageUrl}
          alt="vibe-img"
          className="mt-4 rounded-xl max-h-80 w-full border border-white/10"
        />
      )}
              <span className="text-sm text-gray-500">
                {new Date(vibe.$createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
