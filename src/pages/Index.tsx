
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Dashboard from '../components/Dashboard';
import FileUpload from '../components/FileUpload';
import DocumentViewer from '../components/DocumentViewer';
import QuizInterface from '../components/QuizInterface';

const Index = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Features />
            </>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/document/:id" element={<DocumentViewer />} />
          <Route path="/quiz/:id" element={<QuizInterface />} />
        </Routes>
      </div>
    </Router>
  );
};

export default Index;
