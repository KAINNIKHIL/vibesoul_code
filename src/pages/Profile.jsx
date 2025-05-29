import React, { useEffect, useState } from "react";
import { account, databases } from "../appwrite/config";
import { Query } from "appwrite";
import { Link } from "react-router-dom";
import { Pencil, Send } from "lucide-react";





const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [vibes, setVibes] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

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
    const fetchData = async () => {
      try {
        // Get Authenticated User
        const userData = await account.get();
        setUser(userData);
        await fetchFollowCounts(userData.$id);

        // Get Extended Profile from your new collection
        const profileRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
          [ // only fetch the document matching user ID
            Query.equal("userId", userData.$id),
          ]
        );

        if (profileRes.documents.length > 0) {
          const profileDoc = profileRes.documents[0];
          setUserProfile(profileDoc);
        } else {
          console.warn("No user profile found for userId:", userData.$id);
        }
        

        // Get Vibes posted by the user
        const vibeRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_COLLECTION_ID
        );

        const userVibes = vibeRes.documents.filter(v => v.userId === userData.$id);
        setVibes(userVibes);

      } catch (err) {
        console.error("Error loading user profile:", err);
      }
      
    };

    fetchData();
  }, []);

  if (!user || !userProfile)
    return (
      <div className="flex items-center justify-center h-full py-4">
        <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  

  
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg">
      {/* Basic Info */}


     




      <div className="flex items-center gap-4 mb-6">
     
     

        <img
          src={userProfile?.profilePicUrl || "/default-avatar.png"}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div>
          <h1 className="text-xl font-semibold">{user.name || user.email}</h1>
          {userProfile?.mbtiType && (
            <p className="text-sm text-gray-500 dark:text-gray-300">MBTI: {userProfile.mbtiType.toUpperCase()}</p>
          )}
        </div>
        <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-300">
  <Link to={`/profile/${user.$id}/followers`} className="hover:underline">
    <span className="font-semibold no-underline">{followersCount}</span> Followers
  </Link>
  <Link to={`/profile/${user.$id}/following`} className="hover:underline">
    <span className="font-semibold">{followingCount}</span> Following
  </Link>
</div>


<div className="ml-auto flex flex-col sm:flex-row gap-2 sm:gap-x-2">
  <Link
    to="/edit-profile"
    className="flex items-center justify-center gap-1 bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg text-sm font-medium text-white"
  >
    <Pencil className="w-4 h-4" />
    
  </Link>
  <Link
    to="/post"
    className="flex items-center justify-center gap-1 bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg text-sm font-medium text-white"
  >
    <Send className="w-4 h-4" />
  
  </Link>
</div>

      </div>
      {userProfile?.bio && (
  <h2 className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
    {userProfile.bio}
  </h2>
)}


      {/* Stats */}
      <div className="mb-6">
        <h1 className="text-lg font-medium">Vibes: {vibes.length}</h1>
      </div>

      {/* Vibes List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vibes.map((vibe) => (
          <div key={vibe.$id} className="p-4 border dark:border-gray-700 rounded-lg">
            <p>{vibe.vibeText}</p>
            {vibe.imageUrl && (
        <img
          src={vibe.imageUrl}
          alt="vibe-img"
          className="mt-4 rounded-xl max-h-80 w-full border border-white/10"
        />
      )}
            <span className="text-sm text-gray-500">{new Date(vibe.$createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;
