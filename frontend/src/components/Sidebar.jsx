import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Star, Calendar, CalendarDays, Home, ChevronRight, ChevronLeft, Search, User, X, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [searchQuery, setSearchQuery] = useState('');
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { isTaskPanelOpen } = useUI();

  // Handle screen resize to detect mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-collapse sidebar on small screens
      if (mobile && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial render
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    // Navigate to all-tasks with search query
    if (searchQuery.trim()) {
      navigate('/all-tasks', { 
        state: { searchQuery: searchQuery.trim() }
      });
      
      // Auto-close sidebar on mobile after search
      if (isMobile) {
        setIsOpen(false);
      }
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    if (location.pathname === '/all-tasks' && location.state?.searchQuery) {
      navigate('/all-tasks', { state: { searchQuery: '' } });
    }
  };

  // Hide the sidebar on the login and register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  // Mobile collapsible sidebar with overlay
  if (isMobile) {
    return (
      <>
        {/* Professional mobile toggle button */}
        {!isTaskPanelOpen && (
                    <div className="fixed top-4 right-4 z-30">
                        <button 
                            onClick={toggleSidebar}
                            className="p-2.5 bg-gray-800/90 text-white focus:outline-none flex items-center justify-center rounded-lg backdrop-blur-sm shadow-lg border border-gray-700/50 hover:bg-gray-700 transition-colors"
                            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
                        >
                            {isOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                )}
        
        {/* Sidebar with overlay */}
        <div 
          className={`fixed inset-0 bg-black/60 z-20 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsOpen(false)}
        ></div>
        
        <div className={`fixed inset-y-0 left-0 z-20 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Search bar */}
            <div className="p-4 mt-8">
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <button type="submit" className="text-white pr-2 cursor-pointer">
                  <Search className="h-5 w-5" />
                </button>
                <div className="relative flex-grow">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="search-input bg-gray-700 text-white rounded-lg px-3 py-2 w-full text-sm"
                  />
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={clearSearch} 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            {/* Navigation links with improved consistent styling */}
            <nav className="flex-grow">
              <ul className="space-y-1 px-2 mt-2">
                <li>
                  <NavLink
                    to="/my-day"
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2.5 rounded-lg text-white ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    <Sun size={18} className="mr-3" />
                    <span>My Day</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/important"
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2.5 rounded-lg text-white ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    <Star size={18} className="mr-3" />
                    <span>Important</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/planned"
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2.5 rounded-lg text-white ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    <Calendar size={18} className="mr-3" />
                    <span>Planned</span>
                  </NavLink>
                </li>
                  {/* Add Calendar Link */}
                  <li>
                    <NavLink
                      to="/calendar"
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2.5 rounded-lg text-white ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      <CalendarDays size={18} className="mr-3" />
                      <span>Calendar</span>
                    </NavLink>
                  </li>
                <li>
                  <NavLink
                    to="/all-tasks"
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2.5 rounded-lg text-white ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    <Home size={18} className="mr-3" />
                    <span>All Tasks</span>
                  </NavLink>
                </li>
              </ul>
            </nav>
            
            {/* User profile link */}
            <div className="p-4 border-t border-gray-700">
              {!isLoading && user ? (
                <NavLink to="/user" className="flex items-center rounded-lg p-2 hover:bg-gray-700/50 text-white" onClick={() => setIsOpen(false)}>
                  <User size={18} className="rounded-full mr-2" />
                  <span className="text-sm truncate">{user.name}</span>
                </NavLink>
              ) : (
                <NavLink to="/login" className="flex items-center rounded-lg p-2 hover:bg-gray-700/50 text-white" onClick={() => setIsOpen(false)}>
                  <User size={18} className="mr-2" />
                  <span className="text-sm">
                    {isLoading ? 'Loading...' : 'Login'}
                  </span>
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={`relative flex flex-col ${isOpen ? 'w-64' : 'w-16'} h-full bg-gray-800 text-white transition-all duration-300 shadow-xl`}>
      <aside className="flex flex-col h-full overflow-hidden">
        {/* In-sidebar toggle button */}
        <div className={`flex ${isOpen ? 'justify-end' : 'justify-center'} p-2`}>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-gray-700/50 text-white focus:outline-none transition-colors cursor-pointer"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
        
        <div className="flex items-center p-2 justify-center">
          <form onSubmit={handleSearchSubmit} className="flex items-center justify-center w-full pt-2">
            <button type="submit" className="text-white pr-3 cursor-pointer">
              <Search className="h-5 w-5 ml-2" />
            </button>
            {isOpen && (
              <div className="relative flex-grow mx-2">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="search-input bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={clearSearch} 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
        
        <ul className="space-y-1 mt-4 flex-grow">
        <li>
          <NavLink
            to="/my-day"
            className={({ isActive }) =>
              isActive 
                ? 'flex items-center px-4 py-2 bg-gray-700 w-full text-white' 
                : 'flex items-center px-4 py-2 w-full hover:bg-gray-700/50 text-white'
            }
          >
            <div className={isOpen ? "mr-3 flex items-center justify-center" : "w-full flex items-center justify-center"}>
              <Sun size={isOpen ? 18 : 20} />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 w-0 absolute'}`}>My Day</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/important"
            className={({ isActive }) =>
              isActive 
                ? 'flex items-center px-4 py-2 bg-gray-700 w-full text-white' 
                : 'flex items-center px-4 py-2 w-full hover:bg-gray-700/50 text-white'
            }
          >
            <div className={isOpen ? "mr-3 flex items-center justify-center" : "w-full flex items-center justify-center"}>
              <Star size={isOpen ? 18 : 20} />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 w-0 absolute'}`}>Important</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/planned"
            className={({ isActive }) =>
              isActive 
                ? 'flex items-center px-4 py-2 bg-gray-700 w-full text-white' 
                : 'flex items-center px-4 py-2 w-full hover:bg-gray-700/50 text-white'
            }
          >
            <div className={isOpen ? "mr-3 flex items-center justify-center" : "w-full flex items-center justify-center"}>
              <Calendar size={isOpen ? 18 : 20} />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 w-0 absolute'}`}>Planned</span>
          </NavLink>
        </li>
        {/* Add Calendar Link */}
        <li>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              isActive 
                ? 'flex items-center px-4 py-2 bg-gray-700 w-full text-white' 
                : 'flex items-center px-4 py-2 w-full hover:bg-gray-700/50 text-white'
            }
          >
            <div className={isOpen ? "mr-3 flex items-center justify-center" : "w-full flex items-center justify-center"}>
              <CalendarDays size={isOpen ? 18 : 20} />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 w-0 absolute'}`}>Calendar</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/all-tasks"
            className={({ isActive }) =>
              isActive 
                ? 'flex items-center px-4 py-2 bg-gray-700 w-full text-white' 
                : 'flex items-center px-4 py-2 w-full hover:bg-gray-700/50 text-white'
            }
          >
            <div className={isOpen ? "mr-3 flex items-center justify-center" : "w-full flex items-center justify-center"}>
              <Home size={isOpen ? 18 : 20} />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 w-0 absolute'}`}>All Tasks</span>
          </NavLink>
        </li>
      </ul>
        
        <div className="flex items-center p-4 border-t border-gray-700 text-white">
          {!isLoading && user ? (
            <NavLink to="/user" className="flex items-center hover:bg-gray-700/50 rounded-lg w-full py-2 px-1">
              <div className={isOpen ? "mr-2 flex items-center justify-center" : "w-full flex items-center justify-center"}>
                <User size={isOpen ? 18 : 20} className="rounded-full" />
              </div>
              <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 w-0 absolute'}`}>
                {user.name}
              </span>
            </NavLink>
          ) : (
            <NavLink to="/login" className="flex items-center hover:bg-gray-700/50 rounded-lg w-full py-2 px-1">
              <div className={isOpen ? "mr-2 flex items-center justify-center" : "w-full flex items-center justify-center"}>
                <User size={isOpen ? 18 : 20} />
              </div>
              <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 w-0 absolute'}`}>
                {isLoading ? 'Loading...' : 'Login'}
              </span>
            </NavLink>
          )}
        </div>
      </aside>
    </div>
  );
}