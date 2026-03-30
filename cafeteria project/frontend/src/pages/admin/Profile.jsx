import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '', contact: '', role: '', profile_image: '' });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('http://localhost:5000/api/admin/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
    } catch (err) {
      showToast('Failed to load profile data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Image too large (max 2MB)", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profile_image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const payload = { ...profile };
      if (password) payload.password = password;

      await axios.put('http://localhost:5000/api/admin/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sync local storage manually to immediately update Sidebar
      const oldAdmin = JSON.parse(localStorage.getItem('adminData') || "{}");
      localStorage.setItem('adminData', JSON.stringify({ ...oldAdmin, name: profile.name, profile_image: profile.profile_image }));

      showToast('Profile updated successfully!', 'success');
      setPassword(''); // Clear password field after success
      fetchProfile(); // re-fetch data to be sure
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: '' }), 3000);
  };

  if (loading) {
     return (
        <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm z-50 flex items-center justify-center text-primary h-screen w-full">
           <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
        </div>
     );
  }

  return (
    <section className="pt-28 pb-12 px-10 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Toast Notification */}
        {toast.visible && (
          <div className={`fixed bottom-8 right-8 p-4 rounded-xl shadow-2xl flex items-center space-x-3 z-50 animate-bounce cursor-pointer
            ${toast.type === 'success' ? 'bg-tertiary/20 border border-tertiary text-tertiary font-bold' : 'bg-error-container/20 border border-error text-error font-bold'}`}
            onClick={() => setToast({ visible: false, message: '', type: '' })}
          >
            <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
            <p className="text-sm">{toast.message}</p>
          </div>
        )}

        <div className="mb-10">
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Account Settings</h2>
          <p className="text-on-surface-variant mt-2 text-lg">Manage your architectural identity and system credentials.</p>
        </div>

        {/* Asymmetric Layout: 2/3 Content, 1/3 Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-surface-container rounded-xl p-8 border border-outline-variant/5 shadow-2xl shadow-[#0C0C1D]/50 relative">
              {saving && (
                 <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm z-10 flex items-center justify-center text-primary rounded-xl">
                    <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
                 </div>
              )}
              
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary">badge</span>
                <h3 className="text-xl font-bold font-headline">Personal Information</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/70 ml-1">Full Name</label>
                  <div className="relative">
                    <input 
                       required
                       className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary transition-all focus:border-transparent outline-none" 
                       type="text" 
                       value={profile.name} 
                       onChange={e => setProfile({...profile, name: e.target.value})} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/70 ml-1">Email Address</label>
                  <div className="relative">
                    <input 
                       required
                       className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary transition-all focus:border-transparent outline-none" 
                       type="email" 
                       value={profile.email} 
                       onChange={e => setProfile({...profile, email: e.target.value})} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/70 ml-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <input 
                       className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary transition-all focus:border-transparent outline-none" 
                       type="tel" 
                       value={profile.contact} 
                       onChange={e => setProfile({...profile, contact: e.target.value})} 
                       placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/70 ml-1">Admin Role</label>
                  <div className="relative">
                    <input 
                       className="w-full bg-surface-container-low/50 border border-outline-variant/10 rounded-lg py-3 px-4 text-on-surface-variant/40 cursor-not-allowed uppercase font-bold tracking-widest" 
                       disabled 
                       type="text" 
                       value={profile.role} 
                    />
                  </div>
                </div>
                
                {/* Visual Separator for Password */}
                <div className="md:col-span-2 pt-6 border-t border-outline-variant/10 flex items-center gap-3 mb-2 mt-4">
                  <span className="material-symbols-outlined text-tertiary">lock</span>
                  <h3 className="text-xl font-bold font-headline">Security Update</h3>
                </div>

                <div className="md:col-span-2 space-y-2 mb-4">
                  <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/70 ml-1">New Password (Optional)</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30">password</span>
                    <input 
                       className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-3 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-tertiary transition-all focus:border-transparent outline-none" 
                       type="password" 
                       placeholder="Leave blank to keep existing password"
                       value={password}
                       onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-4 flex justify-end">
                  <button 
                     disabled={saving}
                     className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-3 px-8 rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto" 
                     type="submit"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
            
          </div>

          {/* Profile Sidebar */}
          <div className="space-y-8">
            {/* Profile Card */}
            <div className="bg-surface-container-high rounded-xl overflow-hidden shadow-2xl shadow-[#0C0C1D]/50 border border-outline-variant/5">
              <div className="h-24 bg-gradient-to-br from-[#ffb59d] to-[#ff6b35] opacity-80"></div>
              <div className="px-6 pb-8 -mt-12 flex flex-col items-center text-center">
                <div className="relative group">
                  <label htmlFor="profile-upload" className="w-32 h-32 rounded-full border-4 border-surface-container-high bg-surface-container-lowest flex items-center justify-center shadow-xl overflow-hidden cursor-pointer group-hover:opacity-80 transition-opacity relative">
                     {profile.profile_image ? (
                        <img src={profile.profile_image} className="w-full h-full object-cover" alt="Profile" />
                     ) : (
                        <span className="material-symbols-outlined text-6xl text-primary/50">account_circle</span>
                     )}
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white">photo_camera</span>
                     </div>
                     <input type="file" id="profile-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
                <h4 className="mt-4 text-2xl font-bold font-headline">{profile.name}</h4>
                <p className="text-primary font-medium">{profile.email}</p>
                <div className="mt-6 w-full grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/5">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Access Level</p>
                    <p className="text-sm font-bold uppercase text-tertiary">{profile.role}</p>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/5">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Status</p>
                    <div className="flex items-center justify-center space-x-1 mt-0.5">
                       <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                       <p className="text-sm font-bold">Online</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="bg-surface-container-high/40 backdrop-blur-md p-6 rounded-xl border border-outline-variant/5 shadow-2xl">
              <p className="font-bold mb-2">Need Technical Help?</p>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">Our system architect team is available 24/7 for administrative overrides and server inquiries.</p>
              <button className="w-full py-2 bg-surface-bright/50 text-xs font-bold rounded-lg hover:bg-surface-container-highest flex items-center justify-center space-x-2 transition-colors uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm">support_agent</span>
                  <span>Contact IT Support</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
