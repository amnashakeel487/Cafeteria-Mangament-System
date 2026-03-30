import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE = '';

export default function OrderTracking() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const res = await axios.get(`${BASE}/api/student/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) {
        setError('Failed to load tracking data.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#FFB59D]">refresh</span>
      </div>
    );
  }

  if (error || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 font-['Inter']">
        <span className="material-symbols-outlined text-6xl text-[#e1bfb5]/30 mb-4">receipt_long</span>
        <h2 className="text-2xl font-bold text-[#E3E0F8] font-['Manrope'] mb-2">No Active Orders</h2>
        <p className="text-[#e1bfb5] max-w-sm mb-6">Looks like you haven't placed any orders yet.</p>
        <button onClick={() => navigate('/student/cafeterias')} className="bg-[#FFB59D] text-[#5d1900] px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity">
            Browse Cafeterias
        </button>
      </div>
    );
  }

  // Live tracking tracks the most recent order. The rest would be history.
  const activeOrder = orders[0];
  const isOnline = activeOrder.payment_method === 'online';
  
  // Calculate active steps
  let currentStep = 1;
  if (isOnline) {
      if (activeOrder.payment_status === 'approved') currentStep = 2;
      if (activeOrder.status === 'processing') currentStep = 3;
      if (activeOrder.status === 'completed') currentStep = 5; // Assuming fully completed
  } else {
      if (activeOrder.status === 'processing') currentStep = 2;
      if (activeOrder.status === 'completed') currentStep = 4;
  }
  
  const totalSteps = isOnline ? 5 : 4;
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const renderStep = (stepNum, title, icon, isActive, isComplete, subtitle) => (
    <div key={title} className={`flex md:flex-col items-center gap-4 md:gap-6 relative z-10 w-full md:w-auto ${!isActive && !isComplete ? 'opacity-40' : ''}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center 
            ${isComplete ? 'bg-[#59d5fb] text-[#003744] shadow-lg shadow-[#59d5fb]/20' : 
              isActive ? 'bg-[#FF6B35] text-[#5f1900] shadow-lg shadow-[#FF6B35]/40 ring-4 ring-[#FF6B35]/20' : 
              'bg-[#28283a] text-[#e1bfb5]'}
        `}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive || isComplete ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
        </div>
        <div className="md:text-center">
            <p className={`text-sm font-bold ${isActive ? 'text-[#FFB59D]' : isComplete ? 'text-[#E3E0F8]' : 'text-[#e1bfb5]'}`}>{title}</p>
            <p className="text-xs text-[#e1bfb5]/70">{subtitle}</p>
        </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 font-['Inter']">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-['Manrope'] font-extrabold text-[#E3E0F8] tracking-tight mb-2">Track Your Order</h1>
          <p className="text-[#e1bfb5] text-lg">Order ID: <span className="text-[#FFB59D] font-mono font-bold">#{activeOrder.id.toString().padStart(6, '0')}</span></p>
        </div>
        <div className="flex items-center gap-3 bg-[#28283a] px-4 py-2 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-[#59d5fb] animate-pulse"></span>
          <span className="text-sm font-semibold text-[#59d5fb] tracking-wide uppercase">Live Update</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Progress Column */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-[#1E1E2F] rounded-xl p-8 shadow-2xl shadow-[#0c0c1d]/50 relative overflow-hidden border border-[#594139]/20">
            <h2 className="text-[#E3E0F8] font-['Manrope'] font-bold text-xl mb-10">Order Journey ({isOnline ? 'Online Payment' : 'Cash on Delivery'})</h2>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative gap-8 md:gap-2">
              
              {/* Progress Track (Background) */}
              <div className="hidden md:block absolute top-6 left-0 w-full h-1 bg-[#28283a] rounded-full"></div>
              
              {/* Progress Track (Active) */}
              <div 
                className="hidden md:block absolute top-6 left-0 h-1 bg-gradient-to-r from-[#59d5fb] to-[#FF6B35] rounded-full z-0 transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              ></div>
              
              {isOnline ? (
                  <>
                    {renderStep(1, 'Payment Submitted', 'check_circle', currentStep === 1, currentStep > 1, 'Placed')}
                    {renderStep(2, 'Approved', 'verified', currentStep === 2, currentStep > 2, 'Verified')}
                    {renderStep(3, 'Preparing', 'cooking', currentStep === 3, currentStep > 3, 'In Progress')}
                    {renderStep(4, 'Ready', 'restaurant_menu', currentStep === 4, currentStep > 4, 'Pick up')}
                    {renderStep(5, 'Completed', 'task_alt', currentStep === 5, currentStep > 5, 'Handoff')}
                  </>
              ) : (
                  <>
                    {renderStep(1, 'Pending', 'pending_actions', currentStep === 1, currentStep > 1, 'Placed')}
                    {renderStep(2, 'Preparing', 'cooking', currentStep === 2, currentStep > 2, 'In Progress')}
                    {renderStep(3, 'Ready', 'restaurant_menu', currentStep === 3, currentStep > 3, 'Pick up')}
                    {renderStep(4, 'Completed', 'task_alt', currentStep === 4, currentStep > 4, 'Handoff')}
                  </>
              )}
            </div>
          </div>
          
          {/* Live Status Visualization Cover */}
          <div className="h-64 rounded-xl overflow-hidden relative shadow-lg group border border-[#594139]/20">
            <div className="absolute inset-0 bg-[#0c0c1d]">
              {activeOrder.cafeteria_image ? (
                  <img src={activeOrder.cafeteria_image} className="w-full h-full object-cover opacity-40 grayscale group-hover:scale-105 transition-transform duration-700" />
              ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-30 bg-[#333345]">
                      <span className="material-symbols-outlined text-[#e1bfb5] text-6xl">restaurant</span>
                  </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#121222] via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FFB59D] mb-2 block">Destination</span>
                <h3 className="text-2xl font-['Manrope'] font-bold text-[#E3E0F8]">{activeOrder.cafeteria_name}</h3>
                <p className="text-[#e1bfb5] text-sm">Working on your freshly prepared order...</p>
              </div>
              <div className="bg-[#1E1E2F]/80 backdrop-blur-md px-4 py-2 rounded-lg border border-[#594139]/30 w-fit">
                <p className="text-[10px] uppercase font-bold text-[#59d5fb]">Est. Ready</p>
                <p className="text-xl font-['Manrope'] font-black text-[#E3E0F8]">~15 mins</p>
              </div>
            </div>
          </div>
          
        </div>

        {/* Detail Column */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#1E1E2F] rounded-xl p-6 shadow-xl border border-[#594139]/20">
                <h3 className="text-lg font-['Manrope'] font-bold text-[#E3E0F8] mb-4">Order Summary</h3>
                <div className="space-y-4 mb-6">
                    {activeOrder.items?.map(item => (
                        <div key={item.id} className="flex justify-between items-start text-sm">
                            <div className="flex gap-3">
                                <span className="text-[#FFB59D] font-bold">{item.quantity}x</span>
                                <p className="font-semibold text-[#E3E0F8]">{item.item_name}</p>
                            </div>
                            <span className="font-mono text-[#e1bfb5]">${Number(item.price).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="pt-4 border-t border-[#594139]/20 flex justify-between items-end">
                    <span className="font-['Inter'] text-[#e1bfb5]">Total Amount</span>
                    <span className="text-xl font-bold text-[#FFB59D]">${Number(activeOrder.total_amount).toFixed(2)}</span>
                </div>
            </div>
            
            {activeOrder.status === 'cancelled' && (
                <div className="bg-[#93000a]/20 border border-[#93000a] text-[#ffb4ab] p-6 rounded-xl font-bold text-center">
                    This order has been cancelled by the Cafeteria.
                </div>
            )}
            
            {activeOrder.payment_status === 'rejected' && (
                <div className="bg-[#93000a]/20 border border-[#93000a] text-[#ffb4ab] p-6 rounded-xl font-bold text-center flex flex-col gap-2">
                    <span className="material-symbols-outlined text-3xl">error</span>
                    Your payment screenshot was rejected by the cafeteria staff. Please contact them.
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
