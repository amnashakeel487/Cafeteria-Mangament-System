import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
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

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.id && s.id.toString().includes(search))
  );

  return (
    <div className="pt-28 px-10 pb-12 space-y-10 font-['Inter'] relative">
      {message.text && (
        <div className={`fixed top-24 right-10 p-4 rounded-xl shadow-lg shadow-black/30 z-[100] text-sm font-bold flex items-center gap-2 transition-all ${message.type === 'error' ? 'bg-error-container text-on-error' : 'bg-tertiary-container text-on-tertiary-container'}`}>
           <span className="material-symbols-outlined">{message.type === 'error' ? 'error' : 'check_circle'}</span>
           {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface editorial-text">Students Directory</h2>
          <p className="text-on-surface-variant font-medium">Manage campus culinary access and dietary requirements.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => handleOpenModal('add')} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-lg">person_add</span>
            Add New Student
          </button>
        </div>
      </div>

      {/* Filters Region */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-8 p-6 bg-surface-container rounded-xl flex items-center justify-between border border-outline-variant/5">
          <div className="relative w-full max-w-md group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors">search</span>
            <input 
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-highest border-none rounded-xl py-3 pl-12 pr-4 text-sm text-on-surface focus:ring-1 focus:ring-primary/50 placeholder-on-surface-variant/30 font-label outline-none" 
              placeholder="Search student records, IDs, or emails..." />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 p-6 bg-surface-container-high rounded-xl flex items-center gap-6 border border-outline-variant/5">
          <div className="w-14 h-14 rounded-full bg-tertiary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary text-3xl">groups</span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-on-surface editorial-text">{students.length}</p>
            <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">Total Enrolled</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-surface-container rounded-2xl overflow-hidden shadow-2xl shadow-surface-container-lowest/50 border border-outline-variant/5 relative">
        {loading && <div className="absolute inset-0 bg-surface-container-highest/50 backdrop-blur-sm z-10 flex items-center justify-center text-primary"><span className="material-symbols-outlined animate-spin text-4xl">refresh</span></div>}
        <div className="overflow-x-auto min-h-[300px]">
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
                    <span className="px-3 py-1 bg-tertiary/10 text-tertiary text-[10px] font-extrabold uppercase rounded-full tracking-widest">Active Plan</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal('edit', student)} className="p-2 text-on-surface-variant/40 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button onClick={() => handleDelete(student.id)} className="p-2 text-on-surface-variant/40 hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center text-on-surface-variant">No students found matching your criteria.</td>
                </tr>
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
                <label className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Password {modalMode === 'edit' && "(Optional)"}</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required={modalMode === 'add'} value={currentStudent.password} onChange={e => setCurrentStudent({...currentStudent, password: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg px-4 py-3 pr-12 text-sm text-on-surface font-label focus:ring-2 focus:ring-primary/50 outline-none" placeholder="••••••••" />
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
