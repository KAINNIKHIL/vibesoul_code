import { useEffect, useState } from "react";
import client, { databases as db } from "../appwrite/config";
import { Query } from "appwrite";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const notifCollection = import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID;

const NotificationBell = ({ currentUserId }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await db.listDocuments(
          databaseId,
          notifCollection,
          [
            Query.equal("receiverId", currentUserId),
            Query.orderDesc("timestamp"),
            Query.limit(10),
          ]
        );
        const notifs = res.documents;
        setNotifications(notifs);

        const senderIds = [...new Set(notifs.map((n) => n.senderId))];

        // Fetch user profiles individually
        const userResponses = await Promise.all(
          senderIds.map((senderId) =>
            db.listDocuments(
              databaseId,
              import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
              [Query.equal("userId", senderId)]
            ).then((res) => res.documents[0])
          )
        );

        const userMapTemp = {};
        userResponses.forEach((user) => {
          if (user) {
            userMapTemp[user.userId] = user.username || user.email;
          }
        });

        setUserMap(userMapTemp);
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };

    if (currentUserId) fetchNotifications();
  }, [currentUserId]);

  const markAsRead = async (notifId) => {
    try {
      await db.updateDocument(databaseId, notifCollection, notifId, {
        isRead: true,
      });

      setNotifications((prev) =>
        prev.map((n) => (n.$id === notifId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        <Bell className="w-6 h-6" />
        {notifications.some((n) => !n.isRead) && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 dark:bg-gray-900 bg-white shadow-lg rounded-xl z-50 p-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications</p>
          ) : (
            notifications.map((notif) => {
              console.log("Notification data:", notif);

              const senderName = userMap[notif.senderId] || "Someone";
              let message = "";

              if (notif.type === "like") {
                message = `❤️ ${senderName} liked your vibe`;
              } else if (notif.type === "comment") {
                message = `💬 ${senderName} commented on your vibe`;
              } else if (notif.type === "follow") {
                message = `👥 ${senderName} started following you`;
              } else {
                message = `🔔 ${senderName} sent you a notification`;
              }

              if (notif.type === "follow") {
                return (
                  <div
                    key={notif.$id}
                    onClick={() => markAsRead(notif.$id)}
                    className="block text-sm py-2 px-3 hover:bg-gray-800 rounded cursor-pointer"
                  >
                    {message}
                  </div>
                );
              }

              return (
                <div
                  key={notif.$id}
                  to={`/vibe/${notif.vibeId}`}
                  onClick={() => markAsRead(notif.$id)}
                  className="block text-sm py-2 px-3 hover:bg-gray-800 rounded"
                >
                  {message}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
