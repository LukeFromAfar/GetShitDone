import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, CalendarIcon, Star } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function TaskInput({ onTaskAdded }) {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString(); // Use full ISO string for proper date handling
  };

  const getTaskDefaults = () => {
    const pathname = location.pathname;
    
    // Set default properties based on current route
    switch (pathname) {
      case '/my-day':
        return { 
          dueDate: getCurrentDate(),
          important: false,
        };
      case '/important':
        return { 
          important: true,
          dueDate: null,
        };
      case '/planned':
        return { 
          dueDate: getCurrentDate(),
          important: false,
        };
      default: // all-tasks and any other route
        return { 
          dueDate: null,
          important: false,
        };
    }
  };

  const getPlaceholder = () => {
    const pathname = location.pathname;
    
    switch (pathname) {
      case '/my-day':
        return "Add a task for today...";
      case '/important':
        return "Add an important task...";
      case '/planned':
        return "Add a planned task...";
      default:
        return "Add a task...";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !user) return;
    
    try {
      setIsLoading(true);
      
      const taskData = {
        title: title.trim(),
        note: "", // Explicitly set empty note
        ...getTaskDefaults(),
      };
      
      const response = await axios.post('/api/note', taskData, {
        withCredentials: true
      });

      setTitle('');
      
      // Call the callback function to update the parent component
      if (onTaskAdded && typeof onTaskAdded === 'function') {
        onTaskAdded(response.data.note);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: Show different UI for different routes
  const renderRouteSpecificElements = () => {
    const pathname = location.pathname;
    
    switch (pathname) {
      case '/my-day':
        return <CalendarIcon className="h-5 w-5 text-blue-400" />;
      case '/important':
        return <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />;
      case '/planned':
        return <CalendarIcon className="h-5 w-5 text-green-400" />;
      default:
        return null;
    }
  };

  if (!user) return null; // Don't show input if user is not logged in

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg p-3">
      <form onSubmit={handleSubmit} className="flex items-center">
        <button 
          type="submit" 
          className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          disabled={isLoading || !title.trim()}
        >
          <Plus className="h-6 w-6" />
        </button>
        
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={getPlaceholder()}
          className="flex-grow px-4 py-2 bg-gray-800 text-white outline-none"
          disabled={isLoading}
        />
        
        {renderRouteSpecificElements()}
      </form>
    </div>
  );
}