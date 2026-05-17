import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyTrips from './pages/MyTrips';
import Explore from './pages/Explore';
import DestinationInfo from './pages/DestinationInfo';
import Profile from './pages/Profile';
import CreateCanvas from './pages/CreateCanvas';
import TripCanvas from './pages/TripCanvas';
import JoinCanvas from './pages/JoinCanvas';
import SharedTrip from './pages/SharedTrip';

const ProtectedRoute = () => {
    const { token } = useAuth();
    if (!token) return <Navigate to="/login" />;
    return <Outlet />;
};

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/canvas/join/:token" element={<JoinCanvas />} />
                <Route path="/canvas/view/:token" element={<SharedTrip />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/my-trips" element={<MyTrips />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/destination/:name" element={<DestinationInfo />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/canvas/new" element={<CreateCanvas />} />
                    <Route path="/canvas/:id" element={<TripCanvas />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;