import { useState, useEffect, useRef } from 'react';
import TaskInput from '../../components/TaskInput';
import TaskItem from '../../components/TaskItem';
import TaskDetailsPanel from '../../components/TaskDetailsPanel';
import axios from 'axios';
import { 
  startOfToday, endOfToday, startOfTomorrow, endOfTomorrow, 
  startOfWeek, endOfWeek, addWeeks, isAfter, isBefore, parseISO,
  format, isSameWeek, getDay
} from 'date-fns';
import { Filter } from 'lucide-react'; // Removed ChevronUp

export default function Planned() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  
  // Calculate date labels for the filter menu
  const today = new Date();
  const todayDayName = format(today, 'EEEE'); // e.g. "Monday"
  const tomorrowDayName = format(addWeeks(today, 0).setDate(today.getDate() + 1), 'EEEE'); // e.g. "Tuesday"
  
  // Calculate the week range
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 }); // Sunday
  const weekRangeLabel = `${format(today, 'd')}-${format(thisWeekEnd, 'd')} ${format(thisWeekStart, 'MMM')}`;
  
  // Define filter options with enhanced labels
  const filterOptions = [
    { id: 'all', label: 'All planned' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
    { id: 'week', label: 'This week' },
    { id: 'later', label: 'Later' }
  ];
  
  // Touch event handlers for bottom sheet
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    currentY.current = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0) { // Only allow dragging down
      const translateY = Math.min(diff, 400); // Limit the drag
      if (filterMenuRef.current) {
        filterMenuRef.current.style.transform = `translateY(${translateY}px)`;
      }
    }
  };
  
  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;
    
    if (diff > 80) { // Threshold to close
      closeFilterMenu();
    } else {
      // Reset position if not dragged enough
      if (filterMenuRef.current) {
        filterMenuRef.current.style.transform = 'translateY(0)';
      }
    }
  };
  
  const openFilterMenu = () => {
    setIsFilterMenuOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent body scroll
  };
  
  const closeFilterMenu = () => {
    if (filterMenuRef.current) {
      filterMenuRef.current.style.transform = 'translateY(100%)';
      setTimeout(() => {
        setIsFilterMenuOpen(false);
        document.body.style.overflow = ''; // Re-enable body scroll
      }, 300);
    } else {
      setIsFilterMenuOpen(false);
      document.body.style.overflow = ''; // Re-enable body scroll
    }
  };
  
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/note/category/planned', { 
        withCredentials: true 
      });
      
      const activeTasks = response.data.filter(task => !task.completed);
      
      setTasks(activeTasks);
      applyFilter(activeTasks, filter);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    
    // Clean up in case component unmounts while menu is open
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  // Apply filter whenever tasks or filter changes
  useEffect(() => {
    applyFilter(tasks, filter);
  }, [tasks, filter]);
  
  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    closeFilterMenu();
  };
  
  // Apply filter to tasks
  const applyFilter = (tasksToFilter, currentFilter) => {
    if (!tasksToFilter || tasksToFilter.length === 0) {
      setFilteredTasks([]);
      return;
    }
    
    const today = startOfToday();
    const todayEnd = endOfToday();
    const tomorrow = startOfTomorrow();
    const tomorrowEnd = endOfTomorrow();
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday as first day
    const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    let result = [];
    
    switch (currentFilter) {
      case 'overdue':
        result = tasksToFilter.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = parseISO(task.dueDate);
          return isBefore(dueDate, today);
        });
        break;
      
      case 'today':
        result = tasksToFilter.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = parseISO(task.dueDate);
          return (isBefore(dueDate, todayEnd) && isAfter(dueDate, today)) || isBefore(dueDate, today);
        });
        break;
      
      case 'tomorrow':
        result = tasksToFilter.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = parseISO(task.dueDate);
          return isAfter(dueDate, tomorrow) && isBefore(dueDate, tomorrowEnd);
        });
        break;
      
      case 'week':
        result = tasksToFilter.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = parseISO(task.dueDate);
          return isAfter(dueDate, today) && isBefore(dueDate, thisWeekEnd);
        });
        break;
      
      case 'later':
        result = tasksToFilter.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = parseISO(task.dueDate);
          return isAfter(dueDate, thisWeekEnd);
        });
        break;
      
      default: // 'all'
        result = [...tasksToFilter];
    }
    
    // Sort tasks by due date
    result.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    setFilteredTasks(result);
  };

  // Other handlers remain the same
  const handleTaskAdded = (newTask) => {
    if (newTask.dueDate && !newTask.completed) {
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
    const belongsInCategory = updatedTask.dueDate && !updatedTask.completed;
    
    setTasks(prevTasks => {
      const taskExists = prevTasks.some(task => task._id === updatedTask._id);
      
      if (belongsInCategory && taskExists) {
        return prevTasks.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        );
      } else if (belongsInCategory && !taskExists) {
        return [updatedTask, ...prevTasks];
      } else if (!belongsInCategory && taskExists) {
        return prevTasks.filter(task => task._id !== updatedTask._id);
      }
      
      return prevTasks;
    });
    
    setSelectedTask(updatedTask);
    
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
  
  // Find the active filter option
  const activeFilter = filterOptions.find(option => option.id === filter) || filterOptions[0];

  return (
    <div className="container mx-auto p-4 sm:p-8 md:p-16 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4 pt-16">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white">Planned</h1>
        
        {/* Desktop filter buttons */}
        <div className="hidden md:flex flex-wrap gap-2">
          {filterOptions.map(option => (
            <button
              key={option.id}
              onClick={() => handleFilterChange(option.id)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === option.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        {/* Mobile filter button */}
        <button 
          className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-full text-sm text-white"
          onClick={openFilterMenu}
        >
          <Filter size={16} />
          <span>{activeFilter.label}</span>
        </button>
      </div>
      
      <TaskInput onTaskAdded={handleTaskAdded} />
      
      {isLoading ? (
        <div className="flex justify-center items-center py-6 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="flex-1 overflow-y-auto mt-4 sm:mt-8 rounded-lg">
          {filteredTasks.map(task => (
            <TaskItem 
              key={task._id}
              task={task}
              onTaskClick={handleTaskClick}
              onTaskUpdated={handleTaskUpdated}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg py-6 sm:py-12 px-3 sm:px-4 text-center mt-4 sm:mt-8">
          <p className="text-gray-400 text-base sm:text-lg">
            {filter === 'all' 
              ? 'No planned tasks' 
              : `No ${filter === 'week' ? 'tasks this week' : filter === 'later' ? 'upcoming tasks' : filter + ' tasks'}`
            }
          </p>
          <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">Add a task to get started</p>
        </div>
      )}
      
      {/* Mobile Filter Menu (Bottom Sheet) */}
      {isFilterMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-opacity-0 backdrop-blur-sm z-40 md:hidden"
            onClick={closeFilterMenu}
          />
          
          {/* Bottom Sheet */}
          <div
            ref={filterMenuRef}
            className="fixed bottom-0 left-0 right-0 bg-gray-800 rounded-t-xl z-50 transform transition-transform duration-300 pb-8 md:hidden"
            style={{ boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.2)' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Pull indicator */}
            <div className="flex justify-center pt-2 pb-4">
              <div className="w-12 h-1 bg-gray-500 rounded-full"></div>
            </div>
            
            {/* Title - removed ChevronUp icon */}
            <div className="px-4 pb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Filter tasks</h3>
            </div>
            
            {/* Options - with day/dates on the right */}
            <div className="px-4 space-y-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors flex items-center justify-between ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                <span>All planned</span>
                {filter === 'all' && <div className="w-3 h-3 rounded-full bg-white"></div>}
              </button>
              
              <button
                onClick={() => handleFilterChange('overdue')}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors flex items-center justify-between ${
                  filter === 'overdue' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                <span>Overdue</span>
                {filter === 'overdue' && <div className="w-3 h-3 rounded-full bg-white"></div>}
              </button>
              
              <button
                onClick={() => handleFilterChange('today')}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors flex items-center justify-between ${
                  filter === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                <span>Today</span>
                <div className={`text-sm ${filter === 'today' ? 'text-white' : 'text-gray-400'}`}>
                  {todayDayName}
                </div>
                {filter === 'today' && <div className="w-3 h-3 rounded-full bg-white ml-2"></div>}
              </button>
              
              <button
                onClick={() => handleFilterChange('tomorrow')}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors flex items-center justify-between ${
                  filter === 'tomorrow' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                <span>Tomorrow</span>
                <div className="flex items-center">
                  <div className={`text-sm ${filter === 'tomorrow' ? 'text-white' : 'text-gray-400'}`}>
                    {tomorrowDayName}
                  </div>
                  {filter === 'tomorrow' && <div className="w-3 h-3 rounded-full bg-white ml-2"></div>}
                </div>
              </button>
              
              <button
                onClick={() => handleFilterChange('week')}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors flex items-center justify-between ${
                  filter === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                <span>This week</span>
                <div className="flex items-center">
                  <div className={`text-sm ${filter === 'week' ? 'text-white' : 'text-gray-400'}`}>
                    {weekRangeLabel}
                  </div>
                  {filter === 'week' && <div className="w-3 h-3 rounded-full bg-white ml-2"></div>}
                </div>
              </button>
              
              <button
                onClick={() => handleFilterChange('later')}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors flex items-center justify-between ${
                  filter === 'later' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                <span>Later</span>
                {filter === 'later' && <div className="w-3 h-3 rounded-full bg-white"></div>}
              </button>
            </div>
          </div>
        </>
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