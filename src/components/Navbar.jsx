import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun, Search, Home, MessageCircleMoreIcon, User } from "lucide-react";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell"; 
import { account } from "../appwrite/config";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { isDark, setIsDark } = useTheme();
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();
   const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await account.get();
        setCurrentUserId(user.$id);
      } catch (err) {
        console.error("Error getting user in Navbar", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <nav className="max-w-3xl mx-auto  px-4 flex justify-between items-center p-4 bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="flex items-center gap-1 text-xl font-bold text-pink-600">
  
  Vibe<span className="text-gray-200">Soul</span>
</div>
      {/* Search bar */}
      <div className="relative w-full px-2 max-w-full sm:max-w-xs sm:mx-4">
        <SearchBar />
      </div>
      
      
      <div className="flex items-center gap-4 ">
        <button onClick={() => navigate("/feed")} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
        {currentUserId && <Home />}</button>
        <button onClick={() => navigate("/chatlist")} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
        {currentUserId && <MessageCircleMoreIcon />}</button>
        {currentUserId && <NotificationBell currentUserId={currentUserId} />}
        <button onClick={() => navigate("/profile")} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
        {currentUserId && <User />}</button>
        <button
          onClick={() => setIsDark((prev) => !prev)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {isDark ? <Sun className="text-yellow-400" /> : <Moon className="text-white-100" />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
