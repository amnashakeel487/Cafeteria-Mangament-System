import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BASE = '';

export default function CafeteriaProfile() {
  const token = localStorage.getItem('cafeteriaToken');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    location: '',
    contact: '',
    profile_picture: null,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE}/api/cafeteria/profile`, axiosConfig);
      setProfile(res.data);
      // Update local storage so the sidebar reflects changes immediately
      const savedData = JSON.parse(localStorage.getItem('cafeteriaData') || '{}');
      localStorage.setItem('cafeteriaData', JSON.stringify({ ...savedData, ...res.data }));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false }), 3500);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(`${BASE}/api/cafeteria/profile`, {
        name: profile.name,
        location: profile.location,
        contact: profile.contact,
        profile_picture: profile.profile_picture
      }, axiosConfig);
      showToast(res.data.message, 'success');
      
      // Update navbar/sidebar immediately
      const currentData = JSON.parse(localStorage.getItem('cafeteriaData') || '{}');
      currentData.name = profile.name;
      currentData.profile_picture = profile.profile_picture;
      localStorage.setItem('cafeteriaData', JSON.stringify(currentData));
      
      // Force a re-render by dispatching storage event for layout to catch
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return showToast('New passwords do not match', 'error');
    }
    setSaving(true);
    try {
      const res = await axios.put(`${BASE}/api/cafeteria/profile/password`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, axiosConfig);
      showToast(res.data.message, 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating password', 'error');
    } finally {
      setSaving(false);
    }
  };

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
            if (width > MAX_SIDE) { height *= MAX_SIDE / width; width = MAX_SIDE; }
          } else {
            if (height > MAX_SIDE) { width *= MAX_SIDE / height; height = MAX_SIDE; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            const compressed = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
            resolve(compressed);
          }, 'image/jpeg', 0.7);
        };
      };
    });
  };

  const isVideo = (url) => {
    if (!url) return false;
    const lower = url.toLowerCase().split('?')[0];
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    return videoExtensions.some(ext => lower.includes(ext));
  };

  const handleAvatarUpdate = async (url) => {
    if (!url) return;
    try {
      const res = await axios.post(`${BASE}/api/cafeteria/profile/picture`, { profile_picture: url }, axiosConfig);
      setProfile(prev => ({ ...prev, profile_picture: res.data.profile_picture }));
      showToast('Profile media updated!', 'success');
      
      const currentData = JSON.parse(localStorage.getItem('cafeteriaData') || '{}');
      currentData.profile_picture = res.data.profile_picture;
      localStorage.setItem('cafeteriaData', JSON.stringify(currentData));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      showToast(err.response?.data?.message || err.response?.data?.details || 'Failed to update media', 'error');
    }
  };

  const handleAvatarUpload = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024 && file.type.startsWith('image/')) {
      showToast('Large media detected. Compressing...', 'success');
      file = await compressImage(file);
      showToast('Media compressed to under 2MB successfully!', 'success');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await axios.post(`${BASE}/api/cafeteria/profile/picture`, formData, {
        headers: { ...axiosConfig.headers, 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({ ...prev, profile_picture: res.data.profile_picture }));
      showToast('Profile media updated!', 'success');
      
      const currentData = JSON.parse(localStorage.getItem('cafeteriaData') || '{}');
      currentData.profile_picture = res.data.profile_picture;
      localStorage.setItem('cafeteriaData', JSON.stringify(currentData));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      showToast(err.response?.data?.message || err.response?.data?.details || 'Failed to upload media', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
      </div>
    );
  }

  return (
    <section className="p-8 max-w-5xl mx-auto space-y-8 pt-10 pb-20">
      {/* Toast */}
      {toast.visible && (
        <div className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 z-50
            ${toast.type === 'success' ? 'bg-surface-container-highest border-[#28A745] text-on-surface' : 'bg-error-container/20 border-error text-error'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p className="text-sm font-bold">{toast.message}</p>
        </div>
      )}

      {/* Page Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2" style={{ fontFamily: 'Manrope' }}>Staff Settings</h1>
        <p className="text-on-surface-variant">Manage your cafeteria profile, kitchen hierarchy, and security credentials.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Sidebar Info Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface-container-high rounded-xl p-6 shadow-2xl border border-outline-variant/5">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {profile.profile_picture ? (
                  isVideo(profile.profile_picture) ? (
                    <video src={profile.profile_picture} className="w-32 h-32 rounded-full border-4 border-primary-container object-cover" autoPlay muted loop />
                  ) : (
                    <img src={profile.profile_picture} alt="Profile" className="w-32 h-32 rounded-full border-4 border-primary-container object-cover" />
                  )
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-primary-container bg-surface-container-lowest flex items-center justify-center text-primary text-4xl">
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>restaurant</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-widest">
                  Change Media
                </div>
                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*,video/*" className="hidden" />
              </div>
              
              <div className="w-full relative px-4">
                <span className="material-symbols-outlined absolute left-7 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm">link</span>
                <input 
                  type="text" 
                  placeholder="Paste URL..."
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg pl-10 pr-4 py-2 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/30"
                  value={profile.profile_picture || ''}
                  onChange={e => setProfile({...profile, profile_picture: e.target.value})}
                  onBlur={e => handleAvatarUpdate(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <h2 className="text-xl font-bold text-on-surface" style={{ fontFamily: 'Manrope' }}>{profile.name || 'Cafeteria Staff'}</h2>
                <p className="text-xs text-on-surface-variant font-medium mt-1 uppercase tracking-widest">{profile.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Account Status</h3>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm">JWT Authentication</span>
              <span className="h-2 w-2 rounded-full bg-tertiary"></span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm">Store Front</span>
              <span className="h-2 w-2 rounded-full bg-[#28A745]"></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm items-center flex gap-1"><span className="material-symbols-outlined text-xs">verified_user</span> Protected</span>
              <span className="h-2 w-2 rounded-full bg-[#28A745]"></span>
            </div>
          </div>
        </div>

        {/* Right Forms Area */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Section: Profile Info */}
          <section className="bg-surface-container-high rounded-xl overflow-hidden shadow-sm border border-outline-variant/5">
            <div className="px-6 py-4 border-b border-outline-variant/10">
              <h3 className="text-lg font-bold" style={{ fontFamily: 'Manrope' }}>Cafeteria Contact Information</h3>
            </div>
            <form onSubmit={handleProfileUpdate} className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="col-span-1 sm:col-span-2 space-y-2">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Official Cafeteria Name</label>
                  <input required type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                    className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-on-surface focus:ring-2 focus:ring-primary-container/40 transition-all outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Primary Email (Locked)</label>
                  <input type="email" value={profile.email} disabled
                    className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-on-surface-variant opacity-60 cursor-not-allowed outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Contact Phone / Ext</label>
                  <input type="text" value={profile.contact} onChange={e => setProfile({...profile, contact: e.target.value})}
                    className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-on-surface focus:ring-2 focus:ring-primary-container/40 transition-all outline-none" 
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-2">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Physical Campus Location</label>
                  <textarea rows="2" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})}
                    className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-on-surface focus:ring-2 focus:ring-primary-container/40 transition-all outline-none" 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="px-8 py-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-bright text-on-surface font-bold text-sm transition-all border border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">save</span>
                  Update Profile Data
                </button>
              </div>
            </form>
          </section>

          {/* Section: Security */}
          <section className="bg-surface-container-high rounded-xl overflow-hidden shadow-sm border border-outline-variant/5">
            <div className="px-6 py-4 border-b border-outline-variant/10">
              <h3 className="text-lg font-bold" style={{ fontFamily: 'Manrope' }}>Security Credentials</h3>
            </div>
            <form onSubmit={handlePasswordUpdate} className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Current Password</label>
                  <div className="relative">
                    <input required type={showPasswords.current ? "text" : "password"} value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                      className="w-full bg-surface-container-lowest border-none rounded-lg p-3 pr-12 text-sm text-on-surface focus:ring-2 focus:ring-primary-container/40 outline-none" placeholder="••••••••" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPasswords.current ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="hidden sm:block"></div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <input required type={showPasswords.new ? "text" : "password"} value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} minLength={6}
                      className="w-full bg-surface-container-lowest border-none rounded-lg p-3 pr-12 text-sm text-on-surface focus:ring-2 focus:ring-primary-container/40 outline-none" placeholder="••••••••" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPasswords.new ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <input required type={showPasswords.confirm ? "text" : "password"} value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} minLength={6}
                      className="w-full bg-surface-container-lowest border-none rounded-lg p-3 pr-12 text-sm text-on-surface focus:ring-2 focus:ring-primary-container/40 outline-none" placeholder="••••••••" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPasswords.confirm ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary-container/10 border-l-4 border-primary-container p-4 rounded-r-lg flex gap-3">
                <span className="material-symbols-outlined text-primary-container">info</span>
                <p className="text-sm text-on-surface-variant">Changing your password will take effect immediately. Keep it secure.</p>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="px-8 py-2.5 rounded-lg bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5D1900] shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-95 font-bold text-sm transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">lock_reset</span>
                  Update Password
                </button>
              </div>
            </form>
          </section>

        </div>
      </div>
    </section>
  );
}
