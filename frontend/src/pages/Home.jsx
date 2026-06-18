import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

const Home = () => {
    const navigate = useNavigate();
    const [canteens, setCanteens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCanteens = async () => {
            try {
                const response = await api.get('/canteens');
                setCanteens(response.data);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to fetch canteens:", err);
                setError("Failed to load canteens. Please try again.");
                setIsLoading(false);
            }
        };

        fetchCanteens();
    }, []);

    return (
        <div className="flex flex-col pb-32 relative">

            {/* Content Canvas */}
            <main className="px-container-margin flex flex-col gap-lg w-full pt-4">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    </div>
                ) : error ? (
                    <div className="bg-error-container text-on-error-container p-4 rounded-xl text-center">
                        <p className="font-bold">{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-2 text-sm underline">Retry</button>
                    </div>
                ) : canteens.length === 0 ? (
                    <div className="text-center py-20 text-on-surface-variant">
                        <p>No canteens available right now.</p>
                    </div>
                ) : (
                    <section className="flex flex-col gap-md">
                        {canteens.map((canteen) => (
                            <article key={canteen.id} onClick={() => navigate(`/canteen/${canteen.id}`)} className="relative w-full h-[180px] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.2)] group cursor-pointer active:scale-[0.98] transition-transform duration-300">
                                <div 
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                                    style={{ backgroundImage: `url(${DEFAULT_IMAGE})` }}
                                ></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface/40 to-transparent"></div>
                                
                                <div className="absolute top-sm right-sm flex gap-xs">
                                    <span className={`${canteen.is_open ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-variant text-on-surface-variant border border-outline-variant/30'} font-label-sm text-label-sm px-3 py-1 rounded-full backdrop-blur-sm shadow-sm`}>
                                        {canteen.is_open ? 'Open' : 'Closed'}
                                    </span>
                                    <span className={`${canteen.is_open ? 'bg-surface-container-high/80 text-on-surface text-primary' : 'bg-error-container/80 text-on-error-container border-error/30'} backdrop-blur-md border border-outline-variant/30 font-label-sm text-label-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm`}>
                                        <span className="material-symbols-outlined text-[14px]" data-icon="schedule">schedule</span> 15m
                                    </span>
                                </div>
                                
                                <div className="absolute bottom-md left-md right-md">
                                    <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-xs drop-shadow-md">{canteen.name}</h2>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 capitalize">{canteen.slug.replace(/-/g, ' ')}</p>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
};

export default Home;
