import { storage, databases, IDUtils } from "../appwrite/config"; 
import { Query } from "appwrite";

export const uploadStory = async (file, userData) => {
  try {
    // Fetch user profile from your user profile collection
    const profileResponse = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID, // your profile collection ID
      [Query.equal("userId", userData.$id)]
    );

    const userProfile = profileResponse.documents[0]; // assuming one profile per user
    const profilePicUrl = userProfile?.profilePicUrl || "/default-avatar.png";

    // Upload media to Appwrite storage
    const uploadedFile = await storage.createFile(
      import.meta.env.VITE_APPWRITE_BUCKET_ID,
      IDUtils.unique(),
      file
    );

    const fileUrl = storage.getFileView(
      import.meta.env.VITE_APPWRITE_BUCKET_ID,
      uploadedFile.$id
    );

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Create story document with profile info
    const storyDoc = await databases.createDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_STORIES_COLLECTION_ID,
      IDUtils.unique(),
      {
        userId: userData.$id,
        mediaUrl: fileUrl,
        timestamp: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        username: userData.name || "Anonymous",
        profilePicUrl: profilePicUrl,
      }
    );

    return storyDoc;
  } catch (error) {
    console.error("Error uploading story:", error);
    throw error;
  }
};
