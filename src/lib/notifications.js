import { IDUtils as ID, databases as db} from "../appwrite/config";
import  client  from "../appwrite/config"; // or wherever your Appwrite config lives

//const db = new databases(client);

const NOTIF_COLLECTION_ID = import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

export const createLikeNotification = async (receiverId, senderId, vibeId) => {
  if (receiverId === senderId) return; // Skip self-notification

  try {
    await db.createDocument(
      DATABASE_ID,
      NOTIF_COLLECTION_ID,
      ID.unique(),
      {
        receiverId,
        senderId,
        type: "like",
        vibeId,
        isRead: false,
        timestamp: new Date().toISOString()
      }
    );
  } catch (err) {
    console.error("Error creating like notification:", err);
  }
};


export const createFollowNotification = async (receiverId, senderId) => {
    if (receiverId === senderId) return; // Skip self-notification
  
    try {
      await db.createDocument(
        DATABASE_ID,
        NOTIF_COLLECTION_ID,
        ID.unique(),
        {
          receiverId,
          senderId,
          type: "follow",
          isRead: false,
          timestamp: new Date().toISOString()
        }
      );
    } catch (err) {
      console.error("Error creating follow notification:", err);
    }
  };

  
  export const createCommentNotification = async (receiverId, senderId, vibeId) => {
    if (receiverId === senderId) return; // Skip self-notification
  
    try {
      await db.createDocument(
        DATABASE_ID,
        NOTIF_COLLECTION_ID,
        ID.unique(),
        {
          receiverId,
          senderId,
          type: "comment",
          vibeId,
          isRead: false,
          timestamp: new Date().toISOString()
        }
      );
    } catch (err) {
      console.error("Error creating comment notification:", err);
    }
  };
  
