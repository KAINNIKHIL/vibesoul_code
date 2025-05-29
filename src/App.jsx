import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/auth/PrivateRoute.jsx";
import PostVibe from "./pages/PostVibe";
import Feed from "./pages/Feed";
import UserProfile from "./pages/Profile.jsx";
import EditProfile from './pages/EditProfile';
import PublicProfile from "./pages/PublicProfile.jsx";
import FollowerList from "./pages/FollowerList";
import FollowingList from "./pages/FollowingList";
import Chat from "./pages/Chat";
import MBTITest from "./pages/MBTItest";
import ChatList from "./pages/ChatList";

import { useTheme } from "./context/ThemeContext";

function AppContent() {
  const { isDark } = useTheme();
  const location = useLocation();
  const hideNavbarRoutes = ["/", "/signup"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      

      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDark ? "bg-[#0f0f0f] text-white" : "bg-gray-150 text-gray-900"
        }`}
      >
        {!shouldHideNavbar && <Navbar  />}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/post" element={<PrivateRoute><PostVibe /></PrivateRoute>} />
          <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path="/edit-profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
          <Route path="/profile/:userId" element={<PublicProfile />} />
          <Route path="/profile/:userId/followers" element={<FollowerList />} />
          <Route path="/profile/:userId/following" element={<FollowingList />} />
          <Route path="/chat/:otherUserId" element={<Chat />} />
          <Route path="/mbti-test" element={<MBTITest />} />
          <Route path="/chatlist" element={<PrivateRoute><ChatList /></PrivateRoute>} />
        </Routes>

        <ToastContainer />
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
