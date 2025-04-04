import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";

// Import all background images
import myDayImage from "../assets/images/my-day.jpg";
import importantImage from "../assets/images/important.jpg";
import plannedImage from "../assets/images/planned.jpg";
import calendarImage from "../assets/images/planned.jpg";
import allTasksImage from "../assets/images/all-tasks.jpg";
import userImage from "../assets/images/user.jpg"; 
import authImage from "../assets/images/auth.jpg"; // Import auth image

export default function Layout() {
  const location = useLocation();
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {
    // Set background based on current route
    switch (location.pathname) {
      case "/my-day":
        setBackgroundImage(myDayImage);
        break;
      case "/important":
        setBackgroundImage(importantImage);
        break;
      case "/planned":
        setBackgroundImage(plannedImage);
        break;
      case "/calendar": // Add this case
        setBackgroundImage(calendarImage);
        break;
      case "/all-tasks":
        setBackgroundImage(allTasksImage);
        break;
      case "/user":
        setBackgroundImage(userImage);
        break;
      case "/login":
      case "/register":
        setBackgroundImage(authImage);
        break;
      default:
        setBackgroundImage(null);
        break;
    }
  }, [location.pathname]);

  // Check if we're on an auth page
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="flex h-screen">
      {/* Only show sidebar if not on auth pages */}
      {!isAuthPage && <Sidebar />}
      
      <div 
        className="flex flex-col flex-grow relative" 
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Semi-transparent overlay for better readability */}
        <div className={`absolute inset-0 ${isAuthPage ? 'bg-black/50' : 'bg-black/70'}`} />
        
        {/* Content */}
        <main className="flex-grow relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}