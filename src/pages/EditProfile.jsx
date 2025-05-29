import React, { useEffect, useState } from "react";
import { account, databases, storage, IDUtils as ID } from "../appwrite/config";
import { Query } from "appwrite";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';


const EditProfile = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [userDocId, setUserDocId] = useState(null);
  const [showMBTITest, setShowMBTITest] = useState(false);
  const navigate = useNavigate();
  const [mbti, setMbti] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    mbtiType: "",
    bio: "",
    profilePicUrl: "",
  });
  const [file, setFile] = useState(null);
   useEffect(() => {
      const getUser = async () => {
        try {
          const res = await account.get();
          setUser(res);
        } catch (error) {
          console.error("Not logged in 💔", error);
          navigate("/"); // redirect to login if not logged in
        }
      };
      getUser();
    }, []);
  
    const handleLogout = async () => {
      try {
        await account.deleteSession("current");
        toast.success("Logged out 🌙");
        navigate("/"); 
      } catch (err) {
        toast.error("Error logging out 💔");
      }
    };
  useEffect(() => {
    const fetchData = async () => {
      const userData = await account.get();
      setUser(userData);

      const profileRes = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
        [Query.equal("userId", userData.$id)]
      );

      if (profileRes.documents.length > 0) {
        const doc = profileRes.documents[0];
        setUserDocId(doc.$id);
        setFormData({
          username: doc.username || "",
          mbtiType: doc.mbtiType || "",
          bio: doc.bio || "",
          profilePicUrl: doc.profilePicUrl || "",
        });
      } const savedMbti = localStorage.getItem("mbtiResult");
      if (savedMbti) {
        setFormData((prev) => ({ ...prev, mbtiType: savedMbti }));
        localStorage.removeItem("mbtiResult"); 
      }
    
    };
    
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setIsUploading(true);

  try {
    const uploadedFile = await storage.createFile(
      import.meta.env.VITE_APPWRITE_BUCKET_ID,
      ID.unique(),
      file
    );

    const previewUrl = storage.getFileView(
      import.meta.env.VITE_APPWRITE_BUCKET_ID,
      uploadedFile.$id
    );

    // Save this in your form data for later DB update
    setFormData((prev) => ({
      ...prev,
      profilePicUrl: previewUrl,
    }));

    console.log("Uploaded and preview URL:", previewUrl);
  } catch (err) {
    console.error("Error uploading file:", err);
    toast.error("Failed to update profile ");
  }finally {
    setIsUploading(false); //  stop spinner
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();

  await databases.updateDocument(
    import.meta.env.VITE_APPWRITE_DATABASE_ID,
    import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
    userDocId,
    {
      username: formData.username,
      mbtiType: formData.mbtiType,
      bio: formData.bio,
      profilePicUrl: formData.profilePicUrl,
    }
  );
  toast.success("Profile updated!");
  navigate(`/profile`); 
};
useEffect(() => {
  const storedMBTI = localStorage.getItem("mbtiResult");
  if (storedMBTI) {
    setMbti(storedMBTI);
    localStorage.removeItem("mbtiResult"); 
  }
}, []);


  return (
    <div className="max-w-xl mx-auto mt-7 p-6 bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800"
          />
        </div>
        <div>
  <label className="block text-sm font-medium mb-1">MBTI Type</label>
  <div className="flex items-center gap-3">
    <input
      type="text"
      name="mbtiType"
      value={mbti || formData.mbtiType}
      onChange={(e) => {
        const value = e.target.value.toUpperCase().slice(0, 4);
        setFormData({ ...formData, mbtiType: value });
      }}
      placeholder="e.g., INFJ"
      className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800"
    />
    <button
      type="button"
      onClick={() => navigate("/mbti-test")}
      className="text-white bg-pink-600 hover:bg-pink-700 text-sm px-3 py-3 rounded shadow transition duration-200"
    >
      <b>Test</b>
    </button>
  </div>
</div>

        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Write something about yourself..."
          className="w-full mt-2 p-2 rounded border dark:bg-gray-800"
        />

        <div>
          <label className="block text-sm font-medium mb-1">Profile Picture</label>
          <input type="file" onChange={handleFileChange} />
          {isUploading && (
  <div className="text-sm text-indigo-600 animate-pulse">Uploading...</div>
)}

          {formData.profilePicUrl && (
            <img
              src={formData.profilePicUrl}
              alt="Profile"
              className="mt-2 w-20 h-20 rounded-full object-cover"
            />
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
        >
          Update
        </button>
        <button
      type="button"
      onClick={handleLogout}
      className="text-white bg-pink-600 hover:bg-pink-700 text-sm px-3 py-3 rounded shadow transition duration-200"
    >
      Logout
    </button>
    </div>
      </form>
    </div>
  );
};

export default EditProfile;
