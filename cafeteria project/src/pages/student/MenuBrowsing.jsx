import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';

const BASE = '';

export default function MenuBrowsing() {
  const { cafeteriaId } = useParams();
  const navigate = useNavigate();
  
  const [cafeteria, setCafeteria] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filter, setFilter] = useState('All Items');
  const [search, setSearch] = useState('');
  
  // Use global cart
  const { cart, addToCart, removeFromCart, getCartQty, cartTotal, cartItemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const res = await axios.get(`${BASE}/api/student/menu/${cafeteriaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCafeteria(res.data.cafeteria);
        setCategories(res.data.categories);
        setItems(res.data.items);
      } catch (err) {
        setError('Failed to load menu details.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [cafeteriaId]);

  const filterTabs = ['All Items', ...categories.map(c => c.name)];
  
  const filteredItems = items.filter(i => {
    const matchCat = filter === 'All Items' || i.category === filter;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#FFB59D]">refresh</span>
      </div>
    );
  }

  if (error || !cafeteria) {
    return (
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <div className="bg-[#93000a]/20 text-[#ffb4ab] p-6 rounded-xl">
          {error || 'Cafeteria not found.'}
          <button onClick={() => navigate('/student/cafeterias')} className="ml-4 underline font-bold">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 relative font-['Inter']">
      
      <div className="flex-1">
        {/* Header Section */}
        <header className="mb-10">
          <button 
            onClick={() => navigate('/student/cafeterias')} 
            className="flex items-center gap-2 text-[#FFB59D] font-medium mb-4 hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-sm tracking-wide">Back to All Cafeterias</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-['Manrope'] text-4xl md:text-5xl font-extrabold text-[#E3E0F8] tracking-tighter mb-2">
                {cafeteria.name}
              </h1>
              <p className="text-[#e1bfb5] max-w-xl text-lg">
                {cafeteria.location} - Contact: {cafeteria.contact || 'N/A'}
              </p>
            </div>
          </div>
          
          {/* Search bar inside header for better UX on menu page */}
          <div className="mt-6 relative max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#e1bfb5] text-sm">search</span>
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#28283a] border border-[#594139]/30 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-[#FFB59D] text-[#E3E0F8] placeholder:text-[#e1bfb5]/50 outline-none transition-all" 
              placeholder="Search menu..." 
              type="text"
            />
          </div>
        </header>

        {/* Category Tabs */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-4 custom-scrollbar">
          {filterTabs.map(tab => (
            <button 
              key={tab} 
              onClick={() => setFilter(tab)}
              className={`whitespace-nowrap px-8 py-3 rounded-xl transition-all active:scale-95 font-bold ${
                filter === tab 
                  ? 'bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900] shadow-lg shadow-[#FF6B35]/20' 
                  : 'bg-[#28283a] text-[#e1bfb5] hover:text-[#E3E0F8] hover:bg-[#333345]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const qty = getCartQty(item.id);
            return (
            <div key={item.id} className="group bg-[#28283a] rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-[#0c0c1d]/50 transition-all duration-300 flex flex-col">
              <div className="relative h-40 overflow-hidden bg-[#333345]">
                {item.image_url ? (
                  <img src={`${BASE}${item.image_url}`} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-[#e1bfb5]/20">restaurant</span>
                  </div>
                )}
                {qty > 0 && (
                  <div className="absolute top-2 right-2 bg-[#FF6B35] text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-lg">
                    In Cart ({qty})
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-[#0c0c1d]/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[#59d5fb] text-[9px] font-bold uppercase tracking-widest border border-[#594139]/20">
                  {item.category}
                </div>
              </div>
              
              <div className="p-3 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1 font-['Manrope']">
                  <h3 className="text-sm font-bold text-[#E3E0F8] group-hover:text-[#FFB59D] transition-colors line-clamp-1">{item.name}</h3>
                  <span className="text-sm font-bold text-[#FFB59D]">${Number(item.price).toFixed(2)}</span>
                </div>
                <p className="text-[#e1bfb5] text-[11px] mb-3 flex-1 line-clamp-2">{item.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#594139]/10">
                  {qty === 0 ? (
                    <button onClick={() => addToCart(item, cafeteriaId)} className="w-full bg-[#333345] hover:bg-[#38374a] text-[#E3E0F8] px-4 py-2 rounded-lg text-xs font-bold active:scale-95 transition-all">
                      Add to Cart
                    </button>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center bg-[#0c0c1d] rounded-lg p-0.5 border border-[#594139]/20">
                        <button onClick={() => removeFromCart(item.id)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-[#38374a] text-[#e1bfb5] transition-colors"><span className="material-symbols-outlined text-base">math_minus</span></button>
                        <span className="px-3 text-xs font-bold text-[#E3E0F8]">{qty}</span>
                        <button onClick={() => addToCart(item, cafeteriaId)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-[#38374a] text-[#FFB59D] transition-colors"><span className="material-symbols-outlined text-base">add</span></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })}
          
          {filteredItems.length === 0 && (
            <div className="col-span-2 md:col-span-3 text-center py-10 text-[#e1bfb5]">
              No menu items found for this filter.
            </div>
          )}
        </section>
      </div>

      {/* Floating Sidebar Cart Preview (Desktop visible, Mobile toggleable) */}
      {(cartItemCount > 0 || cartOpen) && (
        <div className={`fixed lg:sticky top-[auto] bottom-0 lg:top-24 left-0 w-full lg:w-80 z-50 lg:z-10 transition-transform duration-300 ${cartOpen || window.innerWidth >= 1024 ? 'translate-y-0' : 'translate-y-[calc(100%-4rem)]'}`}>
          
          {/* Mobile Cart Toggle Handle */}
          <div 
            className="lg:hidden bg-[#1E1E2F] border-t border-[#594139]/20 w-full flex items-center justify-between px-6 py-4 cursor-pointer rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            onClick={() => setCartOpen(!cartOpen)}
          >
             <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FFB59D]">shopping_bag</span>
                <span className="font-bold text-[#E3E0F8]">Your Order ({cartItemCount})</span>
             </div>
             <div className="flex items-center gap-4">
                <span className="font-bold text-[#FFB59D]">${cartTotal.toFixed(2)}</span>
                <span className="material-symbols-outlined text-[#e1bfb5] transition-transform" style={{ transform: cartOpen ? 'rotate(180deg)' : 'none' }}>expand_less</span>
             </div>
          </div>

          <div className={`bg-[#28283a] border-t lg:border border-[#594139]/15 lg:rounded-2xl shadow-2xl p-6 flex flex-col h-[60vh] lg:h-[calc(100vh-8rem)] ${!cartOpen && 'hidden lg:flex'}`}>
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FFB59D]">shopping_bag</span>
                <h4 className="font-['Manrope'] font-bold text-[#E3E0F8] text-lg">Your Order</h4>
              </div>
              <span className="text-xs font-bold text-[#e1bfb5] bg-[#0c0c1d] px-2 py-1 rounded">{cartItemCount} Items</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 group items-center">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-[#333345] shrink-0 border border-[#594139]/10">
                    {item.image_url ? (
                      <img src={`${BASE}${item.image_url}`} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center"><span className="material-symbols-outlined text-[#e1bfb5]/20 text-xl">restaurant</span></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-bold text-[#E3E0F8] leading-tight truncate">{item.name}</p>
                      <p className="text-sm font-bold text-[#FFB59D] leading-tight">${(item.price * item.qty).toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center mt-1 text-[#e1bfb5]">
                        <p className="text-[10px]">Qty: {item.qty}</p>
                        <button onClick={() => removeFromCart(item.id)} className="text-[10px] hover:text-[#ffb4ab] underline">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-10 text-[#e1bfb5] text-sm">Cart is empty.<br/>Add some delicious food!</div>
              )}
            </div>
            
            <div className="pt-6 border-t border-[#594139]/15">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[#e1bfb5] font-medium text-sm">Subtotal</p>
                <p className="text-2xl font-bold text-[#E3E0F8] font-['Manrope'] tracking-tight">${cartTotal.toFixed(2)}</p>
              </div>
              <button 
                onClick={() => navigate('/student/cart')}
                disabled={cart.length === 0}
                className="w-full bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900] py-4 rounded-xl font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-[#FF6B35]/30 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
              >
                Checkout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
