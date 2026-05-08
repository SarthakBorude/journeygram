import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import GenerateTrip from './pages/GenerateTrip';
import MyTrips from './pages/MyTrips';
import Explore from './pages/Explore';
import TripDetail from './pages/TripDetail';
import SharedTrip from './pages/SharedTrip';

const ProtectedRoute = () => {
    const { token } = useAuth();
    if (!token) return <Navigate to="/login" />;
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/share/:token" element={<SharedTrip />} />

                {/* Protected routes — all get the Navbar */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/generate" element={<GenerateTrip />} />
                    <Route path="/my-trips" element={<MyTrips />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/trip/:id" element={<TripDetail />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;