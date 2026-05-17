import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const JoinCanvas = () => {
    const { token: inviteToken } = useParams();
    const { token: authToken } = useAuth();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [status, setStatus] = useState('loading'); // loading, preview, joining, success, error
    const [error, setError] = useState('');
    const [canvasInfo, setCanvasInfo] = useState(null);

    const isDark = theme === 'dark';

    // Fetch canvas info (public endpoint, no auth needed)
    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const res = await axiosInstance.get(`/api/canvas/invite-info/${inviteToken}`);
                setCanvasInfo(res.data);

                if (authToken) {
                    // Logged in — auto-join
                    setStatus('joining');
                    joinCanvas();
                } else {
                    // Not logged in — show preview
                    setStatus('preview');
                }
            } catch (err) {
                setStatus('error');
                setError('This invite link is invalid or has expired.');
            }
        };

        const joinCanvas = async () => {
            try {
                const response = await axiosInstance.post(`/api/canvas/join/${inviteToken}`);
                setStatus('success');
                setTimeout(() => {
                    navigate(`/canvas/${response.data.id}`);
                }, 1500);
            } catch (err) {
                setStatus('error');
                setError(err.response?.data?.message || 'Failed to join canvas.');
            }
        };

        fetchInfo();
    }, [inviteToken, authToken, navigate]);

    const handleJoin = () => {
        if (!authToken) {
            // Save the invite URL so they come back after login
            navigate('/login', { state: { from: `/canvas/join/${inviteToken}` } });
            return;
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center font-['Outfit'] px-6 ${isDark ? 'bg-[#09090b] text-white' : 'bg-[#fafafa] text-zinc-900'}`}>

            {/* Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] ${isDark ? 'bg-emerald-600/15' : 'bg-emerald-500/8'}`}></div>
                <div className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] ${isDark ? 'bg-sky-600/15' : 'bg-sky-500/8'}`}></div>
            </div>

            <div className="relative z-10 text-center max-w-lg w-full space-y-8">

                {/* Loading */}
                {status === 'loading' && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                        <p className={`text-sm font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Loading invite...</p>
                    </div>
                )}

                {/* Preview — not logged in */}
                {status === 'preview' && canvasInfo && (
                    <div className={`rounded-[2.5rem] p-10 md:p-12 border space-y-8 ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-zinc-100 shadow-2xl'}`}>
                        <div className="space-y-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-[0.3em] ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Trip Invitation
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">{canvasInfo.name}</h1>
                        </div>

                        <div className={`flex justify-center gap-6 text-xs font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {canvasInfo.startingLocation && (
                                <div className="flex items-center gap-1.5">
                                    <span>📍</span>
                                    <span>{canvasInfo.startingLocation}</span>
                                </div>
                            )}
                            {canvasInfo.startDate && (
                                <div className="flex items-center gap-1.5">
                                    <span>🗓️</span>
                                    <span>{canvasInfo.startDate} → {canvasInfo.endDate || '...'}</span>
                                </div>
                            )}
                        </div>

                        <div className={`flex justify-center gap-8 py-4 border-y ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{canvasInfo.memberCount}</div>
                                <div className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Members</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{canvasInfo.destinationCount}</div>
                                <div className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Destinations</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                Sign in or create a free account to join this trip and start collaborating!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={handleJoin}
                                    className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-xl ${isDark ? 'bg-white text-black hover:bg-emerald-400' : 'bg-zinc-900 text-white hover:bg-emerald-600'}`}
                                >
                                    🚀 Join This Trip
                                </button>
                                <Link
                                    to="/register"
                                    state={{ from: `/canvas/join/${inviteToken}` }}
                                    className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 border ${isDark ? 'border-white/10 text-white hover:border-emerald-500' : 'border-zinc-200 text-zinc-600 hover:border-emerald-500'}`}
                                >
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Joining */}
                {status === 'joining' && (
                    <div className="space-y-6">
                        <div className="w-16 h-16 mx-auto border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                        <h2 className="text-2xl font-bold tracking-tight">Joining {canvasInfo?.name || 'Canvas'}...</h2>
                        <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Hang tight, we're adding you to the trip.</p>
                    </div>
                )}

                {/* Success */}
                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="text-6xl">🎉</div>
                        <h2 className="text-2xl font-bold tracking-tight text-emerald-500">You're In!</h2>
                        <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            Welcome to <span className="font-bold">{canvasInfo?.name}</span>. Redirecting to the canvas...
                        </p>
                    </div>
                )}

                {/* Error */}
                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="text-6xl">😕</div>
                        <h2 className="text-2xl font-bold tracking-tight text-red-500">Couldn't Join</h2>
                        <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{error}</p>
                        <button
                            onClick={() => navigate('/')}
                            className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${isDark ? 'bg-white text-black hover:bg-emerald-400' : 'bg-zinc-900 text-white hover:bg-emerald-600'}`}
                        >
                            Go Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JoinCanvas;
