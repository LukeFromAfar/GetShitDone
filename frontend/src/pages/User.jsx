import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function User() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
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
        <p className="text-xl">Loading user information...</p>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
          <p className="text-gray-700">{user.name}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
          <p className="text-gray-700">{user.email}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Account Created:</label>
          <p className="text-gray-700">{formatDate(user.createdAt)}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
          <p className="text-gray-700">{capitalize(user.role)}</p>
        </div>
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}