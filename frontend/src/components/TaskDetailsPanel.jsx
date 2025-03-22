import { useState, useEffect } from 'react';
import { X, Star, Calendar, Trash2, Check, Edit, Save } from 'lucide-react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ding1Sound from '../assets/sounds/ding1.mp3';

export default function TaskDetailsPanel({ task, isOpen, onClose, onTaskUpdated, onTaskDeleted }) {
  // State for current task data and edited version
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [isImportant, setIsImportant] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  // Other state
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
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
  
  // Initialize local state whenever task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setContent(task.note || '');
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
      setIsImportant(task.important || false);
      setCompleted(task.completed || false);
      setEditMode(false); // Exit edit mode when task changes
    }
  }, [task]);
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    });
  };
  
  // Check if date is past due
  const isPastDue = (date) => {
    if (!date) return false;
    const dueDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return dueDate < today;
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      // If cancelling edit, reset to original values
      if (task) {
        setTitle(task.title || '');
        setContent(task.note || '');
        setDueDate(task.dueDate ? new Date(task.dueDate) : null);
        setIsImportant(task.important || false);
        setCompleted(task.completed || false);
      }
    }
    setEditMode(!editMode);
    setShowDatePicker(false);
  };
  
  // Similarly, update the toggleCompleted function
const toggleCompleted = async () => {
    // Store the previous state
    const wasCompleted = completed;
    
    // Toggle the state immediately for UI feedback
    setCompleted(!wasCompleted);
    
    // Play sound only when marking as complete
    if (!wasCompleted) {
      playSound();
    }
    
    // If not in edit mode, save immediately
    if (!editMode && task) {
      try {
        setIsLoading(true);
        
        const updatedTask = {
          ...task,
          completed: !wasCompleted
        };
        
        const response = await axios.put(`/api/note/${task._id}`, updatedTask, {
          withCredentials: true
        });
        
        // Check the structure of the response and extract the note data correctly
        const savedTask = response.data.note || response.data;
        
        if (onTaskUpdated) onTaskUpdated(savedTask);
      } catch (error) {
        console.error('Error updating task:', error);
        // Revert state on error
        setCompleted(wasCompleted);
      } finally {
        setIsLoading(false);
      }
    }
    // If in edit mode, just update the state - it will be saved on submit
  };
  
  // Toggle important flag (in edit mode only)
  const toggleImportant = () => {
    if (editMode) {
      setIsImportant(!isImportant);
    }
  };
  
  // Clear due date
  const clearDueDate = () => {
    setDueDate(null);
    setShowDatePicker(false);
  };
  
  // Save all changes
  const handleSaveChanges = async () => {
    if (!task) return;
    
    try {
      setIsLoading(true);
      
      const updatedTask = {
        ...task,
        title,
        note: content,
        dueDate: dueDate ? dueDate.toISOString() : null,
        important: isImportant,
        completed
      };
      
      const response = await axios.put(`/api/note/${task._id}`, updatedTask, {
        withCredentials: true
      });
      
        // Check the structure of the response and extract the note data correctly
        const savedTask = response.data.note || response.data;
        
        if (onTaskUpdated) onTaskUpdated(savedTask);
        setEditMode(false);
    } catch (error) {
        console.error('Error saving task:', error);
    } finally {
        setIsLoading(false);
    }
    };
    
  // Delete the task
  const handleDeleteTask = async () => {
    if (!task) return;
    
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      await axios.delete(`/api/note/${task._id}`, {
        withCredentials: true
      });
      
      if (onTaskDeleted) onTaskDeleted(task._id);
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
      // Could add an error notification here
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-gray-800 shadow-lg transform transition-transform duration-300 z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Task Details</h2>
        <div className="flex space-x-2">
          {editMode ? (
            <>
              <button
                onClick={handleSaveChanges}
                disabled={isLoading}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                aria-label="Save changes"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                ) : (
                  <Save size={20} />
                )}
              </button>
              <button
                onClick={toggleEditMode}
                disabled={isLoading}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                aria-label="Cancel editing"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleEditMode}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                aria-label="Edit task"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                aria-label="Close panel"
              >
                <X size={20} />
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Title */}
        <div className="mb-6">
          {editMode ? (
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Task title"
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className="flex items-center mb-4">
              <button
                onClick={toggleCompleted}
                disabled={isLoading}
                className={`mr-3 w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                  completed 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'border-gray-500 hover:border-gray-300'
                }`}
                aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
              >
                {completed && <Check className="h-4 w-4" />}
              </button>
              <h3 className={`text-xl font-medium ${completed ? 'line-through text-gray-400' : 'text-white'}`}>
                {title || 'Untitled Task'}
              </h3>
            </div>
          )}
        </div>
        
        {/* Due Date */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Calendar className="text-gray-400 mr-2" size={18} />
            <span className="text-sm font-medium text-gray-400">Due Date</span>
          </div>
          
          {editMode ? (
            <div className="relative">
                <div
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full text-left p-2 bg-gray-700 border border-gray-600 rounded text-white hover:bg-gray-600 transition-colors flex justify-between items-center cursor-pointer"
                >
                <span>{dueDate ? formatDate(dueDate) : 'No due date'}</span>
                {dueDate && (
                    <span
                    onClick={(e) => {
                        e.stopPropagation();
                        clearDueDate();
                    }}
                    className="text-gray-400 hover:text-red-400 cursor-pointer"
                    >
                    <X size={16} />
                    </span>
                )}
                </div>
                
                {showDatePicker && (
                <div className="absolute left-0 mt-1 z-10 bg-gray-700 shadow-lg rounded-md border border-gray-600">
                    <DatePicker
                    selected={dueDate}
                    onChange={(date) => {
                        setDueDate(date);
                        setShowDatePicker(false);
                    }}
                    inline
                    className="bg-gray-700 text-white"
                    />
                </div>
                )}
            </div>
            ) : (
            <div className={`p-2 ${isPastDue(dueDate) ? 'text-red-500 line-through' : 'text-white'}`}>
                {dueDate ? formatDate(dueDate) : 'No due date'}
            </div>
            )}
        </div>
        
        {/* Important Flag */}
        <div className="mb-4">
        <div 
            className={`flex items-center p-2 rounded ${
            editMode ? 'cursor-pointer hover:bg-gray-700' : ''
            }`}
            onClick={editMode ? toggleImportant : undefined}
        >
            <Star 
            className={`mr-2 ${
                isImportant 
                ? 'text-yellow-500 fill-yellow-500' 
                : 'text-gray-400'
            }`} 
            size={18} 
            />
            <span className="text-sm font-medium text-gray-400">Important</span>
            {/* Removed "Yes"/"No" text */}
        </div>
        </div>
        
        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
          {editMode ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white min-h-[200px] resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add notes..."
              disabled={isLoading}
            />
          ) : (
            <div className="p-2 bg-gray-700 rounded text-white min-h-[100px] whitespace-pre-wrap">
              {content || <span className="text-gray-500 italic">No notes</span>}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-700 p-4">
        <div className={`flex ${editMode ? 'justify-between' : 'justify-end'}`}>
            <button
            onClick={handleDeleteTask}
            disabled={isLoading}
            className="flex items-center text-red-500 hover:text-red-400"
            >
            <Trash2 size={18} className="mr-1" />
            <span>Delete</span>
            </button>
        </div>
        </div>
    </div>
  );
}