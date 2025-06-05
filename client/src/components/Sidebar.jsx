import React, { useState } from "react";

const Sidebar = ({ activeComponent, setActiveComponent }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [logoHovered, setLogoHovered] = useState(false);

  const menuItems = [ 
     {
      id: "newsfeed",
      name: "NewsFeed",
      icon: "📰",
    },
    {
      id: "dashboard",
      name: "Dashboard",
      icon: "🏠",
    },
    {
      id: "chat",
      name: "Chat",
      icon: "💬",
    },
    {
      id: "create-post",
      name: "Create Post",
      icon: "➕",
    },
    {
      id: "posts",
      name: "Posts",
      icon: "📄",
    },
    {
      id: "recognition",
      name: "Recognition",
      icon: "🏆",
    },
    {
      id: "events",
      name: "Events",
      icon: "📅",
    },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-100 shadow-sm" style={{marginTop: "10px",marginLeft: "6px"}}>
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-50">
        <div
          className="flex items-center space-x-3 cursor-pointer group ml-2"
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
        >
          <div
            className={`w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center transition-all duration-200 ${
              logoHovered ? "scale-105 shadow-md" : ""
            }`}
          >
            <span className="text-white font-semibold text-sm">H </span>
          </div>
          <div>
            <span
              className={`text-lg font-bold text-gray-800 transition-colors duration-200 ${
                logoHovered ? "text-blue-600" : ""
              }`}
            >
              <pre> HRMS</pre>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="px-2" style={{ marginTop: "20px", marginLeft: "10px"}}>
        <ul>
          {menuItems.map((item, index) => (
            <li key={item.id} style={{ marginTop: index > 0 ? "10px" : "0" }}>
              <button
                onClick={() => setActiveComponent(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${
                  activeComponent === item.id
                    ? "bg-blue-50 text-blue-600 border-l-3 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span
                  className={`text-lg transition-all duration-200 ${
                    hoveredItem === item.id ? "scale-110" : ""
                  } ${
                    activeComponent === item.id
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium flex-1">{item.name}</span>

                {/* Active indicator */}
                {activeComponent === item.id && (
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
