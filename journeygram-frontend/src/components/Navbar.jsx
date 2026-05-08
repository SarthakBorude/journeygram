import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const links = [
        { path: '/', label: 'Home' },
        { path: '/generate', label: 'Generate Trip' },
        { path: '/my-trips', label: 'My Trips' },
        { path: '/explore', label: 'Explore' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                {/* Brand */}
                <Link to="/" className="text-xl font-bold text-blue-600">
                    Journeygram
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-1">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive(link.path)
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* User Info + Logout */}
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                        {user?.email}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
