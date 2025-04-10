import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TaskInput from '../../components/TaskInput';
import TaskItem from '../../components/TaskItem';
import TaskDetailsPanel from '../../components/TaskDetailsPanel';
import axios from 'axios';

export default function AllTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const location = useLocation();
  const searchQuery = location.state?.searchQuery || '';
  
  const fetchTasks = async (query = '') => {
    try {
      setIsLoading(true);
      let response;
      
      // Use different endpoint based on whether we're searching or not
      if (query) {
        response = await axios.get(`/api/note/search-notes?q=${encodeURIComponent(query)}`, { 
          withCredentials: true 
        });
      } else {
        response = await axios.get('/api/note', { 
          withCredentials: true 
        });
      }
      
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(searchQuery);
  }, [searchQuery]);

  const handleTaskAdded = (newTask) => {
    // If we're currently searching, don't add the new task to the list
    // as it might not match the search criteria
    if (!searchQuery) {
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
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      )
    );
    setSelectedTask(updatedTask);
  };
  
  const handleTaskDeleted = (taskId) => {
    setTasks(prevTasks => 
      prevTasks.filter(task => task._id !== taskId)
    );
  };
  
  const closePanel = () => {
    setIsPanelOpen(false);
    // Small delay to let the animation complete before clearing the selected task
    setTimeout(() => {
      setSelectedTask(null);
    }, 300);
  };

  // Separate active and completed tasks
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="container mx-auto p-4 sm:p-8 md:p-16 h-screen flex flex-col">
      <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-6 p-2 sm:p-4 pt-16 text-white">
        {searchQuery ? `Search Results: "${searchQuery}"` : 'All Tasks'}
      </h1>
      <TaskInput onTaskAdded={handleTaskAdded} className="flex-shrink-0" />
      
      {isLoading ? (
        <div className="flex justify-center items-center py-6 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : tasks.length > 0 ? (
        <div className="flex-1 overflow-y-auto mt-4 sm:mt-8 rounded-lg">
        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <div className="space-y-2 sm:space-y-3">
              {activeTasks.map(task => (
                <TaskItem 
                  key={task._id}
                  task={task}
                  onTaskClick={handleTaskClick}
                  onTaskUpdated={handleTaskUpdated}
                />
              ))}
            </div>
          )}
          
          {/* Completed Tasks Section (only show if there are completed tasks) */}
          {completedTasks.length > 0 && (
            <div className="mt-4 sm:mt-8">
              {/* Divider */}
              <div className="relative my-4 sm:my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 sm:px-4 bg-gray-800 text-xs sm:text-sm text-gray-500">
                    Completed Tasks ({completedTasks.length})
                  </span>
                </div>
              </div>
              
              {/* Completed Tasks List */}
              <div className="space-y-2 sm:space-y-3 pb-4">
                {completedTasks.map(task => (
                  <TaskItem 
                    key={task._id}
                    task={task}
                    onTaskClick={handleTaskClick}
                    onTaskUpdated={handleTaskUpdated}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg py-6 sm:py-12 px-3 sm:px-4 text-center mt-4 sm:mt-8">
          <p className="text-gray-400 text-base sm:text-lg">
            {searchQuery ? `No tasks found matching "${searchQuery}"` : 'No tasks yet'}
          </p>
          <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
            {searchQuery ? 'Try a different search term' : 'Add a task to get started'}
          </p>
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