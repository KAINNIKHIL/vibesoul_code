import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import client,{ databases, account } from "../appwrite/config";
import { Query, ID } from "appwrite";
import { ArrowLeft } from "lucide-react";

const Chat = () => {
  const { otherUserId } = useParams(); // chat/:otherUserId
  const [currentUserId, setCurrentUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [receiverProfile, setReceiverProfile] = useState(null);
  const { chatId } = useParams();


  useEffect(() => {
    const fetchReceiverProfile = async () => {
      const res = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
        [Query.equal("userId", otherUserId)]
      );
      
      if (res.documents.length > 0) {
        setReceiverProfile(res.documents[0]);
      } else {
        console.error("No profile found for user:", otherUserId);
      }
      
    };
  
    if (otherUserId) {
      fetchReceiverProfile();
    }
  }, [otherUserId]);
  
  // Fetch current user
  useEffect(() => {
    account.get().then((user) => setCurrentUserId(user.$id));
  }, []);

  useEffect(() => {
    if (!otherUserId) return;
  
    const unsubscribe = client.subscribe(
      `databases.${import.meta.env.VITE_APPWRITE_DATABASE_ID}.collections.typingStatus.documents.${otherUserId}`,
      (response) => {
        if (response.payload?.isTyping !== undefined) {
          setIsOtherUserTyping(response.payload.isTyping);
        }
      }
    );
  
    return () => unsubscribe();
  }, [otherUserId]);

  useEffect(() => {
    const initTypingDoc = async () => {
      if (!currentUserId) return;
      try {
        await databases.getDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_TYPING_COLLECTION_ID,
          currentUserId
        );
      } catch (err) {
        if (err.code === 404) {
          try {
            await databases.createDocument(
              import.meta.env.VITE_APPWRITE_DATABASE_ID,
              import.meta.env.VITE_APPWRITE_TYPING_COLLECTION_ID,
              currentUserId,
              {
              userId: currentUserId,
              chatWith: otherUserId,
              isTyping: false }
            );
          } catch (err2) {
            console.error("Couldn't create typing doc:", err2);
          }
        }
      }
    };
  
    initTypingDoc();
  }, [currentUserId]);
  


  // Fetch messages between 2 users
  useEffect(() => {
    if (!currentUserId || !otherUserId) return;
  
    // Fetch messages initially
    const fetchMessages = async () => {
      const res = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID,
        [
          Query.or([
            Query.and([
              Query.equal("senderId", currentUserId),
              Query.equal("receiverId", otherUserId),
            ]),
            Query.and([
              Query.equal("senderId", otherUserId),
              Query.equal("receiverId", currentUserId),
            ]),
          ]),
          Query.orderAsc("timestamp"),
        ]
      );
      setMessages(res.documents);

      // After fetching messages
const unreadMessages = res.documents.filter(
  (msg) => msg.senderId === otherUserId && msg.receiverId === currentUserId && !msg.isRead
);

// Update all unread messages to isRead: true
for (const msg of unreadMessages) {
  await databases.updateDocument(
    import.meta.env.VITE_APPWRITE_DATABASE_ID,
    import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID,
    msg.$id,
    { isRead: true }
  );
}

    };
  
    fetchMessages();
  
    // Set up real-time subscription for new messages
    const unsubscribe = client.subscribe(
      `databases.${import.meta.env.VITE_APPWRITE_DATABASE_ID}.collections.${import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID}.documents`,
      (response) => {
        const msg = response.payload;
  
        const isRelevant =
          (msg.senderId === currentUserId && msg.receiverId === otherUserId) ||
          (msg.senderId === otherUserId && msg.receiverId === currentUserId);
  
        // Add new message if relevant
        if (isRelevant && response.events.includes("databases.*.collections.*.documents.*.create")) {
          setMessages((prev) => [...prev, msg]);
        }
  
        // Handle updates to existing messages
        if (isRelevant && response.events.includes("databases.*.collections.*.documents.*.update")) {
          setMessages((prev) =>
            prev.map((m) => (m.$id === msg.$id ? { ...m, ...msg } : m))
          );
        }
        
      }
    );
  
    // Cleanup on unmount
    return () => unsubscribe();
  }, [currentUserId, otherUserId]); // This ensures the effect only runs when these values change
  

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
  
    const messageData = {
      senderId: currentUserId,
      receiverId: otherUserId,
      messageText: newMsg,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
  
    try {
      // Send the new message to the messages collection
      const messageResponse = await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID,
        ID.unique(),
        messageData
      );
  
      // Check if a chat already exists between the currentUser and otherUser
      const chatResponse = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_CHATS_COLLECTION_ID,
        [
          Query.contains("participants", currentUserId),
          Query.contains("participants", otherUserId),
        ]
      );
  
      // If no chat exists, create a new chat
      if (chatResponse.documents.length === 0) {
        const newChatData = {
          participants: [currentUserId, otherUserId],
          lastMessage: newMsg,
          timestamp: messageData.timestamp,
       //   messages: [messageData], // Add the first message to the chat
        };
  
        await databases.createDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_CHATS_COLLECTION_ID,
          ID.unique(),
          newChatData
        );
      } else {
        // If the chat exists, update the chat document with the last message and timestamp
        const chatId = chatResponse.documents[0].$id;
        const updatedChatData = {
          lastMessage: newMsg,
          timestamp: messageData.timestamp,
          messages: [...chatResponse.documents[0].messages, messageData], // Add new message to the chat
        };
  
        await databases.updateDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_CHATS_COLLECTION_ID,
          chatId,
          updatedChatData
        );
      }
  
      // Clear the message input after sending
      setNewMsg("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const handleTyping = (e) => {
    setNewMsg(e.target.value);
  
    if (!currentUserId) return;
  
    updateTypingStatus(true); // Use safe function
  
    clearTimeout(typingTimeoutRef.current);
  
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false); // Safe here too
    }, 2000);
  };
  
  const updateTypingStatus = useCallback(async (status) => {
    try {
      await databases.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_TYPING_COLLECTION_ID,
        currentUserId,
        { isTyping: status }
      );
    } catch (err) {
      if (err.code === 404) {
        try {
          await databases.createDocument(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_TYPING_COLLECTION_ID,
            currentUserId,
            {
              userId: currentUserId,
              chatWith: otherUserId,
               isTyping: status }
          );
        } catch (creationError) {
          console.error("Error creating typing status doc:", creationError);
        }
      } else {
        console.error("Error updating typing status:", err);
      }
    }
  }, [currentUserId]);
  
  
