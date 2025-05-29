import React, { useState, useRef } from "react";
import { uploadStory } from "../lib/uploadStory";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";

const StoryUploader = ({ currentUser }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    try {
      setUploading(true);
      await uploadStory(file, currentUser);
      toast.success("Story updated!");
      
        setPreview(null);
      
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed to update story");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center group cursor-pointer">
      <div
        onClick={() => fileInputRef.current.click()}
        className="relative w-16 h-16 rounded-full border-2 border-gray-300 hover:border-pink-500 transition"
      >
        {preview ? (
  <img
    src={preview}
    className="w-full h-full object-cover rounded-full"
    alt="Your Story"
  />
) : (
  <div className="w-full h-full rounded-full " />
)}
        <div className="absolute bottom-0 right-0 bg-pink-600 text-white rounded-full p-1 text-xs">
          <Plus size={14} />
        </div>
      </div>
      <span className="text-xs mt-1 text-white group-hover:text-pink-400">
        Your Story
      </span>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default StoryUploader;
