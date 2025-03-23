import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Mail, Calendar, Shield, LogOut, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function User() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // ADD THIS: Track container height to ensure background covers entire content
  const [minHeight, setMinHeight] = useState('100vh');

  // Adjust min-height when delete confirmation changes
  useEffect(() => {
    // Give the DOM time to update after state changes
    const timer = setTimeout(() => {
      // Set min-height to at least window height or more if content is taller
      const windowHeight = window.innerHeight;
      const contentHeight = document.getElementById('user-profile-container')?.scrollHeight || 0;
      setMinHeight(`${Math.max(windowHeight, contentHeight)}px`);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [showDeleteConfirm, error, isDeleting]);


  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      
      // Call the correct API endpoint
      await axios.delete('/api/auth/delete-account', {
        withCredentials: true
      });
      
      // Log the user out after successful deletion
      await logout();
      navigate('/register', { state: { message: 'Your account has been successfully deleted.' } });
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    // Format date to Oslo timezone
    return date.toLocaleString('en-GB', { 
      timeZone: 'Europe/Oslo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Function to capitalize first letter of a string
  const capitalize = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl mb-10 sm:mb-20">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 pt-8 sm:pt-16 text-white">User Profile</h1>
      
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* User header */}
        <div className="bg-gray-700 p-4 sm:p-6 flex items-center border-b border-gray-600">
          <div className="bg-blue-600 rounded-full p-2 sm:p-3">
            <UserCircle size={28} className="text-white sm:h-9 sm:w-9" />
          </div>
          <div className="ml-3 sm:ml-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white">{user.name}</h2>
            <p className="text-sm sm:text-base text-blue-400">{user.email}</p>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center bg-gray-700 p-4 rounded-lg">
            <Mail className="text-blue-400 mr-4" />
            <div>
              <p className="text-gray-400 text-sm">Email</p>
              <p className="text-white">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center bg-gray-700 p-4 rounded-lg">
            <Calendar className="text-blue-400 mr-4" />
            <div>
              <p className="text-gray-400 text-sm">Account Created</p>
              <p className="text-white">{formatDate(user.createdAt)}</p>
            </div>
          </div>
          
          <div className="flex items-center bg-gray-700 p-4 rounded-lg">
            <Shield className="text-blue-400 mr-4" />
            <div>
              <p className="text-gray-400 text-sm">Role</p>
              <p className="text-white">{capitalize(user.role)}</p>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg flex items-start">
              <AlertCircle className="mr-2 flex-shrink-0 text-red-400" />
              <p>{error}</p>
            </div>
          )}
        </div>
        
        <div className="p-4 sm:p-6 border-t border-gray-600 space-y-3 sm:space-y-4">
          <button
            onClick={handleLogout}
            disabled={isDeleting}
            className="flex items-center justify-center w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </button>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center w-full border border-red-500 text-red-500 hover:bg-red-500/10 font-medium py-3 px-4 rounded-lg transition-colors mt-2 cursor-pointer"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Delete Account
            </button>
          ) : (
            <div className="bg-gray-700 p-4 rounded-lg mt-4">
              <p className="text-white mb-4 text-center">Are you sure you want to delete your account? This will permanently delete all your tasks and cannot be undone.</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>Confirm Delete</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}