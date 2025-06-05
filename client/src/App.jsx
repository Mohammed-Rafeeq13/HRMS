import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Chat from "./components/Chat";
import CreatePost from "./components/CreatePost";
import Posts from "./components/Posts";
import Recognition from "./components/Recognition";
import Events from "./components/Events";
import NewsFeed from "./components/NewsFeed";
import "./App.css";

function App() {
  const [activeComponent, setActiveComponent] = useState("dashboard");

  const renderComponent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <Dashboard />;
      case "newsfeed":
        return <NewsFeed />;
      case "chat":
        return <Chat />;
      case "create-post":
        return <CreatePost />;
      case "posts":
        return <Posts />;
      case "recognition":
        return <Recognition />;
      case "events":
        return <Events />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
      />
      <div className="flex-1 overflow-auto">{renderComponent()}</div>
    </div>
  );
}

export default App;