const messagesEndRef = useRef(null);
useEffect(() => {
  return () => {
    if (currentUserId) {
      updateTypingStatus(false);
    }
  };
}, [currentUserId, updateTypingStatus]);


  

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
  
return (
  <>
    {receiverProfile && (
      <div className="max-w-3xl mx-auto px-4 sticky top-0 z-10 bg-white dark:bg-gray-800 flex items-center space-x-4 p-4">
        <Link to="/chatlist" className="text-pink-600 hover:text-pink-800">
        <ArrowLeft className="w-6 h-6" />
        </Link>
        <Link
          to={`/profile/${receiverProfile.userId}`}
          className="flex items-center space-x-4"
        >
          <img
            src={receiverProfile.profilePicUrl || "/default-avatar.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="text-lg font-medium text-gray-900 dark:text-white">
            {receiverProfile.username || receiverProfile.email}
          </div>
        </Link>
      </div>
    )}

    <div className="max-w-3xl mx-auto px-4 bg-white text-black dark:bg-gray-900 dark:text-white p-6 space-y-6">
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-5">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl max-w-xs ${
              msg.senderId === currentUserId
                ? "bg-pink-500 text-white ml-auto"
                : "bg-gray-300 dark:bg-gray-600 text-black dark:text-white"
            }`}
          >
            {msg.messageText}
            {msg.senderId === currentUserId && msg.isRead && (
              <span className="text-xs text-white ml-2">✔</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="max-w-3xl mx-auto flex gap-2 mt-4 fixed bg-white dark:bg-gray-800 bottom-0 left-0 right-0 z-10 px-4 py-3 rounded-none w-full">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMsg}
          onChange={handleTyping}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          className="flex-1 p-2 rounded-lg border dark:bg-gray-900 dark:text-white"
        />
        <button
          onClick={sendMessage}
          className="sticky top-99 z-10 bg-pink-600 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  </>
)};



export default Chat;
