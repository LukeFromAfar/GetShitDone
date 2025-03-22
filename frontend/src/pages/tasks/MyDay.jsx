import { useState, useEffect } from 'react';
import { Star, Calendar } from 'lucide-react';
import TaskInput from '../../components/TaskInput';
import TaskItem from '../../components/TaskItem';
import TaskDetailsPanel from '../../components/TaskDetailsPanel';
import axios from 'axios';
import myDayImage from '../../assets/images/my-day.jpg';

export default function MyDay() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/note/category/my-day', { 
        withCredentials: true 
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskAdded = (newTask) => {
    // Only add the task to the list if it belongs to this category
    // For MyDay, we check if the dueDate is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const taskDate = newTask.dueDate ? new Date(newTask.dueDate) : null;
    
    if (taskDate && taskDate >= today && taskDate < tomorrow) {
      setTasks(prevTasks => [newTask, ...prevTasks]);
    }
  };
  
  const handleTaskClick = (task) => {
    // If we're already viewing a task and clicking a different one,
    // update the selectedTask directly without closing the panel
    if (isPanelOpen && selectedTask && selectedTask._id !== task._id) {
      setSelectedTask(task);
    } else {
      // Otherwise just open the panel with the selected task
      setSelectedTask(task);
      setIsPanelOpen(true);
    }
  };
  
  const handleTaskUpdated = (updatedTask) => {
    // Check if the updated task still belongs in this category
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const taskDate = updatedTask.dueDate ? new Date(updatedTask.dueDate) : null;
    const belongsInCategory = taskDate && taskDate >= today && taskDate < tomorrow;
    
    // Update the task in the current list if it still belongs
    setTasks(prevTasks => {
      const taskExists = prevTasks.some(task => task._id === updatedTask._id);
      
      if (belongsInCategory && taskExists) {
        // Update existing task
        return prevTasks.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        );
      } else if (belongsInCategory && !taskExists) {
        // Add the task if it now belongs to this category
        return [updatedTask, ...prevTasks];
      } else if (!belongsInCategory && taskExists) {
        // Remove task if it no longer belongs to this category
        return prevTasks.filter(task => task._id !== updatedTask._id);
      }
      
      return prevTasks;
    });
    
    // Keep the selected task updated
    setSelectedTask(updatedTask);
  };
  
  const handleTaskDeleted = (taskId) => {
    setTasks(prevTasks => 
      prevTasks.filter(task => task._id !== taskId)
    );
    
    if (isPanelOpen) {
      setIsPanelOpen(false);
    }
  };
  
  const closePanel = () => {
    setIsPanelOpen(false);
    // Small delay to let the animation complete before clearing the selected task
    setTimeout(() => {
      setSelectedTask(null);
    }, 300);
  };

  return (
    <div className="container mx-auto p-4 mb-20">
      <h1 className="text-2xl font-bold mb-6 text-white">My Day</h1>
      <TaskInput onTaskAdded={handleTaskAdded} />
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-3 mt-6">
          {tasks.map(task => (
            <TaskItem 
              key={task._id}
              task={task}
              onTaskClick={handleTaskClick}
              onTaskUpdated={handleTaskUpdated}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg py-12 px-4 text-center mt-8">
          <p className="text-gray-400 text-lg">No tasks for today</p>
          <p className="text-gray-500 mt-2">Add a task to get started</p>
        </div>
      )}
      
      <TaskDetailsPanel
        task={selectedTask}
        isOpen={isPanelOpen}
        onClose={closePanel}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />
    </div>
  );
}