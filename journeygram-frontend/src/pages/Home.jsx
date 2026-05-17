import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import postcardImg from '../assets/postcard.png';

const Home = () => {
    const { token } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const categories = [
        { name: 'Snowy mountains', icon: '🏔️' },
        { name: 'Cultural cities', icon: '🏛️' },
        { name: 'Beach relaxation', icon: '🏖️' },
        { name: 'Food & cafes', icon: '☕' }
    ];

    const features = [
        { title: 'AI Crafted Itineraries', desc: 'Personalized to you', icon: '✨' },
        { title: 'Hidden Gems', desc: 'Beyond the tourist path', icon: '💎' },
        { title: 'Smart Budgeting', desc: 'Trips that make sense', icon: '💰' },
        { title: 'Real Experiences', desc: 'Local stories, not generic', icon: '🧡' }
    ];


    return (
        <div
            className={`min-h-screen overflow-x-hidden transition-all duration-700 ${isDark
                ? "bg-[#09090b]"
                : "bg-[radial-gradient(circle_at_top,#fffdf8_0%,#f8f4ef_45%,#f5f0f7_100%)]"
                }`}
        >
            {/* Ambient Texture */}
            <div className="pointer-events-none fixed inset-0 opacity-[0.035] mix-blend-multiply">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
                    }}
                />
            </div>

            <main className="relative z-10 max-w-[1500px] mx-auto px-8 xl:px-16 pt-28 pb-24">

                {/* HERO */}
                <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-20 items-center">

                    {/* LEFT */}
                    <div className="space-y-12">

                        {/* Tag */}
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/60 border border-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(120,90,60,0.05)]">
                            <span className="text-[11px] tracking-[0.25em] uppercase font-semibold text-[#8f79ff]">
                                ✦ AI-Powered Exploration
                            </span>
                        </div>

                        {/* Heading */}
                        <div className="space-y-4">

                            <h1 className="leading-[0.88] tracking-[-0.08em] text-[#171717] font-extrabold text-[5rem] xl:text-[6.2rem]">
                                Escape
                                <br />

                                <span
                                    className="block text-[#9f85ff] italic font-normal"
                                    style={{
                                        fontFamily: "Allura, cursive",
                                        letterSpacing: "0",
                                    }}
                                >
                                    the
                                </span>

                                Ordinary.
                            </h1>

                            <p className="max-w-sm text-[1.08rem] leading-[1.9] text-[#6f6a67] font-medium">
                                Stop planning, start experiencing. Your AI companion
                                for bespoke travel narratives and unforgettable journeys.
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="space-y-8">

                            <Link
                                to={token ? "/canvas/new" : "/login"}
                                className="group inline-flex items-center gap-5 px-8 py-4 rounded-full bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_10px_40px_rgba(120,90,60,0.08)] transition-all duration-500 hover:bg-white"
                            >
                                <span className="text-[15px] font-semibold tracking-wide text-[#171717]">
                                    Begin Your Journey
                                </span>

                                <div className="w-10 h-10 rounded-full bg-[#f08a5d] flex items-center justify-center text-white">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2.5"
                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                        />
                                    </svg>
                                </div>
                            </Link>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-3 max-w-md">

                                {categories.map((cat) => (
                                    <button
                                        key={cat.name}
                                        className="px-5 py-2.5 rounded-full bg-white/55 backdrop-blur-lg border border-white/70 text-[12px] font-medium text-[#6f6a67] shadow-[0_6px_20px_rgba(0,0,0,0.04)] hover:bg-white transition-all"
                                    >
                                        {cat.icon} {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="relative flex justify-center">

                        <div className="relative w-full max-w-[760px] ">

                            {/* Main Postcard */}
                            <div className="relative z-20 rotate-[-4deg] -translate-y-30">


                                <img
                                    src={postcardImg}
                                    alt="Kyoto Journey"
                                    className=""
                                />
                            </div>

                            {/* Ticket */}
                            <div className="absolute left-[10%] bottom-[-30%] z-30 rotate-[8deg] w-[420px]">

                                <div className="rounded-[1.2rem] overflow-hidden bg-[#fffdf9] shadow-[0_20px_70px_rgba(80,60,40,0.12)] border border-[#f3eee8]">

                                    {/* Top */}
                                    <div className="bg-[#a28bff] px-6 py-3 flex justify-between items-center text-white">

                                        <span className="text-[10px] tracking-[0.2em] uppercase font-semibold">
                                            JourneyGram Airlines
                                        </span>

                                        <span className="opacity-50">•••</span>
                                    </div>

                                    {/* Main */}
                                    <div className="flex items-center justify-between px-8 py-8">

                                        <div>
                                            <p className="text-[10px] tracking-[0.2em] text-[#999] uppercase mb-1">
                                                From
                                            </p>

                                            <h3 className="text-5xl font-light tracking-tight text-[#171717]">
                                                DEL
                                            </h3>
                                        </div>

                                        <div className="text-[#999] text-xl">✈</div>

                                        <div>
                                            <p className="text-[10px] tracking-[0.2em] text-[#999] uppercase mb-1">
                                                To
                                            </p>

                                            <h3 className="text-5xl font-light tracking-tight text-[#171717]">
                                                KIX
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Polaroid Strip */}
                            <div className="absolute right-[-2%] bottom-[8%] z-40 rotate-[-8deg] bg-white/92 backdrop-blur-xl p-4 pb-8 rounded-[1rem] shadow-[0_20px_60px_rgba(80,60,40,0.12)] border border-white">

                                <div className="flex gap-3">

                                    {[
                                        {
                                            img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=300",
                                            title: "Historic Streets",
                                        },
                                        {
                                            img: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=300",
                                            title: "Bamboo Forest",
                                        },
                                        {
                                            img: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?q=80&w=300",
                                            title: "Hidden Cafés",
                                        },
                                    ].map((p, i) => (
                                        <div key={i} className="w-[110px]">

                                            <div className="overflow-hidden rounded-xl aspect-[4/3] mb-3">
                                                <img
                                                    src={p.img}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <p
                                                className="text-[#f08a5d] text-[13px]"
                                                style={{
                                                    fontFamily: "Allura, cursive",
                                                }}
                                            >
                                                Day {i + 1}
                                            </p>

                                            <p className="text-[12px] font-semibold text-[#171717] leading-tight">
                                                {p.title}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            {/* Stamp */}
                            <div className="absolute right-[-8%] bottom-[-8%] z-50 opacity-70 rotate-[10deg]">

                                <div className="w-36 h-36 rounded-full border-2 border-[#ef8b62] flex items-center justify-center text-[#ef8b62]">

                                    <div className="text-center">

                                        <p className="text-[13px] tracking-[0.35em] uppercase font-bold">
                                            Kyoto
                                        </p>

                                        <p className="text-[11px] tracking-[0.2em] uppercase mt-1">
                                            Arrival
                                        </p>

                                        <p className="text-[10px] mt-2">
                                            24 MAY 2026
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FEATURES */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-36">

                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="rounded-[2rem] p-8 bg-white/45 backdrop-blur-xl border border-white/70 shadow-[0_10px_40px_rgba(80,60,40,0.05)]"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-[#faf6f1] flex items-center justify-center text-2xl mb-5">
                                {f.icon}
                            </div>

                            <h4 className="text-[15px] font-semibold text-[#171717] mb-2">
                                {f.title}
                            </h4>

                            <p className="text-[13px] leading-relaxed text-[#7b7671]">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );


};

export default Home;
