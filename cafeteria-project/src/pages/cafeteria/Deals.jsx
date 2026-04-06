import { useState, useEffect } from 'react';
import axios from 'axios';
import DefaultImage from '../../assets/default_dish.png';

const BASE = '';
const emptyForm = { title: '', description: '', deal_price: '', image_url: '', active: true };

export default function CafeteriaDeals() {
  const [deals, setDeals] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedItems, setSelectedItems] = useState([]); // items in this deal
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  const token = localStorage.getItem('cafeteriaToken');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [dealsRes, menuRes] = await Promise.all([
        axios.get(`${BASE}/api/cafeteria/deals`, axiosConfig),
        axios.get(`${BASE}/api/cafeteria/menu`, axiosConfig),
      ]);
      setDeals(dealsRes.data);
      setMenuItems(menuRes.data);
    } catch { showToast('Failed to load data', 'error'); }
    finally { setLoading(false); }
  };

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: '' }), 4000);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setSelectedItems([]);
    setModal('add');
  };

  const openEdit = (deal) => {
    setEditing(deal);
    setForm({ title: deal.title, description: deal.description || '', deal_price: deal.deal_price, image_url: deal.image_url || '', active: deal.active });
    setSelectedItems(deal.deal_items || []);
    setModal('edit');
  };

  const toggleItem = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.menu_item_id === item.id || i.id === item.id);
      if (exists) return prev.filter(i => (i.menu_item_id || i.id) !== item.id);
      if (prev.length >= 5) { showToast('Max 5 items per deal', 'error'); return prev; }
      return [...prev, { menu_item_id: item.id, id: item.id, item_name: item.name, item_price: item.price, name: item.name, price: item.price }];
    });
  };

  const isSelected = (item) => selectedItems.some(i => (i.menu_item_id || i.id) === item.id);

  const originalTotal = selectedItems.reduce((sum, i) => sum + Number(i.item_price || i.price), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length < 2) { showToast('Select at least 2 items for a deal', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        deal_price: parseFloat(form.deal_price),
        items: selectedItems.map(i => ({ id: i.menu_item_id || i.id, name: i.item_name || i.name, price: i.item_price || i.price }))
      };
      if (modal === 'edit' && editing) {
        await axios.put(`${BASE}/api/cafeteria/deals/${editing.id}`, payload, axiosConfig);
        showToast('Deal updated!', 'success');
      } else {
        await axios.post(`${BASE}/api/cafeteria/deals`, payload, axiosConfig);
        showToast('Deal created!', 'success');
      }
      setModal(null);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
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
      await axios.put(`${BASE}/api/cafeteria/deals/${deal.id}`, { ...deal, active: !deal.active, items: deal.deal_items?.map(i => ({ id: i.menu_item_id, name: i.item_name, price: i.item_price })) || [] }, axiosConfig);
      setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, active: !d.active } : d));
    } catch { showToast('Failed to update', 'error'); }
  };

  return (
    <section className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pt-6 md:pt-10">
      {toast.visible && (
        <div onClick={() => setToast({ ...toast, visible: false })}
          className={`fixed bottom-8 right-8 p-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 cursor-pointer font-bold text-white ${toast.type === 'success' ? 'bg-[#28A745]' : 'bg-error'}`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <p className="text-sm">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
        <div>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-on-surface" style={{ fontFamily: 'Manrope' }}>Combo Deals</h2>
          <p className="text-on-surface-variant mt-1 text-sm">Bundle 2–5 menu items into a discounted combo deal.</p>
        </div>
        <button onClick={openAdd} className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm w-fit">
          <span className="material-symbols-outlined">add</span>Add Deal
        </button>
      </div>

      {/* Deals Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-3xl text-primary">refresh</span></div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-outline-variant/20 rounded-xl">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 block mb-3">local_offer</span>
          <p className="text-on-surface-variant font-bold">No deals yet. Create your first combo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {deals.map(deal => {
            const total = deal.deal_items?.reduce((s, i) => s + Number(i.item_price), 0) || 0;
            const savings = total - Number(deal.deal_price);
            return (
              <div key={deal.id} className={`group bg-surface-container-high rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-2xl ${deal.active ? 'border-outline-variant/5' : 'border-outline-variant/5 opacity-60'}`}>
                <div className="h-36 overflow-hidden relative bg-[#1a1a2b]">
                  {deal.image_url ? (
                    <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-primary/40" style={{ fontVariationSettings: "'FILL' 1" }}>local_offer</span>
                      <span className="text-primary font-black text-sm uppercase tracking-widest">COMBO DEAL</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${deal.active ? 'bg-[#28A745]/20 text-[#28A745] border border-[#28A745]/30' : 'bg-error-container/20 text-error border border-error/30'}`}>
                      {deal.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {savings > 0 && (
                    <div className="absolute top-3 right-3 bg-primary text-on-primary px-2 py-1 rounded-full text-[10px] font-bold">
                      Save Rs. ${savings.toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-on-surface mb-1" style={{ fontFamily: 'Manrope' }}>{deal.title}</h3>
                  {deal.description && <p className="text-xs text-on-surface-variant mb-2 line-clamp-1">{deal.description}</p>}

                  {/* Items list */}
                  <div className="space-y-1 mb-3">
                    {deal.deal_items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px] text-primary">restaurant</span>{item.item_name}</span>
                        <span className="line-through opacity-50">Rs. ${Number(item.item_price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mb-4 pt-2 border-t border-outline-variant/10">
                    <span className="text-xl font-extrabold text-primary">Rs. ${Number(deal.deal_price).toFixed(2)}</span>
                    {total > 0 && <span className="text-sm text-on-surface-variant line-through">Rs. ${total.toFixed(2)}</span>}
                    <span className="text-xs text-tertiary font-bold ml-auto">{deal.deal_items?.length || 0} items</span>
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
            );
          })}
        </div>
      )}

      {/* Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-sm">
          <div className="bg-[rgba(40,40,58,0.98)] backdrop-blur-2xl w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
              <h2 className="text-xl font-bold text-on-surface" style={{ fontFamily: 'Manrope' }}>{modal === 'edit' ? 'Edit Combo Deal' : 'Create Combo Deal'}</h2>
              <button onClick={() => setModal(null)} className="w-9 h-9 rounded-full bg-surface-bright/20 flex items-center justify-center hover:bg-surface-bright/40 transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              <form onSubmit={handleSubmit} id="deal-form" className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Deal Name *</label>
                    <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                      className="w-full mt-1 bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none text-sm" placeholder="e.g. Burger + Fries + Drink Combo" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Description</label>
                    <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                      className="w-full mt-1 bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none text-sm" placeholder="Short description of the deal" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Deal Price *</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">Rs.</span>
                      <input required type="number" step="0.01" min="0" value={form.deal_price} onChange={e => setForm({...form, deal_price: e.target.value})}
                        className="w-full bg-surface-container-lowest border-none rounded-xl pl-7 pr-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none text-sm" placeholder="0.00" />
                    </div>
                    {originalTotal > 0 && form.deal_price && (
                      <p className="text-xs text-tertiary mt-1">
                        Original total: Rs. ${originalTotal.toFixed(2)} — Save Rs. ${(originalTotal - parseFloat(form.deal_price || 0)).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Image URL (Optional)</label>
                    <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})}
                      className="w-full mt-1 bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none text-sm" placeholder="https://..." />
                  </div>
                </div>

                {/* Item Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Select Items (2–5) *</label>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedItems.length >= 2 ? 'bg-tertiary/10 text-tertiary' : 'bg-error-container/10 text-error'}`}>
                      {selectedItems.length} selected
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                    {menuItems.map(item => {
                      const selected = isSelected(item);
                      return (
                        <button key={item.id} type="button" onClick={() => toggleItem(item)}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selected ? 'border-primary/50 bg-primary/10' : 'border-outline-variant/10 bg-surface-container-lowest hover:border-primary/30'}`}>
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-highest shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-surface-container-lowest">
                                <span className="material-symbols-outlined text-sm text-primary/50" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-on-surface truncate">{item.name}</p>
                            <p className="text-xs text-on-surface-variant">Rs. ${Number(item.price).toFixed(2)}</p>
                          </div>
                          {selected && <span className="material-symbols-outlined text-primary text-lg shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="active" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="w-4 h-4 accent-primary" />
                  <label htmlFor="active" className="text-sm text-on-surface-variant font-medium">Active (visible to students)</label>
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-outline-variant/10">
              <button type="button" onClick={() => setModal(null)} className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface transition-colors">Cancel</button>
              <button type="submit" form="deal-form" disabled={saving}
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-2.5 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                {saving && <span className="material-symbols-outlined animate-spin text-sm">refresh</span>}
                {modal === 'edit' ? 'Update Deal' : 'Create Deal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
