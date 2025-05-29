import { useEffect, useState } from "react";
import { account } from "../appwrite/config";

export const useUser = () => {
  const [user, setUser] = useState(null);       // Appwrite user object
  const [userId, setUserId] = useState(null);   // Just the userId
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
        setUserId(userData.$id); // ✅ store the user ID separately
      } catch (error) {
        setUser(null);
        setUserId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, userId, loading }; // 👈 return userId directly
};
