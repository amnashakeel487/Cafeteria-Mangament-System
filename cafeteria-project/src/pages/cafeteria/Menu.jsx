import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const CAT_COLORS = [
  { badge: 'bg-tertiary/20 text-tertiary border border-tertiary/30', pill: 'text-tertiary' },
  { badge: 'bg-primary/20 text-primary border border-primary/30',   pill: 'text-primary' },
  { badge: 'bg-tertiary-container/20 text-tertiary-container border border-tertiary-container/30', pill: 'text-tertiary-container' },
  { badge: 'bg-secondary/20 text-secondary border border-secondary/30', pill: 'text-secondary' },
  { badge: 'bg-[#28A745]/20 text-[#28A745] border border-[#28A745]/30', pill: 'text-[#28A745]' }
];

const getCatStyle = (name) => {
  if (!name) return CAT_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return CAT_COLORS[Math.abs(hash) % CAT_COLORS.length];
};

const BASE = '';
const DEFAULT_IMAGE = 'https://raw.githubusercontent.com/amnashakeel487/Cafeteria-Mangament-System/main/cafeteria-project/src/assets/hero.png'; // Placeholder, user should replace with their provided image
const emptyForm = { name: '', price: '', category: '', description: '' };

export default function CafeteriaMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]); // Dynamic categories
  
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'categories'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  const fileRef = useRef();

  const token = localStorage.getItem('cafeteriaToken');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        axios.get(`${BASE}/api/cafeteria/menu`, axiosConfig),
        axios.get(`${BASE}/api/cafeteria/menu/categories`, axiosConfig)
      ]);
      setItems(menuRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0) {
         emptyForm.category = catRes.data[0].name;
      }
    } catch (err) { 
        showToast('Failed to load menu data.', 'error'); 
    } finally { 
        setLoading(false); 
    }
  };

  const openAdd = () => {
    setEditing(null); 
    setForm({ ...emptyForm, category: categories.length ? categories[0].name : '' }); 
    setImageFile(null); 
    setImagePreview('');
    setModal('add');
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, price: item.price, category: item.category, description: item.description || '' });
    setImagePreview(item.image_url ? item.image_url : '');
    setImageFile(null);
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setEditing(null); };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIDE = 1200;
          
          if (width > height) {
            if (width > MAX_SIDE) {
              height *= MAX_SIDE / width;
              width = MAX_SIDE;
            }
          } else {
            if (height > MAX_SIDE) {
              width *= MAX_SIDE / height;
              height = MAX_SIDE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            const compressed = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressed);
          }, 'image/jpeg', 0.7);
        };
      };
    });
  };

  const handleImageChange = async (e) => {
    let file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      showToast('Large image detected. Compressing...', 'success');
      file = await compressImage(file);
      showToast('Image compressed to under 2MB successfully!', 'success');
    }
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('price', form.price);
      fd.append('category', form.category);
      fd.append('description', form.description);
      if (imageFile) fd.append('image', imageFile);

      const multipartConfig = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };

      if (modal === 'edit' && editing) {
        await axios.put(`${BASE}/api/cafeteria/menu/${editing.id}`, fd, multipartConfig);
        showToast('Menu item updated!', 'success');
      } else {
        await axios.post(`${BASE}/api/cafeteria/menu`, fd, multipartConfig);
        showToast('Menu item added!', 'success');
      }
      closeModal();
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed.', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}" from the menu?`)) return;
    try {
      await axios.delete(`${BASE}/api/cafeteria/menu/${item.id}`, axiosConfig);
      showToast('Item deleted.', 'success');
      fetchData();
    } catch { showToast('Delete failed.', 'error'); }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await axios.post(`${BASE}/api/cafeteria/menu/categories`, { name: newCategoryName }, axiosConfig);
      setNewCategoryName('');
      showToast('Category added!', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding category.', 'error');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await axios.delete(`${BASE}/api/cafeteria/menu/categories/${id}`, axiosConfig);
      showToast('Category deleted.', 'success');
      if (filter === name) setFilter('All');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: '' }), 5000);
  };

  const filtered = items.filter(i => {
    const matchCat = filter === 'All' || i.category === filter;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const avgPrice = items.length ? (items.reduce((a, b) => a + Number(b.price), 0) / items.length).toFixed(2) : '0.00';

  const categoryNames = categories.map(c => c.name);
  const filterTabs = ['All', ...categoryNames];

  return (
    <section className="p-8 max-w-7xl mx-auto space-y-8 pt-10">
      {toast.visible && (
        <div onClick={() => setToast({ ...toast, visible: false })}
          className={`fixed bottom-8 right-8 p-4 rounded-xl shadow-2xl flex items-center space-x-3 z-50 cursor-pointer
            ${toast.type === 'success' ? 'bg-[#28A745] text-white font-bold' : 'bg-error text-white font-bold'}`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <p className="text-sm">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface" style={{ fontFamily: 'Manrope' }}>Menu Architecture</h2>
          <p className="text-on-surface-variant mt-1">Design and curate the daily culinary offerings.</p>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setModal('categories')}
            className="bg-surface-container-highest text-on-surface hover:bg-surface-bright px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
            <span className="material-symbols-outlined">category</span>
            Categories
            </button>
            <button onClick={openAdd}
            className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-[0_8px_16px_rgba(255,107,53,0.2)] hover:scale-[1.02] active:scale-95 transition-all">
            <span className="material-symbols-outlined">add</span>
            Create New Entry
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[260px] relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest border-none rounded-xl pl-12 pr-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 placeholder:text-on-surface-variant/50 transition-all outline-none"
            placeholder="Search dish names..." />
        </div>
        <div className="flex bg-surface-container-high rounded-xl p-1 overflow-x-auto hide-scrollbar">
          {filterTabs.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${filter === cat ? 'bg-surface-bright text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-20 text-center"><span className="material-symbols-outlined animate-spin text-3xl text-primary">refresh</span></div>
        ) : filtered.map(item => {
          const style = getCatStyle(item.category);
          return (
          <div key={item.id} className="group relative bg-surface-container-high rounded-xl overflow-hidden hover:shadow-[0_24px_48px_rgba(12,12,29,0.5)] transition-all duration-300 flex flex-col">
            <div className="h-48 overflow-hidden relative bg-surface-container-highest font-['Manrope']">
              <img 
                src={item.image_url || DEFAULT_IMAGE} 
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className={`absolute top-4 left-4 backdrop-blur-md px-3 py-1 rounded-full ${style.badge}`}>
                <span className={`text-[10px] font-bold tracking-widest uppercase ${style.pill}`}>{item.category}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-transparent to-transparent opacity-60"></div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-on-surface leading-tight" style={{ fontFamily: 'Manrope' }}>{item.name}</h3>
                <span className="text-xl font-extrabold text-primary">${Number(item.price).toFixed(2)}</span>
              </div>
              {item.description && <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{item.description}</p>}
              <div className="mt-auto flex items-center justify-end border-t border-outline-variant/15 pt-4 gap-2">
                <button onClick={() => openEdit(item)}
                  className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-bright/40 hover:text-on-surface transition-all">
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button onClick={() => handleDelete(item)}
                  className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container/20 hover:text-error transition-all">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        )})}

        <div onClick={openAdd}
          className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 rounded-xl p-10 group cursor-pointer hover:border-primary/50 hover:bg-surface-container-lowest transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:bg-primary/20 group-hover:text-primary transition-all mb-4">
            <span className="material-symbols-outlined text-3xl">add_circle</span>
          </div>
          <h4 className="text-lg font-bold text-on-surface" style={{ fontFamily: 'Manrope' }}>Add New Selection</h4>
        </div>

        {filtered.length === 0 && !loading && items.length > 0 && (
          <div className="col-span-3 py-10 text-center text-on-surface-variant">No items match the current filter.</div>
        )}
      </div>

      {/* Item Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-sm">
          <div className="bg-[rgba(56,55,74,0.6)] backdrop-blur-2xl w-full max-w-2xl rounded-3xl p-8 border border-white/10 shadow-[0_48px_96px_rgba(0,0,0,0.6)]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Manrope' }}>
                {modal === 'edit' ? 'Edit Menu Entry' : 'Compose Menu Entry'}
              </h2>
              <button onClick={closeModal} className="w-10 h-10 rounded-full bg-surface-bright/20 flex items-center justify-center hover:bg-surface-bright/40 transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Dish Name *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Category *</label>
                    <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none">
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      {categories.length === 0 && <option value="">No categories available</option>}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Price (USD) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                      <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                        className="w-full bg-surface-container-lowest border-none rounded-xl pl-8 pr-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Description</label>
                    <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 resize-none outline-none" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Item Visualization</label>
                  <label htmlFor="menu-img-upload"
                    className="aspect-video w-full rounded-2xl bg-surface-container-lowest flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 text-on-surface-variant hover:border-primary/50 transition-all cursor-pointer overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-4xl mb-2">add_a_photo</span>
                        <span className="text-sm">Upload High-Res Media</span>
                      </>
                    )}
                  </label>
                  <input id="menu-img-upload" type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleImageChange} />
                  <p className="text-[10px] text-on-surface-variant">Recommended: 1200×800px · PNG/JPG · Max 2MB</p>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={closeModal} className="px-8 py-3 rounded-xl font-bold text-on-surface-variant hover:text-on-surface transition-colors">Discard</button>
                <button type="submit" disabled={saving || categories.length === 0}
                  className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-10 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50">
                  {saving ? <span className="material-symbols-outlined animate-spin">refresh</span> : null}
                  {modal === 'edit' ? 'Update Entry' : 'Publish to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Modal */}
      {modal === 'categories' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-sm">
          <div className="bg-surface-container w-full max-w-lg rounded-3xl overflow-hidden border border-outline-variant/10 shadow-2xl">
            <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-on-surface" style={{ fontFamily: 'Manrope' }}>Manage Categories</h2>
              <button onClick={closeModal} className="text-on-surface-variant hover:text-error transition-colors p-1"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-6 space-y-6">
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input required value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="New category name..."
                  className="flex-1 bg-surface-container-lowest border-none rounded-lg px-4 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/40 outline-none" />
                <button type="submit" className="bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-[18px]">add</span> Add
                </button>
              </form>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                {categories.length === 0 ? (
                    <div className="text-center py-6 text-on-surface-variant text-sm">No categories. Create one to start adding menu items.</div>
                ) : categories.map(cat => (
                  <div key={cat.id} className="flex justify-between items-center bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/5">
                    <span className="font-bold text-sm text-on-surface">{cat.name}</span>
                    <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="text-on-surface-variant hover:text-error hover:bg-error/10 w-8 h-8 rounded flex items-center justify-center transition-all bg-transparent border-none">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
