import { useState } from 'react';  // Removed useRef since we won't need it
import { Star, Calendar, Check } from 'lucide-react';
import axios from 'axios';
import ding1Sound from '../assets/sounds/ding1.mp3';

export default function TaskItem({ task, onTaskClick, onTaskUpdated }) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to play sound that creates a new Audio instance each time
  const playSound = () => {
    const audio = new Audio(ding1Sound);
    audio.volume = 0.7; // Adjust volume (0.0 to 1.0)
    
    // Play and handle any errors
    audio.play().catch(err => console.error("Error playing sound:", err));
    
    // Clean up when done playing to avoid memory leaks
    audio.onended = () => {
      audio.src = "";
      audio.remove();
    };
  };
  
  const handleCheckboxClick = async (e) => {
    e.stopPropagation(); // Prevent opening task details
    
    try {
      setIsLoading(true);
      const updatedTask = { ...task, completed: !task.completed };
      
      // Play sound when marking as complete (but not when marking as incomplete)
      if (!task.completed) {
        playSound();
      }
      
      await axios.put(`/api/note/${task._id}`, updatedTask, {
        withCredentials: true
      });
      
      if (onTaskUpdated) onTaskUpdated(updatedTask);
    } catch (error) {
      console.error('Error updating task completion:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const isPastDue = (dateString) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return dueDate < today;
  };

  return (
    <div 
      className={`p-4 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/60 rounded-lg shadow-md mb-2 flex items-center cursor-pointer transition-all ${
        task.completed ? 'bg-gray-600/20 backdrop-blur-lg' : ''
      }`}
      onClick={() => onTaskClick(task)}
    >
      <button
        onClick={handleCheckboxClick}
        className={`mr-4 w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
          task.completed 
            ? 'bg-blue-500 border-blue-500 text-white' 
            : 'border-gray-500 hover:border-gray-300'
        }`}
        disabled={isLoading}
        aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        {task.completed && <Check className="h-4 w-4" />}
      </button>
      
      <div className="flex-grow">
        <h3 className={`text-lg text-white ${task.completed ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </h3>
        
        {task.note && (
          <p className="text-sm text-gray-400 mt-1 line-clamp-1">
            {task.note}
          </p>
        )}
        
        <div className="flex items-center mt-2">
          {task.important && (
            <span className="mr-3">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </span>
          )}
          
          {task.dueDate && (
            <div 
              className={`flex items-center text-sm ${
                isPastDue(task.dueDate) 
                  ? 'text-red-500 line-through' 
                  : 'text-gray-400'
              }`}
            >
              <Calendar size={14} className="mr-1" />
              {formatDate(task.dueDate)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}