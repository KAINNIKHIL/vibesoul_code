// src/components/SearchBar.jsx
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { databases } from "../appwrite/config"; 
import { Query } from "appwrite";
import { Link } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const fetchSuggestions = async (searchTerm) => {
    if (!searchTerm) return setSuggestions([]);

    try {
      setLoading(true);
      const res = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
        [Query.startsWith("username", searchTerm)]
      );
      setSuggestions(res.documents);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearTimeout(timeoutId);
    if (!query) return setSuggestions([]);

    const id = setTimeout(() => fetchSuggestions(query), 300);
    setTimeoutId(id);
  }, [query]);

  return (
    <div className="relative hidden md:block w-full max-w-xs mx-4">
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full py-2 pl-10 pr-4 rounded-md bg-gray-100 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
      <Search className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400 w-5 h-5" />

      {query && (
        <div className="absolute mt-1 w-full bg-white dark:bg-gray-900 shadow-lg rounded-md z-10 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">Loading...</div>
          ) : suggestions.length === 0 ? (
            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">No results found</div>
          ) : (
            suggestions.map((user) => (
              <Link
                to={`/profile/${user.userId}`}
                key={user.$id}
                className="block px-4 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setQuery("")}
              >
               <div className="flex items-center space-x-3">
            <img
                src={user.profilePicUrl || "/default-avatar.png"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
            />
            <span className="font-semibold text-gray-800  dark:text-white">{user.username}</span>
            </div>

              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
