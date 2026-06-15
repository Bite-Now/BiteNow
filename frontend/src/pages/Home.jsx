import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../components/common/ProfileDropdown';

const CANTEENS = [
    {
        id: 1,
        name: 'Ashapura',
        description: 'Fast Food & Beverages',
        status: 'Open',
        waitTime: '5m',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiiRyaUG2EY5bBNGp3w2PeaGA1bi9vY86lS5NbkU6sZqzI1EGi-sPj5idsebLR54EczS81Ld8NgDK3Ks2OMOT8Un5b3sSePNnINdf8wSttxkavQuwx9uyqg5rQZ4fBczAPugsmqeHdaogx0q36OKfyZ_HObzBRHSVUwU0CShXRjQTvJLKOHQM6cxHZOgTivZHKJP-DY93HJIAgXiSwY8yfgzcaahS_RN1w4YnijNrri8sVxqqz13rPRoe8jqY2S1UuJ8e4YBQ4tg0'
    },
    {
        id: 2,
        name: 'Laxmi',
        description: 'Authentic Thalis & Snacks',
        status: 'Open',
        waitTime: '15m',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzB6LG8Tmlzxz57nbPVPqQ4lF2lacdFU_asVLNIdo6oSufw_GdXN-ZpF0rYDmCrj6UrtahKRVxVZWjW_UXjdmYCzOY5shT6SuJcuZvCVe1GYyHwzwCwceiokAq3mXsyV5SGodt1sHZKOCw-vHHW3DSU0MrY7IoHOW74oWmuntOs2_LFiXaXFty2nP2DGvLeHuNEpxcSeGgiTgyssmjfxZHsEr1QoHpv3vaOS-fqZdo4Ob1s9I3H_W8hfHAgikyF20ZKZgheCTOM1w'
    },
    {
        id: 3,
        name: 'Padma',
        description: 'Cafe & Bakery',
        status: 'Busy',
        waitTime: '25m',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjBSkPzLMjSgBteKTLc4pljw8Cy_k8pSA7DmtVqPPLiE1sX7Jpu1iLayVcXP1wYOIifwcSDGLFeRt_1qBDJWMc9d-9OhurgKQI1wn3ufcl_Jk32o7SPsZYf-TlFHjIAG56kZ2VBClCm8Lhwa2jFpBADiQdF60BK3Qmw5Mu2xRZTcy5Tc53wvmx6S-Hhu9jC7RdiMlY3VSzV9X7u2l1K7Hxcr7-PCVtP9jRnoqrHzHaMGTmg3Y6T1zdi6XlLvxFZcMfOoacUdApNJs'
    },
    {
        id: 4,
        name: 'Shine Star',
        description: 'Desserts & Snacks',
        status: 'Open',
        waitTime: '10m',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYYx5miIbjb3NmlhkdY1_lV5Ll1DRaH97pYvbV1_JhsL56xi41-OYGyhVwDIzRoP0IA-rKbaOQFaa9trp_YboH8Yfhhkw0DpxIWPmGZwkpG-GeMSRbwpQ9l1BEtlsWB6zGmqOm4CWnxRQnnwMtewoHqs6jGpuDfnMe31FsYnbGSa494Ha1lpWwk2Til4Ln5pfRuFVEAkIYxcMjPpTveESXPFv8AOkyAgB8kbSPYbTaqcpYST5YKH0L77Q11LuA7A9OiN1An28XrjU'
    },
    {
        id: 5,
        name: 'Non-veg',
        description: 'Grill & Roast',
        status: 'Open',
        waitTime: '20m',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
];

const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col pb-32 relative">
            {/* TopAppBar */}
            <header className="sticky top-0 z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-md shadow-lg shadow-primary/5 flex justify-between items-center px-container-margin py-md">
                <div className="flex items-center gap-sm cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-2xl" data-icon="restaurant_menu">restaurant_menu</span>
                    <h1 className="font-headline-md text-headline-md-mobile font-bold text-primary dark:text-primary-fixed-dim active:scale-95 transition-transform duration-200">BiteNow</h1>
                </div>
                <div className="flex items-center gap-md">
                    <ProfileDropdown />
                </div>
            </header>

            {/* Content Canvas */}
            <main className="px-container-margin flex flex-col gap-lg w-full pt-4">
                {/* Canteen Cards */}
                <section className="flex flex-col gap-md">
                    {CANTEENS.map((canteen) => (
                        <article key={canteen.id} onClick={() => navigate(`/canteen/${canteen.id}`)} className="relative w-full h-[180px] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.2)] group cursor-pointer active:scale-[0.98] transition-transform duration-300">
                            <div 
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                                style={{ backgroundImage: `url(${canteen.image})` }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface/40 to-transparent"></div>
                            
                            <div className="absolute top-sm right-sm flex gap-xs">
                                <span className={`${canteen.status === 'Open' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-variant text-on-surface-variant border border-outline-variant/30'} font-label-sm text-label-sm px-3 py-1 rounded-full backdrop-blur-sm shadow-sm`}>
                                    {canteen.status}
                                </span>
                                <span className={`${canteen.status === 'Open' ? 'bg-surface-container-high/80 text-on-surface text-primary' : 'bg-error-container/80 text-on-error-container border-error/30'} backdrop-blur-md border border-outline-variant/30 font-label-sm text-label-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm`}>
                                    <span className="material-symbols-outlined text-[14px]" data-icon="schedule">schedule</span> {canteen.waitTime}
                                </span>
                            </div>
                            
                            <div className="absolute bottom-md left-md right-md">
                                <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-xs drop-shadow-md">{canteen.name}</h2>
                                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">{canteen.description}</p>
                            </div>
                        </article>
                    ))}
                </section>
            </main>

        </div>
    );
};

export default Home;
