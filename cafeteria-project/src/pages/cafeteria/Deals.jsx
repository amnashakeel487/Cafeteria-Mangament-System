import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DefaultImage from '../../assets/default_dish.png';
import { supabase, BUCKET } from '../../supabaseClient';

const BASE = '';
const emptyForm = { title: '', description: '', original_price: '', deal_price: '', image_url: '', active: true };

export default function CafeteriaDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  const fileRef = useRef();

  const token = localStorage.getItem('cafeteriaToken');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchDeals(); }, []);

  const fetchDeals = async () => {
    try {
      const res = await axios.get(`${BASE}/api/cafeteria/deals`, axiosConfig);
      setDeals(res.data);
    } catch { showToast('Failed to load deals', 'error'); }
    finally { setLoading(false); }
  };

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: '' }), 4000);
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setImageFile(null); setImagePreview(''); setModal('add'); };
  const openEdit = (deal) => {
    setEditing(deal);
    setForm({ title: deal.title, description: deal.description || '', original_price: deal.original_price || '', deal_price: deal.deal_price, image_url: deal.image_url || '', active: deal.active });
    setImagePreview(deal.image_url || '');
    setImageFile(null);
    setModal('edit');
  };

  const handleImageChange = async (e) => {
    let file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalImageUrl = form.image_url || (editing ? editing.image_url : null);

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `deals/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, imageFile, { contentType: imageFile.type, upsert: true });
        if (uploadErr) throw new Error('Upload failed: ' + uploadErr.message);
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
        finalImageUrl = urlData.publicUrl;
      }

      const payload = { ...form, image_url: finalImageUrl };

      if (modal === 'edit' && editing) {
        await axios.put(`${BASE}/api/cafeteria/deals/${editing.id}`, payload, axiosConfig);
        setDeals(prev => prev.map(d => d.id === editing.id ? { ...d, ...payload } : d));
        showToast('Deal updated!', 'success');
      } else {
        const res = await axios.post(`${BASE}/api/cafeteria/deals`, payload, axiosConfig);
        setDeals(prev => [{ id: res.data.id, ...payload, cafeteria_id: null }, ...prev]);
        showToast('Deal added!', 'success');
      }
      setModal(null);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Save failed', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (deal) => {
    if (!window.confirm(`Delete deal "${deal.title}"?`)) return;
    try {
      await axios.delete(`${BASE}/api/cafeteria/deals/${deal.id}`, axiosConfig);
      setDeals(prev => prev.filter(d => d.id !== deal.id));
      showToast('Deal deleted.', 'success');
    } catch { showToast('Delete failed.', 'error'); }
  };

  const toggleActive = async (deal) => {
    try {
      await axios.put(`${BASE}/api/cafeteria/deals/${deal.id}`, { ...deal, active: !deal.active }, axiosConfig);
      setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, active: !d.active } : d));
    } catch { showToast('Failed to update status', 'error'); }
  };

  return (
    <section className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pt-6 md:pt-10">
      {toast.visible && (
        <div onClick={() => setToast({ ...toast, visible: false })}
          className={`fixed bottom-8 right-8 p-4 rounded-xl shadow-2xl flex items-center space-x-3 z-50 cursor-pointer ${toast.type === 'success' ? 'bg-[#28A745] text-white font-bold' : 'bg-error text-white font-bold'}`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <p className="text-sm">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
        <div>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-on-surface" style={{ fontFamily: 'Manrope' }}>Deals & Offers</h2>
          <p className="text-on-surface-variant mt-1 text-sm">Create special deals and discounts visible to students.</p>
        </div>
        <button onClick={openAdd}
          className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm w-fit">
          <span className="material-symbols-outlined">add</span>
          Add New Deal
        </button>
      </div>

      {/* Deals Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-3xl text-primary">refresh</span></div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-outline-variant/20 rounded-xl">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 block mb-3">local_offer</span>
          <p className="text-on-surface-variant font-bold">No deals yet. Create your first deal!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {deals.map(deal => (
            <div key={deal.id} className={`group bg-surface-container-high rounded-xl overflow-hidden border transition-all duration-300 ${deal.active ? 'border-outline-variant/5 hover:shadow-2xl' : 'border-outline-variant/5 opacity-60'}`}>
              <div className="h-40 overflow-hidden relative bg-surface-container-highest">
                <img src={deal.image_url || DefaultImage} alt={deal.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${deal.active ? 'bg-[#28A745]/20 text-[#28A745] border border-[#28A745]/30' : 'bg-error-container/20 text-error border border-error/30'}`}>
                    {deal.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {deal.original_price && (
                  <div className="absolute top-3 right-3 bg-primary text-on-primary px-2 py-1 rounded-full text-[10px] font-bold">
                    {Math.round((1 - deal.deal_price / deal.original_price) * 100)}% OFF
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-on-surface mb-1" style={{ fontFamily: 'Manrope' }}>{deal.title}</h3>
                {deal.description && <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">{deal.description}</p>}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl font-extrabold text-primary">${Number(deal.deal_price).toFixed(2)}</span>
                  {deal.original_price && <span className="text-sm text-on-surface-variant line-through">${Number(deal.original_price).toFixed(2)}</span>}
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/10 pt-3 gap-2">
                  <button onClick={() => toggleActive(deal)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${deal.active ? 'bg-error-container/10 text-error hover:bg-error-container/20' : 'bg-tertiary/10 text-tertiary hover:bg-tertiary/20'}`}>
                    {deal.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(deal)} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-bright/40 hover:text-on-surface transition-all">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => handleDelete(deal)} className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container/20 hover:text-error transition-all">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-sm">
          <div className="bg-[rgba(56,55,74,0.95)] backdrop-blur-2xl w-full max-w-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-on-surface" style={{ fontFamily: 'Manrope' }}>{modal === 'edit' ? 'Edit Deal' : 'New Deal'}</h2>
              <button onClick={() => setModal(null)} className="w-9 h-9 rounded-full bg-surface-bright/20 flex items-center justify-center hover:bg-surface-bright/40 transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Deal Title *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full mt-1 bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none text-sm" placeholder="e.g. Combo Meal Deal" />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full mt-1 bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none text-sm resize-none" placeholder="What's included in this deal?" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Original Price</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">$</span>
                    <input type="number" step="0.01" min="0" value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})}
                      className="w-full bg-surface-container-lowest border-none rounded-xl pl-7 pr-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none text-sm" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Deal Price *</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">$</span>
                    <input required type="number" step="0.01" min="0" value={form.deal_price} onChange={e => setForm({...form, deal_price: e.target.value})}
                      className="w-full bg-surface-container-lowest border-none rounded-xl pl-7 pr-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none text-sm" placeholder="0.00" />
                  </div>
                </div>
              </div>
              {/* Image */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Image</label>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  <div className="relative group overflow-hidden bg-surface-container rounded-xl cursor-pointer border-2 border-dashed border-outline-variant/30 hover:border-primary transition-all p-1"
                    onClick={() => fileRef.current.click()}>
                    <input type="file" ref={fileRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="w-full h-20 object-cover rounded-lg" />
                    ) : (
                      <div className="h-20 flex flex-col items-center justify-center gap-1 text-on-surface-variant/40 group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                        <span className="text-[10px] font-bold">Upload</span>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm">link</span>
                    <input type="text" placeholder="Or paste URL..." value={form.image_url}
                      onChange={e => { setForm({...form, image_url: e.target.value}); setImagePreview(e.target.value); setImageFile(null); }}
                      className="w-full h-full bg-surface-container-high border-none rounded-xl pl-9 pr-3 py-3 text-xs text-on-surface focus:ring-2 focus:ring-primary outline-none placeholder:text-on-surface-variant/30" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="active" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="w-4 h-4 accent-primary" />
                <label htmlFor="active" className="text-sm text-on-surface-variant font-medium">Active (visible to students)</label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-2.5 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                  {saving && <span className="material-symbols-outlined animate-spin text-sm">refresh</span>}
                  {modal === 'edit' ? 'Update Deal' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
