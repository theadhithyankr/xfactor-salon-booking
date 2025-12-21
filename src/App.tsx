import { Box } from '@mui/material';
import { NotificationProvider } from './context/NotificationContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookingPage from './pages/BookingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Salons from './pages/Salons';
import MyBookings from './pages/MyBookings';
import ManageServices from './pages/ManageServices';
import ManageSalons from './pages/ManageSalons';
import ManageWorkers from './pages/ManageWorkers';
import ManageContent from './pages/ManageContent';
import Footer from './components/Footer';

import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <NotificationProvider>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          minHeight: '100vh',
          color: 'text.primary'
        }}>
          <Navbar />
          <Box sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/book" element={<BookingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/salons" element={<Salons />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/admin/services" element={<ManageServices />} />
              <Route path="/admin/salons" element={<ManageSalons />} />
              <Route path="/admin/workers" element={<ManageWorkers />} />
              <Route path="/admin/content" element={<ManageContent />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
