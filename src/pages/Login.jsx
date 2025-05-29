import React, { useState } from "react";
import { account, databases, IDUtils } from "../appwrite/config";
import { useNavigate } from "react-router-dom";
import { Query } from "appwrite";
import { toast } from 'react-toastify';
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      //Login
      await account.createEmailPasswordSession(email, pass);
      console.log("Logged in successfully");
  
      //Get user info
      const user = await account.get();
      const userId = user.$id;
  
      //Check if profile exists
      const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );
  
      if (response.total === 0) {
        //Create profile if not exists
        const dbId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID;

await databases.createDocument(
  dbId,
  collectionId,
  IDUtils.unique(),
  {
    userId: userId,
    email: user.email,
    username: user.name,
    mbtiType: "",
    profilePic: "",
    createdAt: new Date().toISOString(),
  }
);

        

        console.log("User profile created 📄");
      } else {
        console.log("User profile already exists");
      }
  
      navigate("/feed");
  
    } catch (err) {
      toast.error("Login failed: " + err.message);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500">
      <div className="backdrop-blur-md bg-white/30 p-8 rounded-2xl shadow-xl w-full max-w-sm border border-white/20">
        <h2 className="text-2xl font-bold text-center text-white">Login to VibeSoul</h2>
        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            type="submit"
            className="w-full bg-white text-purple-600 font-semibold py-2 rounded-xl hover:bg-purple-100 transition"
          >
            Login
          </button>
          <p className="text-sm text-center mt-4">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-indigo-600 underline hover:text-indigo-800">
              Create one
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Login;
