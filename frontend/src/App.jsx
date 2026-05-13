import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import Profile from './pages/Profile';
import WriteReview from './pages/WriteReview';
import Discover from './pages/Discover';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-white selection:bg-primary/30 selection:text-primary">
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<Search />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/review/:movieId" element={<WriteReview />} />
              </Routes>
            </main>
            <Toaster 
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#14181c',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
