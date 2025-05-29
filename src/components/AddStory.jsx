import React, { useState } from "react";
import { uploadStory } from "../lib/uploadStory"; 
import { useUser } from "../hooks/useUser";

const AddStory = () => {
  const { user, loading } = useUser();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    try {
      await uploadStory(file, user);
      alert("Story uploaded!");
      setFile(null);
    } catch (error) {
      alert("Failed to upload story.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p>Loading user...</p>;

  return (
    <div className="p-4 bg-gray-800 rounded-xl text-white flex flex-col gap-3 items-start">
      <label className="text-sm">Add to Story:</label>
      <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-pink-500 px-4 py-1 rounded-md text-sm disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default AddStory;
