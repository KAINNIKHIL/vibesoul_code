import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { databases } from "../appwrite/config";
import { Query } from "appwrite";

const FollowingList = () => {
  const { userId } = useParams();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        //  Get all documents where this user is the follower
        const followRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID,
          [Query.equal("followerId", userId)]
        );

        const followingIds = followRes.documents.map(doc => doc.followingId);

        //  Fetch user profiles of all users being followed
        if (followingIds.length > 0) {
        const profileRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
          [Query.contains("userId", followingIds)]
        );

        setFollowing(profileRes.documents);
      } else{
        setFollowing([]); // No following found
      }
    }
      catch (err) {
        console.error("Failed to fetch following list", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [userId]);

  if (loading) return <div className="flex items-center justify-center h-full py-4">
  <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
</div>;

  if (following.length === 0) return <p className="text-center">You’re not following anyone yet.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Following</h1>
      <ul className="space-y-4">
        {following.map((user) => (
          <li key={user.$id} className="flex items-center gap-4 border p-3 rounded-lg dark:border-gray-700">
            <img
              src={user.profilePicUrl || "/default-avatar.png"}
              alt="User"
              className="w-12 h-12 rounded-full object-cover border"
            />
            <div>
              <Link to={`/profile/${user.userId}`} className="font-medium hover:underline">
                {user.username || "VibeSoul User"}
              </Link>
              {user.mbtiType && (
                <p className="text-sm text-gray-500">MBTI: {user.mbtiType.toUpperCase()}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default FollowingList;