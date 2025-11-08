

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Unauthorized from './pages/Unauthorized';
import NotFound from './components/NotFound';
import { useAuth } from './context/AuthContext';
import TranskripNilai from './pages/TranskripNilai';
import JadwalKRS from './pages/Jadwalkrs';
import InputNilai from './pages/InputNilai';
import MataKuliah from './pages/MataKuliah';
import KelolaNilai from './pages/KelolaNilai';


function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading App...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transkrip-nilai" element={<TranskripNilai />} />
          <Route path="/jadwal-krs" element={<JadwalKRS />} />

          <Route element={<ProtectedRoute allowedRoles={['DOSEN']} />}>
            <Route path="/input-nilai" element={<InputNilai />} />
            <Route path="/matakuliah" element={<MataKuliah />} />
            <Route path="/kelola-komponen" element={<KelolaNilai />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;