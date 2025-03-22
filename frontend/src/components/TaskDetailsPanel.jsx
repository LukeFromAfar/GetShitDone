import { useState, useEffect, useRef } from 'react';
import { X, Star, Calendar, Trash2, Check, CalendarIcon } from 'lucide-react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function TaskDetailsPanel({ task, isOpen, onClose, onTaskUpdated, onTaskDeleted }) {
  const [editedTask, setEditedTask] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const panelRef = useRef(null);
  
  // Sync state when task changes
  useEffect(() => {
    // Only update if there's a valid task
    if (task && task._id) {
      setEditedTask(task);
    }
  }, [task]);
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Don't render anything if panel is closed
  if (!isOpen) return null;
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };
  
  const toggleImportant = async () => {
    try {
      if (!editedTask || !editedTask._id) return;
      
      setIsLoading(true);
      const updatedTask = { ...editedTask, important: !editedTask.important };
      
      await axios.put(`/api/note/${editedTask._id}`, updatedTask, {
        withCredentials: true
      });
      
      setEditedTask(updatedTask);
      if (onTaskUpdated) onTaskUpdated(updatedTask);
    } catch (error) {
      console.error('Error updating task importance:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleCompleted = async () => {
    try {
      if (!editedTask || !editedTask._id) return;
      
      setIsLoading(true);
      const updatedTask = { ...editedTask, completed: !editedTask.completed };
      
      await axios.put(`/api/note/${editedTask._id}`, updatedTask, {
        withCredentials: true
      });
      
      setEditedTask(updatedTask);
      if (onTaskUpdated) onTaskUpdated(updatedTask);
    } catch (error) {
      console.error('Error updating task completion:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDateChange = async (date) => {
    try {
      if (!editedTask || !editedTask._id) return;
      
      setIsLoading(true);
      setShowDatePicker(false);
      
      const updatedTask = { ...editedTask, dueDate: date };
      
      await axios.put(`/api/note/${editedTask._id}`, updatedTask, {
        withCredentials: true
      });
      
      setEditedTask(updatedTask);
      if (onTaskUpdated) onTaskUpdated(updatedTask);
    } catch (error) {
      console.error('Error updating due date:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearDueDate = async () => {
    try {
      if (!editedTask || !editedTask._id) return;
      
      setIsLoading(true);
      setShowDatePicker(false);
      
      const updatedTask = { ...editedTask, dueDate: null };
      
      await axios.put(`/api/note/${editedTask._id}`, updatedTask, {
        withCredentials: true
      });
      
      setEditedTask(updatedTask);
      if (onTaskUpdated) onTaskUpdated(updatedTask);
    } catch (error) {
      console.error('Error clearing due date:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveChanges = async () => {
    try {
      if (!editedTask || !editedTask._id) return;
      
      setIsLoading(true);
      
      await axios.put(`/api/note/${editedTask._id}`, editedTask, {
        withCredentials: true
      });
      
      if (onTaskUpdated) onTaskUpdated(editedTask);
      onClose();
    } catch (error) {
      console.error('Error saving task changes:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteTask = async () => {
    if (!editedTask || !editedTask._id) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      setIsLoading(true);
      
      await axios.delete(`/api/note/${editedTask._id}`, {
        withCredentials: true
      });
      
      if (onTaskDeleted) onTaskDeleted(editedTask._id);
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Check if we have a valid task
  const hasValidTask = editedTask && editedTask._id;

  // If no valid task is selected, show a placeholder
  if (!hasValidTask) {
    return (
      <div 
        className="fixed inset-y-0 right-0 w-full md:w-96 bg-gray-900 text-white shadow-lg transform transition-transform duration-300 z-50 flex flex-col"
        ref={panelRef}
        style={{transform: isOpen ? 'translateX(0)' : 'translateX(100%)'}}
      >
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <h2 className="text-lg font-semibold">Task Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-700 h-16 w-16 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <p className="text-gray-400 text-center mt-8">Loading task details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Safe access of properties
  const isCompleted = editedTask?.completed || false;
  const isImportant = editedTask?.important || false;
  const taskDueDate = editedTask?.dueDate || null;
  const taskTitle = editedTask?.title || '';
  const taskNote = editedTask?.note || '';

  return (
    <div 
      className="fixed inset-y-0 right-0 w-full md:w-96 bg-gray-900 text-white shadow-lg transform transition-transform duration-300 z-50 flex flex-col"
      ref={panelRef}
      style={{transform: isOpen ? 'translateX(0)' : 'translateX(100%)'}}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <div className="flex items-center">
          <button
            onClick={toggleCompleted}
            className={`mr-3 w-6 h-6 rounded-full border flex items-center justify-center ${
              isCompleted 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'border-gray-500 hover:border-gray-300'
            }`}
            disabled={isLoading}
          >
            {isCompleted && <Check className="h-4 w-4" />}
          </button>
          <h2 className="text-lg font-semibold">Task Details</h2>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-800">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={taskTitle}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Note</label>
          <textarea
            name="note"
            value={taskNote}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] text-white resize-none"
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-4">
          {/* Due Date Section */}
          <div className="bg-gray-700 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-300" />
                <span className="text-sm text-gray-200">
                  {taskDueDate ? formatDate(taskDueDate) : 'No due date'}
                </span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  disabled={isLoading}
                >
                  {taskDueDate ? 'Change' : 'Add date'}
                </button>
                
                {showDatePicker && (
                  <div className="absolute right-0 mt-2 z-10 bg-gray-700 shadow-lg rounded-md border border-gray-600">
                    <div className="p-3">
                      <style>
                        {`
                        .react-datepicker {
                          background-color: #374151 !important;
                          border-color: #4B5563 !important;
                          color: white !important;
                        }
                        .react-datepicker__header {
                          background-color: #1F2937 !important;
                          border-color: #4B5563 !important;
                        }
                        .react-datepicker__current-month, 
                        .react-datepicker__day-name,
                        .react-datepicker__navigation {
                          color: white !important;
                        }
                        .react-datepicker__day {
                          color: #D1D5DB !important;
                        }
                        .react-datepicker__day:hover {
                          background-color: #2563EB !important;
                          color: white !important;
                        }
                        .react-datepicker__day--selected,
                        .react-datepicker__day--keyboard-selected {
                          background-color: #2563EB !important;
                          color: white !important;
                        }
                        .react-datepicker__day--outside-month {
                          color: #6B7280 !important;
                        }
                        .react-datepicker__triangle {
                          display: none !important;
                        }
                        `}
                      </style>
                      <DatePicker
                        selected={taskDueDate ? new Date(taskDueDate) : new Date()}
                        onChange={handleDateChange}
                        inline
                      />
                    </div>
                    {taskDueDate && (
                      <div className="p-3 text-center border-t border-gray-600">
                        <button 
                          onClick={clearDueDate}
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                          disabled={isLoading}
                        >
                          Remove due date
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Important Section */}
          <button
            onClick={toggleImportant}
            className="flex items-center justify-between w-full p-4 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
            disabled={isLoading}
          >
            <div className="flex items-center space-x-3">
              <Star 
                className={`h-5 w-5 ${
                  isImportant 
                    ? 'text-yellow-500 fill-yellow-500' 
                    : 'text-gray-300'
                }`} 
              />
              <span className="text-gray-200">Important</span>
            </div>
            <span className="text-sm text-gray-400">
              {isImportant ? 'On' : 'Off'}
            </span>
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-700 p-4 flex justify-between items-center bg-gray-900">
        <button
          onClick={deleteTask}
          className="flex items-center text-red-400 hover:text-red-300 transition-colors"
          disabled={isLoading}
        >
          <Trash2 className="h-5 w-5 mr-2" />
          Delete task
        </button>
        
        <button
          onClick={saveChanges}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-md transition-colors disabled:bg-gray-600 disabled:text-gray-400"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}