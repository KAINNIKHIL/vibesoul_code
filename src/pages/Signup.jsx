import React, { useState } from "react";
import { account } from "../appwrite/config";
import { ID } from "appwrite";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await account.create(ID.unique(), email, password, name);
      toast.success("Account created 🎉 Now login!");
      navigate("/");
    } catch (err) {
      toast.error("Signup failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 to-purple-800 text-white">
      <form onSubmit={handleSignup} className="bg-white/10 p-8 rounded-xl space-y-4 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-4">Create your VibeSoul 🌟</h2>
        
        <input
          type="text"
          placeholder="Your Name"
          className="w-full p-3 rounded bg-white/20 text-white placeholder-white focus:outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded bg-white/20 text-white placeholder-white focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-white/20 text-white placeholder-white focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full py-3 rounded bg-white text-purple-700 font-bold hover:bg-purple-100 transition"
        >
          Sign Up
        </button>
        <p className="text-center text-sm mt-4">
          Already have an account? <a href="/" className="underline">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
