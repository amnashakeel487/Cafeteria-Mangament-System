import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE = '';

export default function StudentProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Profile form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [orderCount, setOrderCount] = useState(0);

  // Password form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const res = await axios.get(`${BASE}/api/student/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setName(res.data.name || '');
        setEmail(res.data.email || '');
        setContact(res.data.contact || '');
        setProfileImage(res.data.profile_image || '');
        setOrderCount(res.data.orderCount || 0);
      } catch (err) {
        console.error('Failed to load profile', err);
        setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const isVideo = (url) => {
    if (!url) return false;
    const lower = url.toLowerCase().split('?')[0];
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    return videoExtensions.some(ext => lower.includes(ext));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const token = localStorage.getItem('studentToken');
      // Only send profile_image if it's a valid URL
      const imageToSave = profileImage && profileImage.startsWith('http') ? profileImage : null;
      await axios.put(`${BASE}/api/student/profile`, { name, contact, profile_image: imageToSave }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local storage
      const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
      localStorage.setItem('studentData', JSON.stringify({ ...studentData, name, profile_image: imageToSave }));
      window.dispatchEvent(new Event('storage'));
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024 && file.type.startsWith('image/')) {
      file = await compressImage(file);
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.post(`${BASE}/api/student/profile/picture`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setProfileImage(res.data.profile_image);
      const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
      localStorage.setItem('studentData', JSON.stringify({ ...studentData, profile_image: res.data.profile_image }));
      window.dispatchEvent(new Event('storage'));
      setMsg({ type: 'success', text: 'Profile picture updated!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to upload image' });
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const MAX = 1200;
          if (width > height && width > MAX) { height *= MAX / width; width = MAX; }
          else if (height > MAX) { width *= MAX / height; height = MAX; }
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.7);
        };
      };
    });
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setChangingPassword(true);
    setMsg({ type: '', text: '' });
    try {
      const token = localStorage.getItem('studentToken');
      await axios.put(`${BASE}/api/student/profile/password`, { oldPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg({ type: 'success', text: 'Password changed successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentData');
    localStorage.removeItem('studentCart');
    localStorage.removeItem('studentCartCafeteria');
    navigate('/student/login');
  };

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#FFB59D]">refresh</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 font-['Inter']">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold font-['Manrope'] tracking-tight text-[#E3E0F8] mb-2">Profile Settings</h1>
          <p className="text-[#e1bfb5]">Manage your preferences and university credentials.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleLogout} className="px-6 py-2.5 bg-[#93000a]/20 text-[#ffb4ab] rounded-lg font-semibold hover:bg-[#93000a]/40 transition-colors text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {msg.text && (
        <div className={`p-4 rounded-xl text-sm font-medium ${msg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-[#93000a]/20 text-[#ffb4ab] border border-[#93000a]/30'}`}>
          {msg.text}
        </div>
      )}

      {/* Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Stats */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-[#28283a] rounded-xl p-8 flex flex-col items-center text-center space-y-6 border border-[#594139]/20">
            <div className="relative group cursor-pointer">
              <label htmlFor="student-avatar-upload" className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#0c0c1d] ring-2 ring-[#FF6B35] shadow-2xl bg-[#333345] flex items-center justify-center relative cursor-pointer">
                {profileImage ? (
                  isVideo(profileImage) ? (
                    <video src={profileImage} className="w-full h-full object-cover" autoPlay muted loop />
                  ) : (
                    <img src={profileImage} className="w-full h-full object-cover" alt="Student" />
                  )
                ) : (
                  <span className="material-symbols-outlined text-5xl text-[#e1bfb5]/40">person</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="material-symbols-outlined text-white">photo_camera</span>
                </div>
              </label>
              <input type="file" id="student-avatar-upload" className="hidden" accept="image/*,video/*" onChange={handleImageUpload} />
            </div>
            
            <div className="w-full relative px-4">
                <span className="material-symbols-outlined absolute left-7 top-1/2 -translate-y-1/2 text-[#e1bfb5]/40 text-sm">link</span>
                <input 
                  type="text" 
                  placeholder="Profile Media URL..."
                  className="w-full bg-[#0c0c1d] border border-[#594139]/30 rounded-lg pl-10 pr-4 py-2 text-xs font-bold text-[#E3E0F8] focus:ring-1 focus:ring-[#FF6B35] outline-none transition-all placeholder:text-[#e1bfb5]/20"
                  value={profileImage && !profileImage.startsWith('data:') && profileImage.startsWith('http') ? profileImage : ''}
                  onChange={e => setProfileImage(e.target.value)}
                  onBlur={async (e) => {
                    const url = e.target.value;
                    if (!url || !url.startsWith('http')) return;
                    try {
                      const token = localStorage.getItem('studentToken');
                      const res = await axios.post(`${BASE}/api/student/profile/picture`, { profile_image: url }, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      setProfileImage(res.data.profile_image);
                      const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
                      localStorage.setItem('studentData', JSON.stringify({ ...studentData, profile_image: res.data.profile_image }));
                      window.dispatchEvent(new Event('storage'));
                      setMsg({ type: 'success', text: 'Profile picture updated!' });
                    } catch (err) {
                      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update picture' });
                    }
                  }}
                />
            </div>

            <div>
              <h3 className="text-xl font-bold font-['Manrope'] text-[#E3E0F8]">{name}</h3>
              <p className="text-sm text-[#e1bfb5]">{email}</p>
            </div>
            <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-[#594139]/20">
              <div className="text-center">
                <span className="block text-lg font-bold text-[#59d5fb]">{orderCount}</span>
                <span className="text-[10px] uppercase tracking-widest text-[#e1bfb5] font-bold">Orders</span>
              </div>
              <div className="text-center">
                <span className="block text-lg font-bold text-[#FFB59D]">Active</span>
                <span className="text-[10px] uppercase tracking-widest text-[#e1bfb5] font-bold">Status</span>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="bg-[#28283a] rounded-xl p-6 flex items-center gap-4 border-l-4 border-[#FF6B35]">
            <div className="p-3 bg-[#FF6B35]/10 rounded-lg">
              <span className="material-symbols-outlined text-[#FF6B35]" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#E3E0F8]">Account Security</h4>
              <p className="text-xs text-[#e1bfb5]">JWT-protected session active.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Personal Info Card */}
          <div className="bg-[#1E1E2F] rounded-xl p-8 space-y-8 border border-[#594139]/20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#FFB59D]">person</span>
              <h2 className="text-xl font-bold font-['Manrope'] text-[#E3E0F8]">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#e1bfb5] ml-1">Full Name</label>
                <input
                  className="w-full bg-[#0c0c1d] border-0 rounded-lg py-3 px-4 text-[#E3E0F8] focus:ring-2 focus:ring-[#FF6B35] transition-all outline-none"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#e1bfb5] ml-1">Contact</label>
                <input
                  className="w-full bg-[#0c0c1d] border-0 rounded-lg py-3 px-4 text-[#E3E0F8] focus:ring-2 focus:ring-[#FF6B35] transition-all outline-none"
                  type="text"
                  value={contact || ''}
                  placeholder="Not set"
                  onChange={e => setContact(e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#e1bfb5] ml-1">Email Address</label>
                <div className="relative">
                  <input
                    className="w-full bg-[#1a1a2b] border-0 rounded-lg py-3 px-4 text-[#E3E0F8]/60 cursor-not-allowed outline-none"
                    type="email"
                    value={email}
                    disabled
                  />
                  <span className="absolute right-4 top-3 text-[10px] bg-[#59d5fb]/20 text-[#59d5fb] px-2 py-0.5 rounded uppercase font-bold">Verified</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-8 py-2.5 bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5D1900] rounded-lg font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#FF6B35]/20"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Password Management Card */}
          <div className="bg-[#1E1E2F] rounded-xl p-8 space-y-8 border border-[#594139]/20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#FFB59D]">lock_reset</span>
              <h2 className="text-xl font-bold font-['Manrope'] text-[#E3E0F8]">Change Password</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#e1bfb5] ml-1">Old Password</label>
                <div className="relative">
                  <input
                    className="w-full bg-[#0c0c1d] border-0 rounded-lg py-3 px-4 pr-12 text-[#E3E0F8] focus:ring-2 focus:ring-[#FF6B35] transition-all placeholder:text-[#e1bfb5]/30 outline-none"
                    placeholder="••••••••••••"
                    type={showPasswords.old ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, old: !showPasswords.old})}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#e1bfb5]/50 hover:text-[#FF6B35] transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPasswords.old ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#e1bfb5] ml-1">New Password</label>
                  <div className="relative">
                    <input
                      className="w-full bg-[#0c0c1d] border-0 rounded-lg py-3 px-4 pr-12 text-[#E3E0F8] focus:ring-2 focus:ring-[#FF6B35] transition-all placeholder:text-[#e1bfb5]/30 outline-none"
                      placeholder="Min. 6 chars"
                      type={showPasswords.new ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#e1bfb5]/50 hover:text-[#FF6B35] transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPasswords.new ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#e1bfb5] ml-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      className="w-full bg-[#0c0c1d] border-0 rounded-lg py-3 px-4 pr-12 text-[#E3E0F8] focus:ring-2 focus:ring-[#FF6B35] transition-all placeholder:text-[#e1bfb5]/30 outline-none"
                      placeholder="Repeat password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#e1bfb5]/50 hover:text-[#FF6B35] transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPasswords.confirm ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 bg-[#1a1a2b] p-4 rounded-lg flex-1">
                  <span className="material-symbols-outlined text-[#e1bfb5] text-sm mt-0.5">info</span>
                  <p className="text-xs text-[#e1bfb5] leading-relaxed">Password must be at least 6 characters long.</p>
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !oldPassword || !newPassword || !confirmPassword}
                  className="ml-4 px-6 py-2.5 bg-[#333345] text-[#E3E0F8] rounded-lg font-semibold hover:bg-[#38374a] transition-colors text-sm disabled:opacity-50 whitespace-nowrap"
                >
                  {changingPassword ? 'Changing...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
