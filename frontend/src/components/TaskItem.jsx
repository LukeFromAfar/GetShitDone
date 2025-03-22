import { useState } from 'react';
import { Star, Calendar, Check } from 'lucide-react';
import axios from 'axios';

export default function TaskItem({ task, onTaskClick, onTaskUpdated }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCheckboxClick = async (e) => {
    e.stopPropagation(); // Prevent opening task details
    
    try {
      setIsLoading(true);
      const updatedTask = { ...task, completed: !task.completed };
      
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

  return (
    <div 
      className={`p-4 bg-gray-800 hover:bg-gray-700 rounded-lg shadow-md mb-2 flex items-center cursor-pointer transition-all ${
        task.completed ? 'opacity-60' : ''
      }`}
      onClick={() => onTaskClick(task)}
    >
      <button
        onClick={handleCheckboxClick}
        className={`mr-4 w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
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
        
        <div className="flex items-center mt-2 text-sm text-gray-400">
          {task.dueDate && (
            <div className="flex items-center mr-4">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
          {task.important && (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          )}
        </div>
      </div>
    </div>
  );
}