import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { databases } from "../appwrite/config";
import { Query } from "appwrite";

const FollowerList = () => {
  const { userId } = useParams();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        //  Get all documents where this user is being followed
        const followRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_FOLLOW_COLLECTION_ID,
          [Query.equal("followingId", userId)]
        );

        const followerIds = followRes.documents.map(doc => doc.followerId);

        //  Fetch user profiles of all followers
        if (followerIds.length > 0) {
        const profileRes = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
          [Query.contains("userId", followerIds)]
        );

        setFollowers(profileRes.documents);
      } else{
        setFollowers([]); // No followers found
      }
    }
        catch (err) {
        console.error("Failed to fetch followers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId]);

  if (loading) return <div className="flex items-center justify-center h-full py-4">
  <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
</div>;

  if (followers.length === 0) return <p className="text-center">No followers yet.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Followers</h1>
      <ul className="space-y-4">
        {followers.map((follower) => (
          <li key={follower.$id} className="flex items-center gap-4 border p-3 rounded-lg dark:border-gray-700">
            <img
              src={follower.profilePicUrl || "/default-avatar.png"}
              alt="Follower"
              className="w-12 h-12 rounded-full object-cover border"
            />
            <div>
              <Link to={`/profile/${follower.userId}`} className="font-medium hover:underline">
                {follower.username || "VibeSoul User"}
              </Link>
              {follower.mbtiType && (
                <p className="text-sm text-gray-500">MBTI: {follower.mbtiType.toUpperCase()}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FollowerList;
