import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Chat from "./components/Chat";
import CreatePost from "./components/CreatePost";
import Posts from "./components/Posts";
import Recognition from "./components/Recognition";
import Events from "./components/Events";
import Login from "./components/Login";
import Register from "./components/Register";
import axios from "axios";
// import "./App.css"; // Removed to avoid conflicts with Tailwind CSS

function App() {
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loadUser = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/isvalidUser",
        { withCredentials: true }
      );
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {}
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveComponent("dashboard");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <Dashboard user={user} onLogout={handleLogout} />;
      case "chat":
        return <Chat user={user} />;
      case "create-post":
        return <CreatePost  user={user} />;
      case "posts":
        return <Posts user={user} />;
      case "leaderboard":
        return <Recognition />;
      case "events":
        return <Events />;
      default:
        return <Dashboard user={user} onLogout={handleLogout} />;
    }
  };

  const handleComponentChange = (componentId) => {
    setActiveComponent(componentId);
    closeMobileMenu(); // Close mobile menu when navigating
  };

  // Show login/register if user is not authenticated
  if (!user) {
    if (authMode === "login") {
      return (
        <Login
          onLogin={handleLogin}
          setAuthMode={setAuthMode}
          setUser={setUser}
        />
      );
    } else {
      return <Register onRegister={handleRegister} setAuthMode={setAuthMode} />;
    }
  }

  // Show main app if user is authenticated
  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
        </div>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        transition-transform duration-300 ease-in-out
        w-64 bg-white shadow-lg z-50 lg:z-auto
        h-full lg:flex-shrink-0
      `}>
        <Sidebar
          activeComponent={activeComponent}
          setActiveComponent={handleComponentChange}
          user={user}
          onLogout={handleLogout}
          setUser={setUser}
          isMobile={true}
          closeMobileMenu={closeMobileMenu}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 lg:ml-0">
        <div className="lg:hidden h-16"></div> {/* Spacer for mobile menu button */}
        {renderComponent()}
      </div>
    </div>
  );
}

export default App;
