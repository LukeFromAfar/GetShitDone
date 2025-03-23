import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, CalendarIcon, Star } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function TaskInput({ onTaskAdded }) {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { pathname } = location;
  const { user } = useAuth();
  const inputRef = useRef(null);
  
  // Focus the input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [pathname]); // Re-focus when changing routes
  
  // Global keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if user is typing in another input, textarea, or contentEditable element
      if (
        document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA' || 
        document.activeElement.isContentEditable ||
        document.activeElement.classList.contains('search-input') // Skip if focused on search
      ) {
        return;
      }
      
      // Skip for modifier keys and special keys
      const isModifierKey = e.ctrlKey || e.metaKey || e.altKey;
      const isSpecialKey = ['Tab', 'Enter', 'Escape', 'Backspace', 'Delete', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key);
      const isArrowKey = e.key.startsWith('Arrow');
      const isFunctionKey = e.key.startsWith('F') && e.key.length > 1; // F1-F12
      
      // Only intercept alphanumeric keys and common punctuation
      if (!isModifierKey && !isSpecialKey && !isArrowKey && !isFunctionKey && e.key.length === 1) {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString();
  };
  
  const getTaskDefaults = () => {
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
      
      // Refocus the input after submission for quick consecutive tasks
      if (inputRef.current) {
        inputRef.current.focus();
      }
      
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
    <div className="w-full max-w-3xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-2 sm:p-3">
      <form onSubmit={handleSubmit} className="flex items-center">
        <button 
          type="submit" 
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-700/70 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          disabled={isLoading || !title.trim()}
        >
          <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={getPlaceholder()}
          className="flex-grow px-2 sm:px-4 py-1.5 sm:py-2 bg-transparent text-white text-sm sm:text-base outline-none"
          disabled={isLoading}
        />
        
        {renderRouteSpecificElements()}
      </form>
    </div>
  );
}