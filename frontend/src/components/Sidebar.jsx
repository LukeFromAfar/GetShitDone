import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Star, Calendar, Home, ChevronRight, ChevronLeft, Search, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    // Navigate to all-tasks with search query
    navigate('/all-tasks', { 
      state: { searchQuery: searchQuery.trim() }
    });
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

  return (
    <div className={`flex flex-col ${isOpen ? 'w-64' : 'w-16'} h-full bg-gray-800 text-white transition-all duration-300`}>
      <aside className="flex flex-col h-full relative">
        <button
          onClick={toggleSidebar}
          className="p-2 focus:outline-none absolute top-2 left-2"
        >
          {isOpen ? <ChevronLeft className="text-white" /> : <ChevronRight className="text-white" />}
        </button>
        <div className="flex items-center p-2 mt-10 justify-center pt-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
            <button type="submit" className="text-white">
              <Search className="h-5 w-5" />
            </button>
            {isOpen && (
              <div className="relative flex-grow mx-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search tasks"
                  className="bg-gray-700 text-white p-2 rounded w-full pr-8"
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
        {/* Rest of your sidebar remains unchanged */}
        <ul className="space-y-2 mt-4 flex-grow">
          <li>
            <NavLink
              to="/my-day"
              className={({ isActive }) =>
                isActive ? 'flex items-center px-4 py-2 bg-gray-700 w-full transition-colors duration-300' : 'flex items-center px-4 py-2 w-full transition-colors duration-300'
              }
            >
              <Sun className="mr-2" />
              <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 w-0'}`}>My Day</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/important"
              className={({ isActive }) =>
                isActive ? 'flex items-center px-4 py-2 bg-gray-700 w-full transition-colors duration-300' : 'flex items-center px-4 py-2 w-full transition-colors duration-300'
              }
            >
              <Star className="mr-2" />
              <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 w-0'}`}>Important</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/planned"
              className={({ isActive }) =>
                isActive ? 'flex items-center px-4 py-2 bg-gray-700 w-full transition-colors duration-300' : 'flex items-center px-4 py-2 w-full transition-colors duration-300'
              }
            >
              <Calendar className="mr-2" />
              <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 w-0'}`}>Planned</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/all-tasks"
              className={({ isActive }) =>
                isActive ? 'flex items-center px-4 py-2 bg-gray-700 w-full transition-colors duration-300' : 'flex items-center px-4 py-2 w-full transition-colors duration-300'
              }
            >
              <Home className="mr-2" />
              <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 w-0'}`}>All Tasks</span>
            </NavLink>
          </li>
        </ul>
        <div className="flex items-center p-4">
          {!isLoading && user ? (
            <NavLink to="/user" className="flex items-center">
            <User className="w-8 h-8 rounded-full pr-1" />
            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 w-0'}`}>{user.name}</span>
          </NavLink>
        ) : (
          <NavLink to="/login" className="flex items-center">
            <User className="pr-1" />
            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 w-0'}`}>
              {isLoading ? 'Loading...' : 'Login'}
            </span>
          </NavLink>
          )}
        </div>
      </aside>
    </div>
  );
}