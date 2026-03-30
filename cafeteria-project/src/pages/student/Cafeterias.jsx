import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE = '';

export default function StudentCafeterias() {
  const [cafeterias, setCafeterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    <div className="max-w-7xl mx-auto">
      {/* Hero Header Section */}
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#E3E0F8] tracking-tight mb-1 font-['Manrope']">Campus Dining</h1>
          <p className="text-[#E1BFB5] text-sm max-w-lg font-['Inter']">Curated culinary experiences across campus. Select your destination and architect your perfect meal.</p>
        </div>
        <div className="flex items-center gap-3 bg-[#28283a] p-1.5 rounded-full font-['Inter'] overflow-x-auto whitespace-nowrap w-full md:w-auto custom-scrollbar">
          <button className="px-5 py-2 rounded-full bg-[#FF6B35] text-[#5f1900] font-bold text-sm transition-all duration-200">All</button>
          <button className="px-5 py-2 rounded-full text-[#e1bfb5] hover:bg-[#38374a]/40 font-semibold text-sm transition-all duration-200">Nearest</button>
          <button className="px-5 py-2 rounded-full text-[#e1bfb5] hover:bg-[#38374a]/40 font-semibold text-sm transition-all duration-200">Top Rated</button>
        </div>
      </section>

      {error && <div className="text-[#ffb4ab] mb-4 bg-[#93000a]/20 p-4 rounded-lg">{error}</div>}
      
      {loading ? (
        <div className="py-20 flex justify-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-[#FFB59D]">refresh</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {cafeterias.map((cafe) => (
            <article 
              key={cafe.id} 
              className="group relative bg-[#28283a] rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#FF6B35]/20 flex flex-col"
            >
              <div className="h-56 w-full relative overflow-hidden bg-[#333345]">
                {cafe.profile_picture ? (
                  <img 
                    src={cafe.profile_picture} 
                    alt={cafe.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-[#e1bfb5]/20">storefront</span>
                  </div>
                )}
                
                <div className="absolute top-4 right-4 bg-[#333345]/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#594139]/20">
                  <span className="material-symbols-outlined text-[#FFB59D] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-sm font-bold text-[#E3E0F8] font-['Inter']">4.8</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 font-['Manrope']">
                  <h3 className="text-xl font-bold text-[#E3E0F8] group-hover:text-[#FFB59D] transition-colors line-clamp-1">{cafe.name}</h3>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#59d5fb]">Campus</span>
                </div>
                
                <div className="flex items-center gap-2 text-[#e1bfb5] text-sm mb-6 font-['Inter'] line-clamp-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {cafe.location || 'Main Campus'}
                </div>

                <div className="mt-auto">
                    <button 
                    onClick={() => navigate(`/student/menu/${cafe.id}`)}
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
            <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-10 text-[#e1bfb5]">
              No cafeterias are currently available.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
