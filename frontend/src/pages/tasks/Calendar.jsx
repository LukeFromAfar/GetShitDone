import { useState, useEffect, useRef } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addDays,
  parseISO,
  isToday as isDateToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import TaskDetailsPanel from '../../components/TaskDetailsPanel';
import axios from 'axios';

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef(null);
  
  // Day selection menu state
  const [selectedDay, setSelectedDay] = useState(null);
  const [isDayMenuOpen, setIsDayMenuOpen] = useState(false);
  const dayMenuRef = useRef(null);
  
  // Gesture tracking
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isDragging = useRef(false);
  
  // Touch handling for main calendar
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isDragging.current = false;
  };
  
  const handleTouchMove = (e) => {
    if (Math.abs(e.touches[0].clientX - touchStartX.current) > 10 || 
        Math.abs(e.touches[0].clientY - touchStartY.current) > 10) {
      isDragging.current = true;
    }
  };
  
  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchDuration = Date.now() - touchStartTime.current;
    const diffX = touchStartX.current - touchEndX;
    
    if (isDragging.current && touchDuration < 300 && Math.abs(diffX) > 80) {
      if (diffX > 0) {
        nextMonth();
      } else {
        prevMonth();
      }
      
      e.preventDefault();
      e.stopPropagation();
    }
  };
  
  // Touch handling for day menu
  const dayMenuTouchStartY = useRef(0);
  const dayMenuCurrentY = useRef(0);
  
  const handleDayMenuTouchStart = (e) => {
    dayMenuTouchStartY.current = e.touches[0].clientY;
    dayMenuCurrentY.current = e.touches[0].clientY;
  };
  
  const handleDayMenuTouchMove = (e) => {
    dayMenuCurrentY.current = e.touches[0].clientY;
    const diff = dayMenuCurrentY.current - dayMenuTouchStartY.current;
    
    if (diff > 0) {
      const translateY = Math.min(diff, 400);
      if (dayMenuRef.current) {
        dayMenuRef.current.style.transform = `translateY(${translateY}px)`;
      }
    }
  };
  
  const handleDayMenuTouchEnd = () => {
    const diff = dayMenuCurrentY.current - dayMenuTouchStartY.current;
    
    if (diff > 80) {
      closeDayMenu();
    } else {
      if (dayMenuRef.current) {
        dayMenuRef.current.style.transform = 'translateY(0)';
      }
    }
  };
  
  // Day menu functions
  const openDayMenu = (day, dayTasks) => {
    setSelectedDay({ date: day, tasks: dayTasks });
    setIsDayMenuOpen(true);
    document.body.style.overflow = 'hidden';
  };
  
  const closeDayMenu = () => {
    if (dayMenuRef.current) {
      dayMenuRef.current.style.transform = 'translateY(100%)';
      setTimeout(() => {
        setIsDayMenuOpen(false);
        setSelectedDay(null);
        document.body.style.overflow = '';
      }, 300);
    } else {
      setIsDayMenuOpen(false);
      setSelectedDay(null);
      document.body.style.overflow = '';
    }
  };
  
  // Fetch all tasks with due dates
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/note/category/planned', { 
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
    
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Handle task selection from day menu only
  const handleTaskClick = (task) => {
    if (isDayMenuOpen) {
      closeDayMenu();
    }
    
    if (isPanelOpen && selectedTask && selectedTask._id !== task._id) {
      setSelectedTask(task);
    } else {
      setSelectedTask(task);
      setIsPanelOpen(true);
    }
  };
  
  // Function to handle day cell click
  const handleDayClick = (day, dayTasks) => {
    if (dayTasks.length > 0) {
      openDayMenu(day, dayTasks);
    }
  };
  
  const handleTaskUpdated = (updatedTask) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      )
    );
    setSelectedTask(updatedTask);
    
    if (isDayMenuOpen && selectedDay) {
      const updatedDayTasks = getTasksForDay(selectedDay.date);
      setSelectedDay(prev => ({ ...prev, tasks: updatedDayTasks }));
    }
  };
  
  const handleTaskDeleted = (taskId) => {
    setTasks(prevTasks => 
      prevTasks.filter(task => task._id !== taskId)
    );
    
    if (isPanelOpen) {
      setIsPanelOpen(false);
    }
    
    if (isDayMenuOpen && selectedDay) {
      const updatedDayTasks = selectedDay.tasks.filter(task => task._id !== taskId);
      setSelectedDay(prev => ({ ...prev, tasks: updatedDayTasks }));
      
      if (updatedDayTasks.length === 0) {
        closeDayMenu();
      }
    }
  };
  
  const closePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => {
      setSelectedTask(null);
    }, 300);
  };
  
  // Navigation functions
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());
  
  // Get tasks for a specific day
  const getTasksForDay = (day) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(parseISO(task.dueDate), day);
    });
  };
  
  // Generate date cells for current month view
  const generateMonthDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const rows = [];
    let days = [];
    let day = startDate;
    
    // Add day headers with improved font sizes
    const dayHeaders = [];
    for (let i = 0; i < 7; i++) {
      dayHeaders.push(
        <div key={`header-${i}`} className="text-center font-medium text-gray-300 py-2">
          <span className="md:hidden text-sm">{format(addDays(startDate, i), 'EEEEE')}</span>
          <span className="hidden md:inline text-base">{format(addDays(startDate, i), 'EEE')}</span>
        </div>
      );
    }
    rows.push(<div key="header" className="grid grid-cols-7">{dayHeaders}</div>);
    
    // Create calendar days
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const dayTasks = getTasksForDay(day);
        const isToday = isDateToday(day);
        
        days.push(
          <div
            key={day.toString()}
            className={`sm:min-h-[80px] md:min-h-[100px] border border-gray-700 p-1 ${
              isCurrentMonth ? 'bg-gray-800/80' : 'bg-gray-800/30 opacity-50'
            } ${isToday ? 'ring-2 ring-blue-500' : ''} ${
              dayTasks.length > 0 && isCurrentMonth ? 'cursor-pointer hover:bg-gray-750' : ''
            }`}
            onClick={() => handleDayClick(currentDay, dayTasks)}
          >
            {/* Day number with better sizing */}
            <div 
              className={`text-right text-base md:text-lg font-medium ${
                isToday 
                  ? 'text-blue-400' 
                  : isCurrentMonth ? 'text-white' : 'text-gray-500'
              }`}
            >
              {format(day, 'd')}
            </div>
            
            {/* Task indicators - not clickable directly */}
            <div className="hidden sm:block overflow-y-auto max-h-[60px] md:max-h-[80px]">
              {dayTasks.map((task) => (
                <div 
                  key={task._id}
                  className={`text-sm p-1 mb-1 truncate rounded ${
                    task.completed 
                      ? 'line-through bg-gray-700/50 text-gray-400' 
                      : task.important 
                        ? 'bg-yellow-500/20 text-yellow-200 border-l-2 border-yellow-500'
                        : 'bg-blue-500/20 text-blue-200 border-l-2 border-blue-500'
                  }`}
                  title={task.title}
                >
                  {task.title}
                </div>
              ))}
            </div>
            
            {/* Task dots for small mobile screens */}
            <div className="sm:hidden flex flex-wrap gap-1 justify-center mt-1">
              {dayTasks.slice(0, 3).map((task) => (
                <div 
                  key={task._id}
                  className={`w-2 h-2 rounded-full ${
                    task.completed 
                      ? 'bg-gray-400' 
                      : task.important 
                        ? 'bg-yellow-500' 
                        : 'bg-blue-500'
                  }`}
                ></div>
              ))}
              {dayTasks.length > 3 && <div className="w-2 h-2 rounded-full bg-gray-400"></div>}
            </div>
            
            {/* Task count indicator */}
            {dayTasks.length > 0 && isCurrentMonth && (
              <div className="text-sm text-gray-400 text-center mt-1 sm:hidden">
                {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    
    return rows;
  };
  
  return (
    <div className="container mx-auto p-4 sm:p-8 md:p-16 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4 pt-16">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center">
          <CalendarDays className="mr-2 h-7 w-7 sm:h-8 sm:w-8" />
          Calendar
        </h1>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={goToToday}
            className="px-3 py-1.5 text-base bg-blue-600 text-white rounded-lg"
          >
            Today
          </button>
        </div>
      </div>
      
      {/* Month navigation with white chevrons */}
      <div className="flex items-center justify-between mb-2 sm:mb-4 bg-gray-800/80 p-3 sm:p-4 rounded-lg shadow-lg">
        <button 
          onClick={prevMonth}
          className="p-1.5 hover:bg-gray-700 rounded-full text-white"
          aria-label="Previous month"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button 
          onClick={nextMonth}
          className="p-1.5 hover:bg-gray-700 rounded-full text-white"
          aria-label="Next month"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* Calendar grid */}
      {isLoading ? (
        <div className="flex justify-center items-center flex-grow py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div 
          ref={calendarRef}
          className="flex-1 overflow-y-auto bg-gray-900/40 rounded-xl p-2 sm:p-3"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="space-y-1">
            {generateMonthDays()}
          </div>
        </div>
      )}
      
      {/* Mobile Day Tasks Menu (Bottom Sheet) */}
      {isDayMenuOpen && selectedDay && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
            onClick={closeDayMenu}
          />
          
          <div
            ref={dayMenuRef}
            className="fixed bottom-0 left-0 right-0 bg-gray-800 rounded-t-xl z-50 transform transition-transform duration-300 pb-8"
            style={{ boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.2)' }}
            onTouchStart={handleDayMenuTouchStart}
            onTouchMove={handleDayMenuTouchMove}
            onTouchEnd={handleDayMenuTouchEnd}
          >
            {/* Pull indicator */}
            <div className="flex justify-center pt-2 pb-4">
              <div className="w-12 h-1 bg-gray-500 rounded-full"></div>
            </div>
            
            {/* Title with date */}
            <div className="px-4 pb-2 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                {format(selectedDay.date, 'EEEE, MMMM d')}
              </h3>
              <span className={isDateToday(selectedDay.date) ? "text-blue-400 text-base" : "text-gray-400 text-base"}>
                {isDateToday(selectedDay.date) ? "Today" : ""}
              </span>
            </div>
            
            {/* Tasks list */}
            <div className="px-4 space-y-2 max-h-[60vh] overflow-y-auto pb-4">
              {selectedDay.tasks.length > 0 ? (
                selectedDay.tasks.map(task => (
                  <div
                    key={task._id}
                    onClick={() => handleTaskClick(task)}
                    className={`w-full text-left py-3 px-4 rounded-lg transition-colors bg-gray-700 text-white flex items-center ${
                      task.completed ? 'opacity-50' : ''
                    } cursor-pointer hover:bg-gray-600`}
                  >
                    <div className={`mr-3 w-5 h-5 rounded-full border flex-shrink-0 ${
                      task.completed 
                        ? 'border-gray-500 bg-gray-500' 
                        : task.important 
                          ? 'border-yellow-500' 
                          : 'border-blue-500'
                    }`} />
                    <div className="flex-grow">
                      <div className={`text-base ${task.completed ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                      </div>
                      {task.dueTime && (
                        <div className="text-sm text-gray-400 mt-1">
                          {format(parseISO(task.dueTime), 'h:mm a')}
                        </div>
                      )}
                    </div>
                    {task.important && !task.completed && (
                      <div className="text-yellow-500 ml-2 text-lg">★</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400 text-base">
                  No tasks for this day
                </div>
              )}
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