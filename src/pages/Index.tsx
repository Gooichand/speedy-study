
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Dashboard from '../components/Dashboard';
import FileUpload from '../components/FileUpload';
import DocumentViewer from '../components/DocumentViewer';
import QuizInterface from '../components/QuizInterface';
import Auth from './Auth';
import ProtectedRoute from '../components/ProtectedRoute';

const Index = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={
            <>
              <Header />
              <Hero />
              <Features />
            </>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Header />
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <Header />
              <FileUpload />
            </ProtectedRoute>
          } />
          <Route path="/document/:id" element={
            <ProtectedRoute>
              <Header />
              <DocumentViewer />
            </ProtectedRoute>
          } />
          <Route path="/quiz/:id" element={
            <ProtectedRoute>
              <Header />
              <QuizInterface />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default Index;
