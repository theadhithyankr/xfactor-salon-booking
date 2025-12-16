import { Box } from '@mui/material';
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

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
        <Navbar />
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
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;
