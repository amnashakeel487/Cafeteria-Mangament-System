import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Cafeterias() {
  const [cafeterias, setCafeterias] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [current, setCurrent] = useState({ id: null, name: '', email: '', password: '', location: '', contact: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);

  const token = localStorage.getItem('adminToken');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchCafeterias = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/cafeterias', axiosConfig);
      setCafeterias(res.data);
    } catch (err) {
      showMessage('Failed to load cafeterias', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCafeterias();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    setShowPassword(false);
    if (item) {
      setCurrent({ ...item, password: '' });
    } else {
      setCurrent({ id: null, name: '', email: '', password: '', location: '', contact: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (modalMode === 'add') {
        await axios.post('/api/admin/cafeterias', current, axiosConfig);
        showMessage('Cafeteria registered successfully');
      } else {
        await axios.put(`/api/admin/cafeterias/${current.id}`, current, axiosConfig);
        showMessage('Cafeteria updated successfully');
      }
      setIsModalOpen(false);
      fetchCafeterias();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this cafeteria? This action cannot be undone.")) return;
    try {
      setLoading(true);
      await axios.delete(`/api/admin/cafeterias/${id}`, axiosConfig);
      showMessage('Cafeteria deleted successfully');
      fetchCafeterias();
    } catch (err) {
      showMessage('Failed to delete cafeteria', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = cafeterias.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-28 px-10 pb-12 font-['Inter'] relative min-h-screen">
      {message.text && (
        <div className={`fixed top-24 right-10 p-4 rounded-xl shadow-lg shadow-black/30 z-[100] text-sm font-bold flex items-center gap-2 transition-all ${message.type === 'error' ? 'bg-error-container text-on-error' : 'bg-tertiary-container text-on-tertiary-container'}`}>
           <span className="material-symbols-outlined">{message.type === 'error' ? 'error' : 'check_circle'}</span>
           {message.text}
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-extrabold editorial-text tracking-tight text-on-surface mb-2">Cafeteria Hub</h2>
          <p className="text-on-surface-variant max-w-md">Manage university dining facilities, monitor independent portals, and maintain service standards across campus.</p>
        </div>
        <button onClick={() => handleOpenModal('add')} className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all">
          <span className="material-symbols-outlined">add</span>
          Register New Cafeteria
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-surface-container-high p-6 rounded-xl border-l-4 border-primary">
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant opacity-60 mb-1">Total Facilities</p>
          <h3 className="text-3xl font-extrabold editorial-text">{cafeterias.length}</h3>
        </div>
        <div className="bg-surface-container-high p-6 rounded-xl border-l-4 border-tertiary flex items-center justify-between">
           <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant opacity-60 mb-1">Active Portals</p>
            <h3 className="text-3xl font-extrabold editorial-text">{cafeterias.length}</h3>
           </div>
           <span className="material-symbols-outlined text-tertiary text-opacity-20 text-5xl">public</span>
        </div>
        <div className="col-span-2 bg-surface-container-high p-6 rounded-xl border-l-4 border-surface flex items-center">
            <div className="relative w-full max-w-md group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors">search</span>
              <input 
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container-lowest border-none rounded-xl py-3 pl-12 pr-4 text-sm text-on-surface focus:ring-1 focus:ring-primary/50 placeholder-on-surface-variant/30 font-label outline-none" 
                placeholder="Search cafeterias or locations..." />
            </div>
        </div>
      </div>

      {/* Cafeteria Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 relative">
        {loading && <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm z-10 flex items-center justify-center text-primary rounded-xl"><span className="material-symbols-outlined animate-spin text-4xl">refresh</span></div>}
        
        {filtered.map(cafeteria => (
          <div key={cafeteria.id} className="bg-[#2A2A3F] rounded-xl overflow-hidden group hover:shadow-2xl hover:shadow-black/40 transition-all duration-300 flex flex-col border border-outline-variant/10">
            <div className="h-32 relative overflow-hidden bg-surface-container-lowest">
              <div className="absolute inset-0 opacity-40 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBxjiBXUXzPGbVes3c2Vhw0dDtOhkka0gzGJXj1CtxxJmqsYnbI4JTw8rnu-4jzTMd2jRbq_ounvznmTyKVYsSlWvx6LDhz3RsaPVb_SIdrvpSJXwRb-2ymmbnEI7A2Dcx3qWWcQacbp0twz9iq7opNcRwLilibVIUo7infaIHbP-IHw83I8jNc7P8vB1fWW0On_LJD0qgWKEJL8FArb75OWcFpHlxXwr-UKqbZmqIgtKP0pe9f_erUiKIJxiFJFc9DpFmm7uT72Q')] bg-cover bg-center grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A2A3F] to-transparent"></div>
              <div className="absolute top-4 right-4 bg-surface-container-highest/60 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface">Live Portal</span>
              </div>
            </div>
            <div className="p-6 pt-2 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold editorial-text mb-1">{cafeteria.name}</h4>
                  <div className="flex flex-col text-xs text-on-surface-variant/80 gap-1 mt-2">
                    <span className="flex items-center gap-2 font-semibold"><span className="material-symbols-outlined text-[16px] text-tertiary">location_on</span> {cafeteria.location || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => handleOpenModal('edit', cafeteria)} className="p-2 bg-surface-container hover:bg-surface-bright rounded-lg text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                  <button onClick={() => handleDelete(cafeteria.id)} className="p-2 bg-surface-container hover:bg-error-container/20 rounded-lg text-error transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                </div>
              </div>
              <div className="space-y-3 mb-6 mt-2 flex-1">
                <div className="flex items-center justify-between text-sm py-2 border-b border-outline-variant/10">
                  <span className="text-on-surface-variant text-xs uppercase tracking-widest font-bold">Portal Email</span>
                  <span className="font-semibold text-on-surface">{cafeteria.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-outline-variant/10">
                  <span className="text-on-surface-variant text-xs uppercase tracking-widest font-bold">Contact</span>
                  <span className="font-semibold text-on-surface">{cafeteria.contact || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && !loading && (
           <div className="col-span-full py-20 text-center border-2 border-dashed border-outline-variant/20 rounded-xl">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2">restaurant</span>
              <p className="text-on-surface-variant font-bold">No cafeterias found.</p>
           </div>
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c1d]/80 backdrop-blur p-4">
          <div className="max-w-md w-full bg-surface-container-high rounded-2xl p-8 shadow-2xl border border-outline-variant/10 ambient-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold editorial-text text-on-surface">{modalMode === 'add' ? 'Register Cafeteria' : 'Update Cafeteria'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1 flex flex-col">
                <label className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Venue Name</label>
                <input required value={current.name} onChange={e => setCurrent({...current, name: e.target.value})} className="bg-surface-container-lowest border-none rounded-lg px-4 py-3 text-sm text-on-surface font-label focus:ring-2 focus:ring-primary/50 outline-none" placeholder="The Grand Atrium" />
              </div>
              <div className="space-y-1 flex flex-col">
                <label className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Portal Login Email</label>
                <input required type="email" value={current.email} onChange={e => setCurrent({...current, email: e.target.value})} className="bg-surface-container-lowest border-none rounded-lg px-4 py-3 text-sm text-on-surface font-label focus:ring-2 focus:ring-primary/50 outline-none" placeholder="atrium@university.edu" />
              </div>
              <div className="space-y-1 flex flex-col">
                <label className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Campus Location</label>
                <input required value={current.location} onChange={e => setCurrent({...current, location: e.target.value})} className="bg-surface-container-lowest border-none rounded-lg px-4 py-3 text-sm text-on-surface font-label focus:ring-2 focus:ring-primary/50 outline-none" placeholder="North Wing, Floor 2" />
              </div>
              <div className="space-y-1 flex flex-col">
                <label className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Manager Contact</label>
                <input value={current.contact} onChange={e => setCurrent({...current, contact: e.target.value})} className="bg-surface-container-lowest border-none rounded-lg px-4 py-3 text-sm text-on-surface font-label focus:ring-2 focus:ring-primary/50 outline-none" placeholder="(555) 012-9844" />
              </div>
              <div className="space-y-1 flex flex-col">
                <label className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Portal Password {modalMode === 'edit' && "(Optional)"}</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required={modalMode === 'add'} value={current.password} onChange={e => setCurrent({...current, password: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg px-4 py-3 pr-12 text-sm text-on-surface font-label focus:ring-2 focus:ring-primary/50 outline-none" placeholder="••••••••" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-surface-container hover:bg-surface-bright text-on-surface font-bold rounded-lg transition-colors text-sm">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-3.5 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-lg text-sm">
                   {loading ? 'Processing...' : (modalMode === 'add' ? 'Register Facility' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
