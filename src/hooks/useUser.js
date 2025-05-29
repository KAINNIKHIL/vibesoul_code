import { useEffect, useState } from "react";
import { account } from "../appwrite/config"; 
import UserProfile from "../../src/pages/Profile.jsx";

export const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, UserProfile, loading };
};
