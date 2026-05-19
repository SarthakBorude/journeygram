import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axiosInstance from '../api/axiosInstance';
import postcardImg from '../assets/postcard.png';

const Home = () => {
    const { token } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [activeRegion, setActiveRegion] = useState('regional'); // 'regional' (default first) or 'global'
    const [displayedDestinations, setDisplayedDestinations] = useState([]);
    const [loadingTrending, setLoadingTrending] = useState(true);
    const [fade, setFade] = useState(false);

    const globalPool = [
        {
            name: "Tokyo",
            description: "Neon lit streets, historic temples, and world-class culinary highlights in Japan.",
            imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=600",
            views: 452
        },
        {
            name: "Rome",
            description: "Timeless archaeological marvels, Vatican City, and unmatched Italian dining culture.",
            imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=600",
            views: 312
        },
        {
            name: "Zurich",
            description: "Sparkling blue alpine lakes, high-end design culture, and Swiss mountain escapades.",
            imageUrl: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?q=80&w=600",
            views: 284
        },
        {
            name: "Paris",
            description: "World-famous museums, romantic bridges, haute cuisine, and fine French fashion.",
            imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600",
            views: 398
        },
        {
            name: "London",
            description: "Royal parks, historic towers, classic architecture, and modern Thames-side design.",
            imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=600",
            views: 215
        },
        {
            name: "Bali",
            description: "Tropical beaches, volcanic peaks, sacred temples, and beautiful ocean shores.",
            imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600",
            views: 189
        },
        {
            name: "New York",
            description: "Soaring skyscrapers, broadway shows, bustling times square, and central park walks.",
            imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=600",
            views: 524
        },
        {
            name: "Sydney",
            description: "The iconic Opera House, pristine Harbour waters, and beautiful golden beaches.",
            imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=600",
            views: 341
        },
        {
            name: "Cairo",
            description: "Ancient pyramids of Giza, historic Nile river cruises, and rich Egyptian legends.",
            imageUrl: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=600",
            views: 276
        },
        {
            name: "Cape Town",
            description: "Majestic Table Mountain views, historic vineyards, and gorgeous coastal cliffs.",
            imageUrl: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=600",
            views: 254
        },
        {
            name: "Rio de Janeiro",
            description: "Vibrant carnivals, massive Copacabana sands, and the iconic Christ Redeemer statue.",
            imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=600",
            views: 198
        },
        {
            name: "Dubai",
            description: "Futuristic skyscrapers, massive luxury malls, and beautiful desert safari sands.",
            imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600",
            views: 489
        },
        {
            name: "Barcelona",
            description: "Whimsical Gaudi architecture, sunny sandy beaches, and legendary tapas culture.",
            imageUrl: "https://images.unsplash.com/photo-1464790719320-516ecd75af6c?q=80&w=600",
            views: 329
        },
        {
            name: "Amsterdam",
            description: "Cozy historic brick townhouses, scenic canal boats, and beautiful tulip displays.",
            imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600",
            views: 281
        },
        {
            name: "Singapore",
            description: "Futuristic greenhouse biodomes, vibrant street food stalls, and clean bay gardens.",
            imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=600",
            views: 407
        }
    ];

    const regionalPool = [
        {
            name: "Goa",
            description: "Golden sand beaches, ancient Portuguese cathedrals, and vibrant coastal shacks.",
            imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=600",
            views: 412
        },
        {
            name: "Jaipur",
            description: "Majestic palace fortresses, pink sandstone gates, and rich royal heritage.",
            imageUrl: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=600",
            views: 356
        },
        {
            name: "Kerala",
            description: "Serene backwaters, slow houseboat cruises, palm groves, and spice plantations.",
            imageUrl: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=600",
            views: 298
        },
        {
            name: "Ladakh",
            description: "Breathtaking high-altitude cold deserts, crystal blue lakes, and monasteries.",
            imageUrl: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600",
            views: 265
        },
        {
            name: "Agra",
            description: "The magnificent Taj Mahal, Mughal marble architecture, and Yamuna riverbanks.",
            imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=600",
            views: 521
        },
        {
            name: "Manali",
            description: "Snowy Himalayan valley peaks, apple orchards, and adventurous river sports.",
            imageUrl: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=600",
            views: 324
        },
        {
            name: "Mumbai",
            description: "The iconic Gateway of India, sea link suspension bridge, and historic train terminals.",
            imageUrl: "https://images.unsplash.com/photo-1562979314-bee7453e911c?q=80&w=600",
            views: 485
        },
        {
            name: "Delhi",
            description: "Ancient Red Fort architecture, bustling spice lanes, and green embassy parks.",
            imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=600",
            views: 512
        },
        {
            name: "Varanasi",
            description: "Spiritual river ghat fires, chanting ceremonies, and ancient stone alleyways.",
            imageUrl: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=600",
            views: 247
        },
        {
            name: "Hampi",
            description: "Enchanting boulder-strewn landscape, ancient stone ruins, and historical carvings.",
            imageUrl: "https://images.unsplash.com/photo-1600100398055-124fe77a552e?q=80&w=600",
            views: 189
        },
        {
            name: "Udaipur",
            description: "Stunning floating Lake Palace, scenic royal boat rides, and white marble terraces.",
            imageUrl: "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?q=80&w=600",
            views: 310
        },
        {
            name: "Darjeeling",
            description: "Lush green rolling tea fields, heritage toy train routes, and Himalayan sunrises.",
            imageUrl: "https://images.unsplash.com/photo-1626082895617-2c6de3476af7?q=80&w=600",
            views: 231
        },
        {
            name: "Shimla",
            description: "Colonial British pine architecture, mountain view ridges, and dense fir forests.",
            imageUrl: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=600",
            views: 294
        },
        {
            name: "Rishikesh",
            description: "Sacred Ganges suspension bridges, white water rafting currents, and yoga ashrams.",
            imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600",
            views: 367
        },
        {
            name: "Srinagar",
            description: "Tranquil Dal Lake wooden shikar houseboats, floating gardens, and historic peaks.",
            imageUrl: "https://images.unsplash.com/photo-1566228015668-4c45dbc4e2db?q=80&w=600",
            views: 285
        }
    ];

    const shuffleArray = (array) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    const loadDestinations = (region, poolToUse = null) => {
        setFade(true);
        setTimeout(() => {
            const currentPool = poolToUse || (region === 'global' ? globalPool : regionalPool);
            // Shuffle and pick 4
            const shuffled = shuffleArray(currentPool);
            setDisplayedDestinations(shuffled.slice(0, 4));
            setFade(false);
        }, 200);
    };

    const fetchTrending = async () => {
        try {
            setLoadingTrending(true);
            const res = await axiosInstance.get("/api/destinations/trending");
            
            if (res.data && res.data.length >= 2) {
                // Classify backend fetched items by matching name against regional keywords
                const regionalNames = regionalPool.map(r => r.name.toLowerCase());
                
                const fetchedGlobal = [];
                const fetchedRegional = [];
                
                res.data.forEach(item => {
                    const parsedItem = {
                        name: item.name,
                        description: item.description || "Browse sights, food spots, and detailed local itineraries.",
                        imageUrl: item.imageUrl,
                        views: item.searchCount || Math.floor(Math.random() * 100) + 10
                    };
                    
                    if (regionalNames.includes(item.name.toLowerCase())) {
                        fetchedRegional.push(parsedItem);
                    } else {
                        fetchedGlobal.push(parsedItem);
                    }
                });

                // Pad our global and regional pools with unique elements from backend
                const finalGlobal = [...fetchedGlobal, ...globalPool.filter(g => !fetchedGlobal.some(f => f.name.toLowerCase() === g.name.toLowerCase()))];
                const finalRegional = [...fetchedRegional, ...regionalPool.filter(r => !fetchedRegional.some(f => f.name.toLowerCase() === r.name.toLowerCase()))];
                
                const targetPool = activeRegion === 'global' ? finalGlobal : finalRegional;
                loadDestinations(activeRegion, targetPool);
            } else {
                loadDestinations(activeRegion);
            }
        } catch (err) {
            console.error("Failed to fetch trending destinations, using fallback pools", err);
            loadDestinations(activeRegion);
        } finally {
            setLoadingTrending(false);
        }
    };

    useEffect(() => {
        fetchTrending();
    }, []);

    const handleRegionChange = (region) => {
        if (region === activeRegion) return;
        setActiveRegion(region);
        loadDestinations(region);
    };

    return (
        <div
            className={`min-h-screen overflow-x-hidden relative transition-all duration-700 ${isDark
                ? "bg-[#09090b]"
                : "bg-[radial-gradient(circle_at_top,#faf8ff_0%,#f3eff9_45%,#ebe4f6_100%)]"
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

            {/* Bullet Journal Dot Grid Backdrop */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] dark:bg-[radial-gradient(#a78bfa_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.05] dark:opacity-[0.03] z-0" />

            {/* Luxury Ambient Glows */}
            <div className="pointer-events-none absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-300/20 dark:bg-violet-900/10 blur-[150px] z-0" />
            <div className="pointer-events-none absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-300/10 dark:bg-indigo-900/5 blur-[120px] z-0" />

            {/* Flight Route Dashed Path & Compass Backdrop */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none">
                {/* Curved Journey Path */}
                <svg className="absolute w-full h-[800px] top-[10%] left-0 opacity-[0.12] dark:opacity-[0.08] text-violet-600 dark:text-violet-400" viewBox="0 0 1440 800" fill="none">
                    <path
                        d="M-50,600 C300,550 500,200 800,350 C1100,500 1200,150 1500,100"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeDasharray="8 8"
                    />
                    {/* Paper Airplane along the path */}
                    <g transform="translate(800, 350) rotate(15)">
                        <path
                            d="M0,0 L-12,-4 L-10,-1 L-15,1 L0,0 M-10,-1 L-12,-4 M-10,-1 L-15,1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="currentColor"
                            fillOpacity="0.2"
                        />
                    </g>
                </svg>

                {/* Decorative Compass Rose in top-left */}
                <svg className="absolute left-[3%] top-[15%] w-36 h-36 opacity-[0.05] dark:opacity-[0.03] text-violet-600 dark:text-violet-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="50" cy="50" r="40" strokeDasharray="2 2" />
                    <circle cx="50" cy="50" r="45" />
                    <path d="M50,10 L50,90 M10,50 L90,50 M22,22 L78,78 M22,78 L78,22" />
                    <polygon points="50,10 53,40 50,50 47,40" fill="currentColor" />
                    <polygon points="50,90 53,60 50,50 47,60" fill="currentColor" />
                    <polygon points="90,50 60,53 50,50 60,47" fill="currentColor" />
                    <polygon points="10,50 40,53 50,50 40,47" fill="currentColor" />
                    <text x="48" y="8" className="text-[6px] font-bold fill-currentColor stroke-none">N</text>
                </svg>
            </div>

            <main className="relative z-10 max-w-[1500px] mx-auto px-8 xl:px-16 pt-28 pb-24">

                {/* HERO */}
                <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20 items-center">

                    {/* LEFT */}
                    <div className="space-y-12">

                        {/* Tag */}
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/60 border border-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(120,90,60,0.05)]">
                            <span className="text-[11px] tracking-[0.25em] uppercase font-semibold text-[#8f79ff]">
                                ✦ AI-Powered Exploration
                            </span>
                        </div>

                        {/* Heading */}
                        <div className="space-y-4 relative z-20">

                            <h1 className="leading-[0.88] tracking-[-0.08em] text-[#171717] dark:text-[#f8f4ef] font-extrabold text-[3.25rem] sm:text-[4.5rem] lg:text-[5rem] xl:text-[6.2rem] transition-colors duration-500">
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

                            <p className="max-w-sm text-[1.08rem] leading-[1.9] text-[#6f6a67] dark:text-[#a19d9b] font-medium transition-colors duration-500">
                                Stop planning, start experiencing. Your AI companion
                                for bespoke travel narratives and unforgettable journeys.
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="space-y-8">

                            <Link
                                to={token ? "/canvas/new" : "/login"}
                                className="group relative inline-flex items-center gap-5 px-8 py-4 rounded-full bg-white/75 dark:bg-white/10 backdrop-blur-xl border border-white/80 dark:border-white/20 shadow-[0_10px_40px_rgba(120,90,60,0.08)] transition-all duration-500 hover:bg-white dark:hover:bg-white/20 hover:scale-105 hover:shadow-[0_15px_50px_rgba(143,121,255,0.25)] z-20"
                            >
                                <span className="text-[15px] font-semibold tracking-wide text-[#171717] dark:text-white transition-colors">
                                    Begin Your Journey
                                </span>

                                <div className="w-10 h-10 rounded-full bg-[#8b5cf6] dark:bg-[#7c3aed] flex items-center justify-center text-white">
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
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="relative flex justify-center">

                        <div className="relative w-full max-w-[760px]">

                            {/* Main Postcard */}
                            <div className="relative z-20 rotate-[-2deg] translate-y-0 lg:-translate-y-40 transition-transform duration-300 hover:rotate-[-2deg]">
                                <img
                                    src={postcardImg}
                                    alt="Kyoto Journey"
                                    className="drop-shadow-2xl"
                                />
                            </div>

                            {/* Ticket */}
                            <div className="absolute left-1/2 -translate-x-1/2 xs:left-[7%] xs:translate-x-0 bottom-[-15%] xs:bottom-[0%] z-30 rotate-[6deg] w-[280px] xs:w-[320px] sm:w-[380px] hover:z-50 hover:scale-105 hover:rotate-[3deg] transition-all duration-300">

                                <div className="rounded-xl overflow-hidden bg-white/90 dark:bg-[#1a1a1f]/90 backdrop-blur-md shadow-[0_15px_45px_rgba(139,92,246,0.15)] border border-white/40 dark:border-white/10">

                                    {/* Top */}
                                    <div className="bg-[#8b5cf6] px-5 py-2.5 flex justify-between items-center text-white">

                                        <span className="text-[9px] tracking-[0.2em] uppercase font-bold">
                                            Boarding Pass
                                        </span>

                                        <span className="text-[9px] opacity-75 font-semibold">JG 108</span>
                                    </div>

                                    {/* Main */}
                                    <div className="flex items-center justify-between px-6 py-5">

                                        <div>
                                            <p className="text-[8px] tracking-[0.25em] text-[#8f8b9e] dark:text-[#a19d9b] uppercase mb-0.5 font-bold">
                                                From
                                            </p>

                                            <h3 className="text-3xl font-bold tracking-tight text-[#1e1b4b] dark:text-[#f8f4ef]">
                                                DEL
                                            </h3>
                                        </div>

                                        <div className="text-[#8b5cf6] text-lg select-none px-2">✈</div>

                                        <div>
                                            <p className="text-[8px] tracking-[0.25em] text-[#8f8b9e] dark:text-[#a19d9b] uppercase mb-0.5 font-bold">
                                                To
                                            </p>

                                            <h3 className="text-3xl font-bold tracking-tight text-[#1e1b4b] dark:text-[#f8f4ef]">
                                                KIX
                                            </h3>
                                        </div>

                                    </div>

                                    {/* Ticket Stub Divider Line */}
                                    <div className="border-t border-dashed border-[#e6e2f0] dark:border-white/10 mx-6"></div>

                                    {/* Bottom details */}
                                    <div className="flex justify-between px-6 py-3.5 text-[9px] font-semibold text-[#8f8b9e] dark:text-[#a19d9b]">
                                        <div>
                                            <span className="block text-[7px] uppercase tracking-wider text-[#b4afc4] mb-0.5">Seat</span>
                                            <span className="text-[#1e1b4b] dark:text-[#f8f4ef] font-bold">12A</span>
                                        </div>
                                        <div>
                                            <span className="block text-[7px] uppercase tracking-wider text-[#b4afc4] mb-0.5">Gate</span>
                                            <span className="text-[#1e1b4b] dark:text-[#f8f4ef] font-bold">B04</span>
                                        </div>
                                        <div>
                                            <span className="block text-[7px] uppercase tracking-wider text-[#b4afc4] mb-0.5">Boarding</span>
                                            <span className="text-[#8b5cf6] font-bold">18:45</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Polaroid Strip */}
                            <div className="hidden md:block absolute right-[-5%] bottom-[40%] z-40 rotate-[-9deg] bg-white/95 dark:bg-white/95 backdrop-blur-xl p-2.5 pb-5 rounded-xs shadow-[0_15px_45px_rgba(139,92,246,0.15)] border border-white/50 dark:border-white/10 hover:z-50 hover:scale-105 hover:rotate-[-2deg] transition-all duration-300 select-none">

                                <div className="flex gap-2">

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
                                        <div key={i} className="w-[120px] flex flex-col items-center">

                                            <div className="w-full aspect-[4/3] overflow-hidden rounded-[1px] border border-neutral-200/50 dark:border-neutral-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                                                <img
                                                    src={p.img}
                                                    alt=""
                                                    className="w-full h-full object-cover grayscale-[10%] contrast-[103%]"
                                                />
                                            </div>

                                            <p
                                                className="text-[#8b5cf6] dark:text-[#a78bfa] text-[11px] font-bold mt-1.5 leading-none"
                                                style={{
                                                    fontFamily: "Allura, cursive",
                                                }}
                                            >
                                                Day {i + 1}
                                            </p>

                                            <p className="text-[9px] font-bold text-[#1e1b4b] dark:text-neutral-200 leading-tight tracking-tight whitespace-nowrap overflow-hidden text-ellipsis w-full text-center mt-0.5">
                                                {p.title}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Vintage Arrival Stamp */}
                            <div className="hidden sm:block absolute right-[1%] top-[-15%] z-50 opacity-80 rotate-[-15deg] hover:scale-110 hover:rotate-[-10deg] transition-all duration-300 pointer-events-none select-none">
                                <div className="w-24 h-24 rounded-full border-2 border-dashed border-violet-600/70 dark:border-violet-400/70 flex items-center justify-center text-violet-600/90 dark:text-violet-400/90 p-1">
                                    <div className="w-full h-full rounded-full border border-solid border-violet-600/50 dark:border-violet-400/50 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-[9px] tracking-[0.3em] uppercase font-black">
                                                Kyoto
                                            </p>

                                            <p className="text-[7px] tracking-[0.15em] uppercase font-bold mt-0.5">
                                                Arrival
                                            </p>

                                            <div className="border-t border-violet-600/30 dark:border-violet-400/30 my-0.5 w-8 mx-auto"></div>

                                            <p className="text-[6.5px] font-bold tracking-wider">
                                                24 MAY 2026
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* TRENDING DESTINATIONS SECTION */}
                <div className="mt-36">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                        
                        {/* Title details */}
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-violet-400/10 border border-indigo-500/20 dark:border-violet-400/20">
                                <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-indigo-600 dark:text-violet-300">
                                    ✦ Global Inspiration Feed
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-zinc-950 dark:text-white">
                                Trending Escapes
                            </h2>
                            <p className={`text-sm font-semibold max-w-lg ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                Handpicked escapes curated for the modern traveler. Click to view custom coordinates and sights.
                            </p>
                        </div>

                        {/* Interactive Pill switch (Regional first, Global second) */}
                        <div className="flex items-center gap-4">
                            <div className="inline-flex p-1 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/50 dark:border-white/10 select-none">
                                <button 
                                    onClick={() => handleRegionChange('regional')}
                                    className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                                        activeRegion === 'regional'
                                            ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                                    }`}
                                >
                                    Regional
                                </button>
                                <button 
                                    onClick={() => handleRegionChange('global')}
                                    className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                                        activeRegion === 'global'
                                            ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                                    }`}
                                >
                                    Global
                                </button>
                            </div>
                        </div>
                    </div>

                    {loadingTrending ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="space-y-6">
                                    <div className={`aspect-[3.2/4] rounded-[2rem] animate-pulse ${isDark ? "bg-zinc-900/60" : "bg-zinc-200/50"}`}></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-300 ${
                            fade ? 'opacity-30 translate-y-2' : 'opacity-100 translate-y-0'
                        }`}>
                            {displayedDestinations.map((dest, idx) => (
                                <Link 
                                    key={idx} 
                                    to={`/destination/${dest.name}`} 
                                    className="group relative block aspect-[3.2/4] rounded-[2rem] overflow-hidden border border-white/20 dark:border-white/10 shadow-lg hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(143,121,255,0.15)] transition-all duration-500 ease-out"
                                >
                                    {/* Image background frame */}
                                    <img 
                                        src={dest.imageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600"} 
                                        alt={dest.name} 
                                        className="absolute inset-0 w-full h-full object-cover grayscale-[12%] group-hover:grayscale-0 group-hover:scale-110 transition-transform duration-[1200ms] ease-out z-0" 
                                    />
                                    
                                    {/* Rich darken gradient scrim */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />

                                    {/* Popularity views tag (top-left) */}
                                    <div className="absolute top-5 left-5 z-20">
                                        <div className="px-3 py-1 bg-black/60 backdrop-blur rounded-xl text-[8px] font-black uppercase tracking-wider text-white border border-white/10">
                                            ✈ {dest.views ? `${dest.views} Views` : 'Community Pick'}
                                        </div>
                                    </div>

                                    {/* Overlaid details card info (bottom) */}
                                    <div className="absolute bottom-0 left-0 w-full p-6 space-y-2 text-white z-20">
                                        <h3 className="text-2xl font-extrabold tracking-tight group-hover:text-violet-300 transition-colors duration-300">
                                            {dest.name}
                                        </h3>
                                        
                                        <p className="text-[11px] font-semibold opacity-75 line-clamp-2 transition-opacity duration-300 group-hover:opacity-100">
                                            {dest.description}
                                        </p>
                                        
                                        <div className="pt-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-violet-300 inline-block group-hover:translate-x-1 transition-transform duration-300">
                                                Explore Guide →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Home;
