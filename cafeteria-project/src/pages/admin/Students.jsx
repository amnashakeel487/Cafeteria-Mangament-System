import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('approved'); // 'approved' | 'pending'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentStudent, setCurrentStudent] = useState({ id: null, name: '', email: '', password: '', contact: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);

  const token = localStorage.getItem('adminToken');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/students', axiosConfig);
      setStudents(res.data);
    } catch (err) {
      showMessage('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/admin/students/${id}/status`, { status: 'approved' }, axiosConfig);
      showMessage('Student approved!', 'success');
      fetchStudents();
    } catch { showMessage('Failed to approve', 'error'); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject and delete this registration?')) return;
    try {
      await axios.put(`/api/admin/students/${id}/status`, { status: 'rejected' }, axiosConfig);
      showMessage('Registration rejected.', 'success');
      fetchStudents();
    } catch { showMessage('Failed to reject', 'error'); }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleOpenModal = (mode, student = null) => {
    setModalMode(mode);
    setShowPassword(false);
    if (student) {
      setCurrentStudent({ ...student, password: '' });
    } else {
      setCurrentStudent({ id: null, name: '', email: '', password: '', contact: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (modalMode === 'add') {
        await axios.post('/api/admin/students', currentStudent, axiosConfig);
        showMessage('Student added successfully');
      } else {
        await axios.put(`/api/admin/students/${currentStudent.id}`, currentStudent, axiosConfig);
        showMessage('Student updated successfully');
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      setLoading(true);
      await axios.delete(`/api/admin/students/${id}`, axiosConfig);
      showMessage('Student deleted successfully');
      fetchStudents();
    } catch (err) {
      showMessage('Failed to delete student', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.id && s.id.toString().includes(search));
    const matchTab = tab === 'pending' ? s.status === 'pending' : s.status !== 'pending';
    return matchSearch && matchTab;
  });

  return (
    <div className="pt-20 md:pt-28 px-4 md:px-10 pb-12 space-y-6 md:space-y-10 font-['Inter'] relative">
      {message.text && (
        <div className={`fixed top-20 right-4 md:right-10 p-3 md:p-4 rounded-xl shadow-lg shadow-black/30 z-[100] text-sm font-bold flex items-center gap-2 transition-all ${message.type === 'error' ? 'bg-error-container text-on-error' : 'bg-tertiary-container text-on-tertiary-container'}`}>
           <span className="material-symbols-outlined">{message.type === 'error' ? 'error' : 'check_circle'}</span>
           {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6 md:mb-10">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface editorial-text">Students Directory</h2>
          <p className="text-on-surface-variant font-medium text-sm">Manage campus culinary access and dietary requirements.</p>
        </div>
        <button onClick={() => handleOpenModal('add')} className="flex items-center gap-2 px-4 md:px-8 py-2.5 md:py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-95 transition-all text-sm w-fit">
          <span className="material-symbols-outlined text-lg">person_add</span>
          Add Student
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-surface-container-low p-1 rounded-xl w-fit mb-6 md:mb-8">
        <button onClick={() => setTab('approved')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'approved' ? 'bg-surface-container-highest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
          Approved <span className="ml-1 text-[10px] bg-surface-container-lowest px-2 py-0.5 rounded-full">{students.filter(s => s.status !== 'pending').length}</span>
        </button>
        <button onClick={() => setTab('pending')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${tab === 'pending' ? 'bg-surface-container-highest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
          Pending Approval
          {students.filter(s => s.status === 'pending').length > 0 && (
            <span className="bg-error text-on-error text-[10px] px-2 py-0.5 rounded-full font-bold">{students.filter(s => s.status === 'pending').length}</span>
          )}
        </button>
      </div>

      {/* Filters Region */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 md:mb-8">
        <div className="flex-1 p-4 md:p-6 bg-surface-container rounded-xl flex items-center border border-outline-variant/5">
          <div className="relative w-full group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors">search</span>
            <input 
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-highest border-none rounded-xl py-2.5 pl-12 pr-4 text-sm text-on-surface focus:ring-1 focus:ring-primary/50 placeholder-on-surface-variant/30 font-label outline-none" 
              placeholder="Search students..." />
          </div>
        </div>
        <div className="p-4 md:p-6 bg-surface-container-high rounded-xl flex items-center gap-4 border border-outline-variant/5">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-tertiary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary text-2xl md:text-3xl">groups</span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-extrabold text-on-surface editorial-text">{students.length}</p>
            <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">Total Enrolled</p>
          </div>
        </div>
      </div>

      {/* Main Table - hidden on mobile, shown on md+ */}
      <div className="bg-surface-container rounded-2xl overflow-hidden shadow-2xl shadow-surface-container-lowest/50 border border-outline-variant/5 relative">
        {loading && <div className="absolute inset-0 bg-surface-container-highest/50 backdrop-blur-sm z-10 flex items-center justify-center text-primary"><span className="material-symbols-outlined animate-spin text-4xl">refresh</span></div>}
        
        {/* Mobile card view */}
        <div className="md:hidden divide-y divide-outline-variant/5">
          {filteredStudents.map(student => (
            <div key={student.id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0">{student.name.charAt(0).toUpperCase()}</div>
                <div className="min-w-0">
                  <p className="font-bold text-on-surface text-sm truncate">{student.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{student.email}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                {tab === 'pending' ? (
                  <>
                    <button onClick={() => handleApprove(student.id)} className="p-2 text-tertiary hover:bg-tertiary/10 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">check_circle</span></button>
                    <button onClick={() => handleReject(student.id)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">cancel</span></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleOpenModal('edit', student)} className="p-2 text-on-surface-variant/40 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                    <button onClick={() => handleDelete(student.id)} className="p-2 text-on-surface-variant/40 hover:text-error transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                  </>
                )}
              </div>
            </div>
          ))}
          {filteredStudents.length === 0 && !loading && (
            <p className="px-4 py-10 text-center text-on-surface-variant text-sm">{tab === 'pending' ? 'No pending registrations.' : 'No students found.'}</p>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-5 text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">Student</th>
                <th className="px-8 py-5 text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">Email Address</th>
                <th className="px-8 py-5 text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">Contact Info</th>
                <th className="px-8 py-5 text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filteredStudents.map(student => (
                <tr key={student.id} className="group hover:bg-surface-container-highest/40 transition-all duration-200">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg">{student.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="font-bold text-on-surface">{student.name}</p>
                        <p className="text-xs text-on-surface-variant/60">ID: SF-{2024}-{student.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-on-surface-variant font-medium text-sm">{student.email}</td>
                  <td className="px-8 py-6 text-on-surface-variant font-medium text-sm">{student.contact || 'N/A'}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-full tracking-widest ${student.status === 'pending' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'}`}>
                      {student.status === 'pending' ? 'Pending' : 'Active'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      {tab === 'pending' ? (
                        <>
                          <button onClick={() => handleApprove(student.id)} className="p-2 text-tertiary hover:bg-tertiary/10 rounded-lg transition-colors" title="Approve"><span className="material-symbols-outlined text-xl">check_circle</span></button>
                          <button onClick={() => handleReject(student.id)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors" title="Reject"><span className="material-symbols-outlined text-xl">cancel</span></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleOpenModal('edit', student)} className="p-2 text-on-surface-variant/40 hover:text-primary transition-colors"><span className="material-symbols-outlined text-xl">edit</span></button>
                          <button onClick={() => handleDelete(student.id)} className="p-2 text-on-surface-variant/40 hover:text-error transition-colors"><span className="material-symbols-outlined text-xl">delete</span></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && !loading && (
                <tr><td colSpan="5" className="px-8 py-16 text-center text-on-surface-variant">No students found matching your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c1d]/80 backdrop-blur p-4">
          <div className="max-w-md w-full bg-surface-container-high rounded-2xl p-8 shadow-2xl border border-outline-variant/10 ambient-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold editorial-text text-on-surface">{modalMode === 'add' ? 'Add New Student' : 'Edit Student Record'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1 flex flex-col">
                <label className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Full Name</label>
                <input required value={currentStudent.name} onChange={e => setCurrentStudent({...currentStudent, name: e.target.value})} className="bg-surface-container-lowest border-none rounded-lg px-4 py-3 text-sm text-on-surface font-label focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Julian Thorne" />
              </div>
              <div className="space-y-1 flex flex-col">
                <label className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Email Address</label>
                <input required type="email" value={currentStudent.email} onChange={e => setCurrentStudent({...currentStudent, email: e.target.value})} className="bg-surface-container-lowest border-none rounded-lg px-4 py-3 text-sm text-on-surface font-label focus:ring-2 focus:ring-primary/50 outline-none" placeholder="j.thorne@university.edu" />
              </div>
              <div className="space-y-1 flex flex-col">
                <label className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Contact Details</label>
                <input value={currentStudent.contact} onChange={e => setCurrentStudent({...currentStudent, contact: e.target.value})} className="bg-surface-container-lowest border-none rounded-lg px-4 py-3 text-sm text-on-surface font-label focus:ring-2 focus:ring-primary/50 outline-none" placeholder="(555) 123-4567" />
              </div>
              <div className="space-y-1 flex flex-col">
                <label className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Password {modalMode === 'edit' && "(Leave blank to keep current)"}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={modalMode === 'add'}
                    value={currentStudent.password}
                    onChange={e => setCurrentStudent({...currentStudent, password: e.target.value})}
                    className="w-full bg-surface-container-lowest border-none rounded-lg px-4 py-3 pr-12 text-sm text-on-surface font-label focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder={modalMode === 'edit' ? 'Type new password to change...' : '••••••••'}
                  />
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
                {modalMode === 'edit' && (
                  <p className="text-[10px] text-on-surface-variant/50 mt-1">Current password is securely hashed. Enter a new one only if you want to change it.</p>
                )}
              </div>
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-surface-container hover:bg-surface-bright text-on-surface font-bold rounded-lg transition-colors text-sm">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-3.5 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-lg text-sm">
                   {loading ? 'Processing...' : (modalMode === 'add' ? 'Create Student' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
