import React, { useState } from "react";
import { databases, storage, IDUtils, account } from "../appwrite/config";

const PostVibe = () => {
  const [vibe, setVibe] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await account.get();
      let imageUrl = "";

      if (image) {
        const uploadedFile = await storage.createFile(
          import.meta.env.VITE_APPWRITE_BUCKET_ID,
          IDUtils.unique(),
          image
        );

        imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${import.meta.env.VITE_APPWRITE_BUCKET_ID}/files/${uploadedFile.$id}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}`;
      }

      await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COLLECTION_ID,
        IDUtils.unique(),
        {
          userId: user.$id,
          vibeText: vibe,
          imageUrl: imageUrl,
          createdAt: new Date().toISOString()
        }
      );

      alert("Vibe posted! 🚀");
      setVibe("");
      setImage(null);
    } catch (err) {
      console.error("Error posting vibe 💔", err);
      alert("Something went wrong...");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl  mx-auto px-4 min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">✨ Share Your Vibe</h2>

        <textarea
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
          rows="4"
          placeholder="What's on your soul today?"
          className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Add an image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-xl transition"
        >
          {loading ? "Posting..." : "🚀 Post Vibe"}
        </button>
      </form>
    </div>
  );
};

export default PostVibe;
