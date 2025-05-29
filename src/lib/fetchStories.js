import { databases } from "../appwrite/config";
import { Query } from "appwrite"; 


export const fetchActiveStories = async () => {
  const now = new Date().toISOString();
    
  try {
    const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID, 
        import.meta.env.VITE_APPWRITE_STORIES_COLLECTION_ID,          
      [Query.greaterThan("expiresAt", now)]
    );
    
    return response.documents;
  } catch (error) {
    console.error("Error fetching stories:", error);
    return [];
  }
};
