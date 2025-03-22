import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Layout from './pages/Layout'

import Home from './pages/Home'
import Login from './pages/authentication/Login'
import Register from './pages/authentication/Register'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
    </Routes>
  )
}

export default App
