import React, { useEffect, useState } from "react";
import { databases, account } from "../appwrite/config";
import { Query } from "appwrite";
import { useNavigate } from "react-router-dom";


export default function ChatList() {
  const [chats, setChats] = useState([]);
  const [userId, setUserId] = useState("");
  const [users, setUsers] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    const getChats = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);

        // Fetch chats where the current user is a participant
        const response = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_CHATS_COLLECTION_ID,
          [Query.contains("participants", user.$id)]  // Ensure participants field exists
        );
        
        setChats(response.documents);

        // Fetch other users' details for chat participants
        const participantIds = response.documents.flatMap(chat => chat.participants);
        const uniqueUserIds = [...new Set(participantIds.filter(id => id !== user.$id))];

        // Fetch user info for the unique participant IDs
        const userInfoPromises = uniqueUserIds.map((id) =>
          // Adjust the query to search by the 'userId' field (instead of the document ID)
          databases.listDocuments(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
            [Query.equal("userId", id)]  // Use 'userId' as the field to search by
          )
        );

        const userInfoResponses = await Promise.all(userInfoPromises);

        // Log the user info responses to see what we are getting
        

        // Handle cases where user info might be missing or invalid
        const usersMap = userInfoResponses.reduce((acc, response, index) => {
          if (response.documents.length > 0) {
            const user = response.documents[0]; // Assuming only one document per userId
            acc[user.userId] = user;  // Use the user document's ID as the key
          } else {
            console.log(`No user found for ID ${uniqueUserIds[index]}`); // Log missing user
          }
          return acc;
        }, {});
        setUsers(usersMap);
        
      } catch (err) {
        console.error("Error fetching chats or user info", err);
      }
    };

    getChats();
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Log the users state to verify profilePicUrl
  

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white text-black dark:bg-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold mb-4">Chats</h2>
      <div className="space-y-4">
        {chats.length === 0 ? (
          <div className="flex items-center justify-center h-full py-4">
          <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        ) : (
          chats.map((chat) => {
            const otherUserId = chat.participants.find((id) => id !== userId);
            
            
            // Ensure we have the user data
            const otherUser = users[otherUserId];
            

            return (
              <div
                key={chat.$id}
                onClick={() => navigate(`/chat/${otherUserId}`)}
                className="flex items-center justify-between dark:bg-gray-800 bg-white p-3 rounded-xl shadow hover:bg-gray-700 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={otherUser?.profilePicUrl}
                    alt={otherUserId}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{otherUser?.username || otherUserId}</h3>
                    <p className="text-sm text-gray-500">{chat.lastMessage}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {formatTimestamp(chat.timestamp)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
