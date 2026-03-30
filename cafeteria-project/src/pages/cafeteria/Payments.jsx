import { useState, useEffect } from 'react';
import axios from 'axios';

const BANKS = [
  'Habib Bank Limited (HBL)',
  'Meezan Bank',
  'United Bank Limited (UBL)',
  'Allied Bank',
  'National Bank of Pakistan',
  'Bank Alfalah',
  'MCB Bank',
  'Askari Bank',
];

const BASE = '';

const Toggle = ({ checked, onChange, color = 'primary' }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
    <div className={`w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer 
      peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
      after:bg-on-surface after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 
      after:transition-all peer-checked:bg-${color}`}></div>
  </label>
);

const FieldInput = ({ label, value, onChange, placeholder, type = 'text', focusColor = 'primary', maxLen }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{label}</label>
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      maxLength={maxLen}
      className={`w-full bg-surface-container-lowest border-none rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-${focusColor}/60 placeholder:text-outline-variant/50 transition-all outline-none`}
    />
  </div>
);

export default function CafeteriaPayments() {
  const token = localStorage.getItem('cafeteriaToken');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  const [jazzcash, setJazzcash] = useState({ enabled: true, name: '', number: '' });
  const [easypaisa, setEasypaisa] = useState({ enabled: true, name: '', number: '' });
  const [bank, setBank] = useState({ name: BANKS[0], account: '', instructions: '' });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${BASE}/api/cafeteria/payments`, axiosConfig);
      if (res.data) {
        const d = res.data;
        setJazzcash({ enabled: !!d.jazzcash_enabled, name: d.jazzcash_name || '', number: d.jazzcash_number || '' });
        setEasypaisa({ enabled: !!d.easypaisa_enabled, name: d.easypaisa_name || '', number: d.easypaisa_number || '' });
        setBank({ name: d.bank_name || BANKS[0], account: d.bank_account || '', instructions: d.bank_instructions || '' });
      }
    } catch { showToast('Failed to load payment settings.', 'error'); }
    finally { setLoading(false); }
  };

  const validate = () => {
    const err = {};
    const phone = /^03\d{9}$/;
    if (jazzcash.enabled) {
      if (!jazzcash.name.trim()) err.jcName = 'Account holder name is required';
      if (!jazzcash.number.trim()) err.jcNum = 'JazzCash number is required';
      else if (!phone.test(jazzcash.number.replace(/[-\s]/g, ''))) err.jcNum = 'Use format: 03XXXXXXXXX';
    }
    if (easypaisa.enabled) {
      if (!easypaisa.name.trim()) err.epName = 'Account holder name is required';
      if (!easypaisa.number.trim()) err.epNum = 'EasyPaisa number is required';
      else if (!phone.test(easypaisa.number.replace(/[-\s]/g, ''))) err.epNum = 'Use format: 03XXXXXXXXX';
    }
    return err;
  };

  const handleSave = async () => {
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setSaving(true);
    try {
      await axios.put(`${BASE}/api/cafeteria/payments`, {
        jazzcash_enabled: jazzcash.enabled,
        jazzcash_name: jazzcash.name,
        jazzcash_number: jazzcash.number,
        easypaisa_enabled: easypaisa.enabled,
        easypaisa_name: easypaisa.name,
        easypaisa_number: easypaisa.number,
        bank_name: bank.name,
        bank_account: bank.account,
        bank_instructions: bank.instructions,
      }, axiosConfig);
      showToast('Payment settings saved successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed.', 'error');
    } finally { setSaving(false); }
  };

  const handleDiscard = () => { fetchSettings(); setErrors({}); };

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ ...toast, visible: false }), 3500);
  };

  // Live preview helpers
  const previewMethods = [
    jazzcash.enabled && jazzcash.number ? { label: 'JazzCash', detail: jazzcash.number, active: true } : null,
    easypaisa.enabled && easypaisa.number ? { label: 'EasyPaisa', detail: easypaisa.number, active: false } : null,
    bank.account ? { label: 'Bank Transfer', detail: bank.name, active: false } : null,
  ].filter(Boolean);

  if (loading) return (
    <div className="flex items-center justify-center h-full pt-32">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span>
    </div>
  );

  return (
    <section className="p-8 max-w-7xl mx-auto pt-10">
      {/* Toast */}
      {toast.visible && (
        <div className={`fixed bottom-8 right-8 flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl border-l-4 z-50
            ${toast.type === 'success' ? 'bg-surface-container-highest border-primary text-on-surface' : 'bg-error-container/20 border-error text-error'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <div>
            <p className="text-sm font-bold">{toast.type === 'success' ? 'Settings Saved' : 'Error'}</p>
            <p className="text-xs text-on-surface-variant">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2" style={{ fontFamily: 'Manrope' }}>Payment Settings</h2>
          <p className="text-on-surface-variant max-w-lg text-sm">Configure how students pay for their meals. These details appear during checkout.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDiscard}
            className="px-6 py-2.5 rounded-lg font-semibold text-primary border border-primary/20 hover:bg-primary/5 transition-all">
            Discard
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-8 py-2.5 rounded-lg font-semibold text-on-primary bg-gradient-to-br from-primary to-primary-container shadow-lg shadow-primary-container/20 active:scale-95 transition-all flex items-center gap-2">
            {saving && <span className="material-symbols-outlined animate-spin text-sm">refresh</span>}
            Save Changes
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Forms */}
        <div className="lg:col-span-8 space-y-8">

          {/* JazzCash */}
          <section className="bg-surface-container-high rounded-xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-surface-container-lowest rounded-full flex items-center justify-center border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ fontFamily: 'Manrope' }}>JazzCash</h3>
                <p className="text-sm text-on-surface-variant">Mobile wallet integration</p>
              </div>
              <div className="ml-auto">
                <Toggle checked={jazzcash.enabled} onChange={e => setJazzcash({ ...jazzcash, enabled: e.target.checked })} color="primary-container" />
              </div>
            </div>
            {jazzcash.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FieldInput label="Account Holder Name" value={jazzcash.name}
                    onChange={e => setJazzcash({ ...jazzcash, name: e.target.value })}
                    placeholder="e.g. University Cafeteria Admin" />
                  {errors.jcName && <p className="text-xs text-error mt-1 px-1">{errors.jcName}</p>}
                </div>
                <div>
                  <FieldInput label="JazzCash Number" value={jazzcash.number}
                    onChange={e => setJazzcash({ ...jazzcash, number: e.target.value })}
                    placeholder="03XX-XXXXXXX" maxLen={13} />
                  {errors.jcNum && <p className="text-xs text-error mt-1 px-1">{errors.jcNum}</p>}
                </div>
              </div>
            )}
            {!jazzcash.enabled && (
              <p className="text-sm text-on-surface-variant/60 italic">JazzCash is disabled and will not be shown to students.</p>
            )}
          </section>

          {/* EasyPaisa */}
          <section className="bg-surface-container-high rounded-xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-tertiary/10 transition-colors"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-surface-container-lowest rounded-full flex items-center justify-center border border-outline-variant/20">
                <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>phone_iphone</span>
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ fontFamily: 'Manrope' }}>EasyPaisa</h3>
                <p className="text-sm text-on-surface-variant">Standard mobile payment</p>
              </div>
              <div className="ml-auto">
                <Toggle checked={easypaisa.enabled} onChange={e => setEasypaisa({ ...easypaisa, enabled: e.target.checked })} color="tertiary" />
              </div>
            </div>
            {easypaisa.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FieldInput label="Account Holder Name" value={easypaisa.name}
                    onChange={e => setEasypaisa({ ...easypaisa, name: e.target.value })}
                    placeholder="e.g. Main Hub Billing" focusColor="tertiary" />
                  {errors.epName && <p className="text-xs text-error mt-1 px-1">{errors.epName}</p>}
                </div>
                <div>
                  <FieldInput label="EasyPaisa Number" value={easypaisa.number}
                    onChange={e => setEasypaisa({ ...easypaisa, number: e.target.value })}
                    placeholder="03XX-XXXXXXX" focusColor="tertiary" maxLen={13} />
                  {errors.epNum && <p className="text-xs text-error mt-1 px-1">{errors.epNum}</p>}
                </div>
              </div>
            )}
            {!easypaisa.enabled && (
              <p className="text-sm text-on-surface-variant/60 italic">EasyPaisa is disabled and will not be shown to students.</p>
            )}
          </section>

          {/* Bank Transfer */}
          <section className="bg-surface-container-high rounded-xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-surface-container-lowest rounded-full flex items-center justify-center border border-outline-variant/20">
                <span className="material-symbols-outlined text-on-surface">account_balance</span>
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ fontFamily: 'Manrope' }}>Direct Bank Transfer</h3>
                <p className="text-sm text-on-surface-variant">Recommended for large bulk orders</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Bank Name</label>
                <select value={bank.name} onChange={e => setBank({ ...bank, name: e.target.value })}
                  className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary/60 transition-all appearance-none outline-none">
                  {BANKS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <FieldInput label="Account Number / IBAN" value={bank.account}
                onChange={e => setBank({ ...bank, account: e.target.value })}
                placeholder="PK00 MEZN XXXX XXXX XXXX" />
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Additional Instructions for Students</label>
                <textarea rows={3} value={bank.instructions} onChange={e => setBank({ ...bank, instructions: e.target.value })}
                  placeholder="Please upload a screenshot of your transfer receipt to the portal after payment..."
                  className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary/60 placeholder:text-outline-variant/50 transition-all resize-none outline-none" />
              </div>
            </div>
          </section>
        </div>

        {/* Right: Preview + Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Student Preview */}
          <div className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant/5">
            <div className="bg-surface-container-highest p-4 border-b border-outline-variant/10">
              <h4 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">visibility</span>
                Student Preview
              </h4>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center pb-4 border-b border-outline-variant/10">
                <p className="text-xs text-on-surface-variant uppercase font-bold tracking-tighter">Select Payment Method</p>
              </div>
              <div className="space-y-3">
                {previewMethods.length === 0 ? (
                  <p className="text-center text-xs text-on-surface-variant py-4">Enable at least one method above to preview.</p>
                ) : previewMethods.map((m, i) => (
                  <div key={m.label} className={`p-4 rounded-lg flex items-center gap-4 transition-all
                    ${i === 0 ? 'bg-surface-container-high border border-primary/20' : 'bg-surface-container-low border border-outline-variant/10 opacity-60'}`}>
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary shadow-[0_0_8px_rgba(255,107,53,0.8)]' : 'bg-outline-variant'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{m.label}</p>
                      <p className="text-xs text-on-surface-variant">{m.detail}</p>
                    </div>
                    {i === 0 && <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                  </div>
                ))}
              </div>
              <button className="w-full py-3 bg-surface-container-highest rounded-lg text-sm font-bold text-on-surface-variant cursor-not-allowed">
                Complete Purchase
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-6 bg-surface-container-lowest rounded-xl border border-tertiary/20">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-tertiary mt-0.5">info</span>
              <div className="space-y-2">
                <h5 className="font-bold text-tertiary" style={{ fontFamily: 'Manrope' }}>Payment Verification</h5>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Ensure all numbers are correct. Incorrect account details will lead to payment disputes and order cancellations.
                </p>
              </div>
            </div>
          </div>

          {/* Active Methods Summary */}
          <div className="bg-surface-container-high rounded-xl p-6 space-y-4 border border-outline-variant/10">
            <h5 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">Active Methods</h5>
            {[
              { key: 'JazzCash', active: jazzcash.enabled && !!jazzcash.number, detail: jazzcash.number, color: 'text-primary' },
              { key: 'EasyPaisa', active: easypaisa.enabled && !!easypaisa.number, detail: easypaisa.number, color: 'text-tertiary' },
              { key: 'Bank Transfer', active: !!bank.account, detail: bank.name, color: 'text-on-surface-variant' },
            ].map(m => (
              <div key={m.key} className="flex items-center justify-between text-sm">
                <span className="text-on-surface font-medium">{m.key}</span>
                {m.active ? (
                  <span className={`flex items-center gap-1 font-bold ${m.color}`}>
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Configured
                  </span>
                ) : (
                  <span className="text-on-surface-variant/40 text-xs">Not set</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
