import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Layout from './pages/Layout'

// Remove the Home import
import Login from './pages/authentication/Login'
import Register from './pages/authentication/Register'

import MyDay from './pages/tasks/MyDay'
import Important from './pages/tasks/Important'
import Planned from './pages/tasks/Planned'
import AllTasks from './pages/tasks/AllTasks'
import Calendar from './pages/tasks/Calendar' // Add this import
import User from './pages/User'

import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Redirect the root path to my-day */}
              <Route index element={<Navigate to="/my-day" replace />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="my-day" element={<MyDay />} />
              <Route path="important" element={<Important />} />
              <Route path="planned" element={<Planned />} />
              <Route path="calendar" element={<Calendar />} /> {/* Add this route */}
              <Route path="all-tasks" element={<AllTasks />} />
              <Route path="user" element={<User />} />
            </Route>
          </Routes>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App;