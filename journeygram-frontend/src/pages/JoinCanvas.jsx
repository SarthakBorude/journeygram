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

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const res = await axiosInstance.get(`/api/canvas/invite-info/${inviteToken}`);
                setCanvasInfo(res.data);

                if (authToken) {
                    setStatus('joining');
                    joinCanvas();
                } else {
                    setStatus('preview');
                }
            } catch (err) {
                setStatus('error');
                setError('Invite link has expired or is invalid.');
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
                setError(err.response?.data?.message || 'Failed to register with co-author board.');
            }
        };

        fetchInfo();
    }, [inviteToken, authToken, navigate]);

    const handleJoin = () => {
        if (!authToken) {
            navigate('/login', { state: { from: `/canvas/join/${inviteToken}` } });
            return;
        }
    };

    return (
        <div className={`min-h-screen pt-28 md:pt-40 pb-16 md:pb-24 relative overflow-hidden transition-all duration-700 ${
            isDark 
                ? "bg-[#09090b]" 
                : "bg-[radial-gradient(circle_at_top,#faf8ff_0%,#f3eff9_45%,#ebe4f6_100%)]"
        }`}>
            {/* Ambient Lighting Background */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-400/10 dark:bg-violet-950/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] left-[-15%] w-[600px] h-[600px] rounded-full bg-indigo-300/10 dark:bg-indigo-950/5 blur-[140px] pointer-events-none" />

            <div className="max-w-md mx-auto px-6 relative z-10">
                
                <div className={`p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] text-center ${
                    isDark ? "glass-premium-dark" : "glass-premium-light"
                } border shadow-lg`}>

                    {/* ── LOADING STATE ── */}
                    {status === 'loading' && (
                        <div className="flex flex-col items-center py-10 space-y-4">
                            <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-800 dark:border-zinc-700 dark:border-t-white rounded-full animate-spin"></div>
                            <span className={`text-xs font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Locating Blueprint...</span>
                        </div>
                    )}

                    {/* ── PREVIEW STATE (GUEST) ── */}
                    {status === 'preview' && canvasInfo && (
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-violet-400/10 border border-indigo-500/20 dark:border-violet-400/20">
                                    <span className="text-[9px] tracking-wider uppercase font-bold text-indigo-600 dark:text-violet-300">
                                        ✦ Co-Pilot Invite
                                    </span>
                                </div>
                                <h1 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white leading-tight">
                                    {canvasInfo.name}
                                </h1>
                                <p className={`text-xs font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                    You have been dispatched an invite to collaborate and co-pilot this digital travel scrapbook.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-2xl border ${
                                    isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200/50'
                                }`}>
                                    <div className="text-2xl font-black text-zinc-950 dark:text-white">{canvasInfo.memberCount}</div>
                                    <div className={`text-[8.5px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Members</div>
                                </div>
                                <div className={`p-4 rounded-2xl border ${
                                    isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200/50'
                                }`}>
                                    <div className="text-2xl font-black text-zinc-950 dark:text-white">{canvasInfo.destinationCount}</div>
                                    <div className={`text-[8.5px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Stops</div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/40">
                                <button
                                    onClick={handleJoin}
                                    className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest cursor-pointer transition-all hover:scale-105 active:scale-98 shadow-sm ${
                                        isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-950 text-white hover:bg-zinc-800'
                                    }`}
                                >
                                    Accept Flight Invite
                                </button>
                                
                                <Link
                                    to="/register"
                                    state={{ from: `/canvas/join/${inviteToken}` }}
                                    className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest block transition-all border ${
                                        isDark ? 'hover:bg-zinc-900 text-zinc-300 border-zinc-850' : 'hover:bg-zinc-50 text-zinc-600 border-zinc-200'
                                    }`}
                                >
                                    Register New Credentials
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* ── JOINING STATE ── */}
                    {status === 'joining' && (
                        <div className="flex flex-col items-center py-10 space-y-6">
                            <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-800 dark:border-zinc-700 dark:border-t-white rounded-full animate-spin"></div>
                            <h2 className="text-xl font-black tracking-tight text-zinc-950 dark:text-white">Linking Credentials...</h2>
                        </div>
                    )}

                    {/* ── SUCCESS STATE ── */}
                    {status === 'success' && (
                        <div className="flex flex-col items-center py-10 space-y-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center text-xl font-black">✓</div>
                            <h2 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">Credentials Linked</h2>
                            <p className={`text-xs font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Dispatching you to the active board canvas...</p>
                        </div>
                    )}

                    {/* ── ERROR STATE ── */}
                    {status === 'error' && (
                        <div className="flex flex-col items-center py-8 space-y-6">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center text-xl font-black">✕</div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">Invalid Boarding Pass</h2>
                                <p className={`text-xs font-semibold max-w-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{error}</p>
                            </div>
                            
                            <button
                                onClick={() => navigate('/')}
                                className={`px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest cursor-pointer transition-all hover:scale-105 active:scale-98 shadow-sm ${
                                    isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-950 text-white hover:bg-zinc-800'
                                }`}
                            >
                                Return Home
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JoinCanvas;
