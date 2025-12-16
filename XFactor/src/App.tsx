import { Box } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Import router components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookingPage from './pages/BookingPage'; // Import BookingPage

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<BookingPage />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;
