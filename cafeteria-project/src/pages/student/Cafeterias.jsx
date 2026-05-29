import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageSEO from '../../seo/PageSEO';
import { PAGE_SEO } from '../../seo/siteConfig';
import LazyImage from '../../components/LazyImage';

const BASE = '';

export default function StudentCafeterias() {
  const [cafeterias, setCafeterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const goToMenu = (cafeId) => {
    navigate(`/student/menu/${cafeId}`);
  };

  useEffect(() => {
    const fetchCafeterias = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const res = await axios.get(`${BASE}/api/student/cafeterias`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCafeterias(res.data);
      } catch (err) {
        setError('Failed to fetch cafeterias.');
      } finally {
        setLoading(false);
      }
    };
    fetchCafeterias();
  }, []);

  return (
    <>
      <PageSEO {...PAGE_SEO.studentCafeterias} />
    <section className="max-w-7xl mx-auto" aria-label="Campus cafeterias">
      {/* Hero Header Section */}
      <section className="mb-4 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-lg md:text-3xl font-extrabold text-[#E3E0F8] tracking-tight mb-0.5 md:mb-1 font-['Manrope']">Campus Dining</h1>
          <p className="text-[#E1BFB5] text-xs md:text-sm max-w-lg font-['Inter'] leading-snug">
            Select your destination and architect your perfect meal.
          </p>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 bg-[#28283a] p-1 md:p-1.5 rounded-full font-['Inter'] overflow-x-auto whitespace-nowrap w-full md:w-auto shrink-0">
          <button type="button" className="px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-[#FF6B35] text-[#5f1900] font-bold text-xs md:text-sm">All</button>
          <button type="button" className="px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[#e1bfb5] hover:bg-[#38374a]/40 font-semibold text-xs md:text-sm">Nearest</button>
          <button type="button" className="px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[#e1bfb5] hover:bg-[#38374a]/40 font-semibold text-xs md:text-sm">Top Rated</button>
        </div>
      </section>

      {error && <div className="text-[#ffb4ab] mb-3 md:mb-4 bg-[#93000a]/20 p-3 md:p-4 rounded-lg text-sm">{error}</div>}
      
      {loading ? (
        <div className="py-12 md:py-20 flex justify-center">
            <span className="material-symbols-outlined animate-spin text-3xl md:text-4xl text-[#FFB59D]">refresh</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 md:gap-8">
          {cafeterias.map((cafe) => (
            <article 
              key={cafe.id} 
              role="button"
              tabIndex={0}
              onClick={() => goToMenu(cafe.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goToMenu(cafe.id);
                }
              }}
              className="group relative bg-[#28283a] rounded-lg md:rounded-xl overflow-hidden transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-2xl md:hover:shadow-[#FF6B35]/20 flex flex-row md:flex-col cursor-pointer md:cursor-default active:scale-[0.99] md:active:scale-100 border border-[#594139]/10 md:border-transparent"
            >
              {/* Thumbnail — compact strip on mobile, hero on desktop */}
              <div className="w-[5.5rem] md:w-full h-auto md:h-56 shrink-0 relative overflow-hidden bg-[#333345] self-stretch min-h-[5.5rem] md:min-h-0">
                {cafe.profile_picture ? (
                  <LazyImage
                    src={cafe.profile_picture}
                    alt={`${cafe.name} cafeteria profile`}
                    className="w-full h-full min-h-[5.5rem] md:min-h-0 object-cover transition-transform duration-500 md:group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full min-h-[5.5rem] md:min-h-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl md:text-6xl text-[#e1bfb5]/20">storefront</span>
                  </div>
                )}
                
                <div className="absolute top-1.5 right-1.5 md:top-4 md:right-4 bg-[#333345]/90 backdrop-blur-md px-1.5 py-0.5 md:px-3 md:py-1 rounded-full flex items-center gap-0.5 md:gap-1.5 border border-[#594139]/20">
                  <span className="material-symbols-outlined text-[#FFB59D] text-[10px] md:text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-[10px] md:text-sm font-bold text-[#E3E0F8] font-['Inter']">4.8</span>
                </div>
              </div>

              <div className="p-3 md:p-6 flex-1 flex flex-col min-w-0 justify-center md:justify-start">
                <div className="flex justify-between items-start gap-2 mb-0.5 md:mb-2 font-['Manrope']">
                  <h3 className="text-sm md:text-xl font-bold text-[#E3E0F8] md:group-hover:text-[#FFB59D] transition-colors line-clamp-2 md:line-clamp-1 leading-tight">
                    {cafe.name}
                  </h3>
                  <span className="hidden md:inline text-xs font-bold uppercase tracking-widest text-[#59d5fb] shrink-0">Campus</span>
                </div>
                
                <div className="flex items-center gap-1 md:gap-2 text-[#e1bfb5] text-[11px] md:text-sm mb-0 md:mb-6 font-['Inter'] line-clamp-1">
                  <span className="material-symbols-outlined text-xs md:text-sm shrink-0">location_on</span>
                  <span className="truncate">{cafe.location || 'Main Campus'}</span>
                </div>

                {/* Mobile: inline CTA hint */}
                <div className="flex items-center justify-between mt-1 md:mt-auto md:hidden">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#59d5fb]">Campus</span>
                  <span className="text-xs font-bold text-[#FFB59D] flex items-center gap-0.5">
                    Menu
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </span>
                </div>

                {/* Desktop: full button */}
                <div className="mt-auto hidden md:block">
                    <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToMenu(cafe.id);
                    }}
                    className="w-full bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] py-3 rounded-lg text-[#5d1900] font-bold transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#FF6B35]/40 flex items-center justify-center gap-2 font-['Inter']"
                    >
                    View Menu
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
              </div>
            </article>
          ))}
          
          {cafeterias.length === 0 && !loading && !error && (
            <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-8 md:py-10 text-[#e1bfb5] text-sm">
              No cafeterias are currently available.
            </div>
          )}
        </div>
      )}

    </section>
    </>
  );
}
