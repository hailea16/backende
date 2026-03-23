import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Services from './pages/Services';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Contact from './pages/Contact';
import LoginPage from './pages/Auth/LoginPage';
import Register from './pages/Auth/Register';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import StudentExam from './pages/StudentExam';
import { LanguageProvider } from './contexts/LanguageContext';

const DashboardRedirect = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return <Navigate to={user?.isAdmin ? '/admin/dashboard' : '/courses'} replace />;
};

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
            <Route path="/courses/:courseName" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/student/exams/:id" element={<ProtectedRoute><StudentExam /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
