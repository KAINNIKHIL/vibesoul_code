import React, {  useEffect,useState } from "react";
import { account, databases, IDUtils } from "../appwrite/config";
import { useNavigate } from "react-router-dom";
import { Query } from "appwrite";
import { toast } from 'react-toastify';
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loggedIn, setLoggedIn] = useState(false); // New state
  const navigate = useNavigate();

  // On mount, check session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await account.get();
        console.log("User already logged in:", user);
        setLoggedIn(true); // Set session state
        navigate("/feed");
      } catch {
         console.log("❌ Not logged in or session broken");
    await account.deleteSessions().catch(() => {}); // Clean up broken session
    navigate("/login");
      }
    };
    checkSession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loggedIn) {
      toast.info("You're already logged in!");
      return navigate("/feed");
    }

    try {
      //  Only runs if no session
      await account.createEmailPasswordSession(email, pass);
      const user = await account.get();
      const userId = user.$id;

      const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      if (response.total === 0) {
        await databases.createDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERPROFILES_COLLECTION_ID,
          IDUtils.unique(),
          {
            userId: userId,
            email: user.email,
            username: user.name,
            mbtiType: "",
            profilePicUrl: "",
            createdAt: new Date().toISOString(),
          }
        );
        console.log("User profile created ");
      } else {
        console.log("User profile already exists");
      }

      toast.success("Login successful!");
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
