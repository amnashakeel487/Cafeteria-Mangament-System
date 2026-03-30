export default function StudentHome() {
  const student = JSON.parse(localStorage.getItem('studentData') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentData');
    window.location.href = '/student/login';
  };

  return (
    <div className="p-10 text-on-surface font-['Manrope']">
      <h1 className="text-3xl font-bold mb-4">Welcome, {student.name}!</h1>
      <p className="mb-8">This is the student home placeholder.</p>
      <button 
        onClick={handleLogout}
        className="px-6 py-2 bg-error text-white font-bold rounded-lg"
      >
        Logout
      </button>
    </div>
  );
}
