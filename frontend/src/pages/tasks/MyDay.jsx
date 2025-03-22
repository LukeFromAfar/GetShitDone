import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import TaskInput from '../../components/TaskInput';
import TaskItem from '../../components/TaskItem';
import TaskDetailsPanel from '../../components/TaskDetailsPanel';
import axios from 'axios';

export default function MyDay() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      // Use the correct endpoint path from noteRoutes.js
      const response = await axios.get('/api/note/category/my-day', { 
        withCredentials: true 
      });
      
      // Filter out completed tasks on the client side
      const activeTasks = response.data.filter(task => !task.completed);
      
      setTasks(activeTasks);
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
    // Only add the task to the list if it belongs to this category and is not completed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const taskDate = newTask.dueDate ? new Date(newTask.dueDate) : null;
    
    if (taskDate && taskDate >= today && taskDate < tomorrow && !newTask.completed) {
      setTasks(prevTasks => [newTask, ...prevTasks]);
    }
  };
  
  const handleTaskClick = (task) => {
    if (isPanelOpen && selectedTask && selectedTask._id !== task._id) {
      setSelectedTask(task);
    } else {
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
    const belongsInCategory = taskDate && taskDate >= today && taskDate < tomorrow && !updatedTask.completed;
    
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
    
    // If task was completed, close the panel
    if (updatedTask.completed && isPanelOpen && selectedTask && selectedTask._id === updatedTask._id) {
      closePanel();
    }
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
    setTimeout(() => {
      setSelectedTask(null);
    }, 300);
  };

  return (
    <div className="container mx-auto p-16 h-screen flex flex-col">
      <h1 className="text-5xl font-bold mb-4 p-4 text-white">My Day</h1>
      <p className="text-gray-400 mb-4">{format(new Date(), 'EEEE, MMMM d')}</p>
      
      <TaskInput onTaskAdded={handleTaskAdded} />
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : tasks.length > 0 ? (
        <div className="flex-1 overflow-y-auto mt-8 rounded-lg">
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