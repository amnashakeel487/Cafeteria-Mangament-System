import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import DefaultImage from '../../assets/default_dish.png';

const BASE = '';
const DEFAULT_IMAGE = DefaultImage; // COMSATS Cafe logo as default image

export default function CartCheckout() {
  const navigate = useNavigate();
  const { cart, cafeteriaId, addToCart, removeFromCart, cartTotal, cartItemCount, clearCart } = useCart();
  
  const [cafeteria, setCafeteria] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout States
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'online'
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cafeteriaId) {
      setLoading(false);
      return;
    }

    const fetchCafeteria = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const res = await axios.get(`${BASE}/api/student/cafeterias`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const cafe = res.data.find(c => c.id.toString() === cafeteriaId.toString());
        if (cafe) setCafeteria(cafe);

        // Fetch payment details
        const payRes = await axios.get(`${BASE}/api/payments/public/${cafeteriaId}`);
        setPaymentInfo(payRes.data);
      } catch (err) {
        console.error('Failed to load cafeteria for cart', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCafeteria();
  }, [cafeteriaId]);

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

  const handleFileChange = async (e) => {
      let file = e.target.files[0];
      if (!file) return;

      if (!['image/jpeg', 'image/png'].includes(file.type)) {
          alert("Please upload a valid image file (JPG/PNG)");
          return;
      }

      if (file.size > 2 * 1024 * 1024) {
          setError("Large screenshot detected. Compressing to under 2MB...");
          file = await compressImage(file);
          setError(""); // Clear message after compression
      }
      
      setScreenshot(file);
  };

  const handleCheckout = async () => {
      if (paymentMethod === 'online' && !screenshot) {
          setError("Please upload a payment screenshot for online payment.");
          return;
      }
      
      setSubmitting(true);
      setError('');

      try {
          const token = localStorage.getItem('studentToken');
          const formData = new FormData();
          formData.append('cafeteria_id', cafeteriaId);
          formData.append('total_amount', cartTotal);
          formData.append('payment_method', paymentMethod);
          formData.append('items', JSON.stringify(cart));
          if (screenshot) formData.append('screenshot', screenshot);

          await axios.post(`${BASE}/api/student/orders`, formData, {
              headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data'
              }
          });

          // Order success
          clearCart();
          navigate('/student/track'); // Assuming tracking page exists, or orders page
      } catch (err) {
          setError(err.response?.data?.message || 'Checkout failed');
      } finally {
          setSubmitting(false);
      }
  };

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#FFB59D]">refresh</span>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 font-['Inter']">
        <span className="material-symbols-outlined text-6xl text-[#e1bfb5]/30 mb-4">shopping_cart</span>
        <h2 className="text-2xl font-bold text-[#E3E0F8] font-['Manrope'] mb-2">Your Cart is Empty</h2>
        <p className="text-[#e1bfb5] max-w-sm mb-6">Looks like you haven't added anything to your cart yet.</p>
        <button onClick={() => navigate('/student/cafeterias')} className="bg-[#FFB59D] text-[#5d1900] px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
            Browse Cafeterias <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 font-['Inter']">
      
      {/* Order Summary Section */}
      <div className="lg:col-span-7 space-y-8">
        <header>
          <div className="flex items-center gap-2 text-[#FFB59D] font-medium mb-4 hover:opacity-80 transition-opacity cursor-pointer w-fit" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-sm tracking-wide">Keep Browsing</span>
          </div>
          <h1 className="font-['Manrope'] text-3xl font-extrabold text-[#E3E0F8] tracking-tight mb-2">Review Your Feast</h1>
          <p className="text-[#e1bfb5] font-medium">Order from <span className="text-[#FFB59D]">{cafeteria?.name || 'Loading...'}</span></p>
        </header>

        {/* Items List */}
        <div className="bg-[#1E1E2F] rounded-xl overflow-hidden border border-[#594139]/20 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <div className="p-6 space-y-6">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-4 group">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[#333345] flex items-center justify-center p-2">
                  <img 
                    src={item.image_url || DEFAULT_IMAGE} 
                    alt={item.name} 
                    className={`transition-all duration-500 group-hover:scale-110 ${item.image_url ? 'w-full h-full object-cover' : 'h-10 w-auto object-contain opacity-50'}`}
                  />
                </div>
                
                <div className="flex-grow min-w-0">
                  <h3 className="font-['Manrope'] font-bold text-[#E3E0F8] truncate">{item.name}</h3>
                  <p className="text-sm text-[#e1bfb5] truncate border-b border-[#594139]/15 pb-2">{item.category}</p>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center bg-[#0c0c1d] rounded-full px-2 py-1 gap-2 md:gap-4 border border-[#594139]/30">
                      <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center text-[#FFB59D] hover:bg-[#38374a] rounded-full"><span className="material-symbols-outlined text-sm">remove</span></button>
                      <span className="text-xs font-bold w-4 text-center text-[#E3E0F8]">{item.qty}</span>
                      <button onClick={() => addToCart(item, cafeteriaId)} className="w-6 h-6 flex items-center justify-center text-[#FFB59D] hover:bg-[#38374a] rounded-full"><span className="material-symbols-outlined text-sm">add</span></button>
                    </div>
                    <span className="font-['Manrope'] font-bold text-[#E3E0F8] tracking-tight">${Number(item.price).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div className="bg-[#28283a]/50 p-6 space-y-3 border-t border-[#594139]/20">
            <div className="flex justify-between text-[#e1bfb5]">
              <span>Subtotal</span>
              <span className="font-medium text-[#E3E0F8]">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#e1bfb5]">
              <span>Delivery Fee</span>
              <span className="font-medium text-[#59d5fb]">Pick-up (Free)</span>
            </div>
            <div className="pt-4 border-t border-[#594139]/20 flex justify-between items-end">
              <span className="font-['Manrope'] font-bold text-lg text-[#E3E0F8]">Total Amount</span>
              <span className="font-['Manrope'] font-extrabold text-2xl text-[#FFB59D]">${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Placeholder Space */}
      <div className="lg:col-span-5 relative">
          <div className="bg-[#1E1E2F] p-8 rounded-xl sticky top-24 space-y-8 shadow-2xl shadow-[#0c0c1d]/50 border border-[#594139]/20">
             <section>
                <h2 className="font-['Manrope'] text-xl font-bold mb-6 flex items-center gap-2 text-[#E3E0F8]">
                    <span className="material-symbols-outlined text-[#FFB59D]">payments</span>
                    Payment Method
                </h2>
                
                {error && <div className="bg-[#93000a]/20 text-[#ffb4ab] text-sm p-3 rounded-lg mb-4">{error}</div>}

                <div className="grid grid-cols-1 gap-4">
                    {/* COD Option */}
                    <label className="relative group cursor-pointer">
                        <input checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="peer absolute opacity-0" name="payment" type="radio"/>
                        <div className="p-4 rounded-lg bg-[#28283a] border-2 border-transparent group-hover:bg-[#38374a] peer-checked:border-[#FF6B35] peer-checked:bg-[#FF6B35]/5 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined ${paymentMethod === 'cash' ? 'text-[#FFB59D]' : 'text-[#e1bfb5]'}`}>handshake</span>
                                    <div>
                                        <p className="font-bold text-[#E3E0F8] leading-none mb-1">Cash on Delivery</p>
                                        <p className="text-xs text-[#e1bfb5]">Pay when you receive your meal</p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-[#FF6B35]' : 'border-[#594139]'}`}>
                                    <div className={`w-2.5 h-2.5 rounded-full bg-[#FFB59D] transition-opacity ${paymentMethod === 'cash' ? 'opacity-100' : 'opacity-0'}`}></div>
                                </div>
                            </div>
                        </div>
                    </label>

                    {/* Online Payment Option */}
                    <label className="relative group cursor-pointer">
                        <input checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="peer absolute opacity-0" name="payment" type="radio"/>
                        <div className="p-4 rounded-lg bg-[#28283a] border-2 border-transparent group-hover:bg-[#38374a] peer-checked:border-[#FF6B35] peer-checked:bg-[#FF6B35]/5 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined ${paymentMethod === 'online' ? 'text-[#FFB59D]' : 'text-[#e1bfb5]'}`}>account_balance_wallet</span>
                                    <div>
                                        <p className="font-bold text-[#E3E0F8] leading-none mb-1">Online Payment</p>
                                        <p className="text-xs text-[#e1bfb5]">Mobile Wallets & Banking</p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-[#FF6B35]' : 'border-[#594139]'}`}>
                                    <div className={`w-2.5 h-2.5 rounded-full bg-[#FFB59D] transition-opacity ${paymentMethod === 'online' ? 'opacity-100' : 'opacity-0'}`}></div>
                                </div>
                            </div>
                        </div>
                    </label>
                </div>
             </section>

             {/* Online Payment Details Area */}
             {paymentMethod === 'online' && (
             <section className="bg-[#0c0c1d]/50 p-6 rounded-xl border border-[#594139]/30 space-y-6">
                <h3 className="text-sm font-bold text-[#FFB59D] tracking-widest uppercase">Cafeteria Wallet Details</h3>
                
                {paymentInfo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paymentInfo.jazzcash_enabled === 1 && (
                            <div className="bg-[#28283a] p-3 rounded-lg flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#59d5fb]/10 rounded flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#59d5fb] text-lg">smartphone</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#e1bfb5] leading-none">JazzCash ({paymentInfo.jazzcash_name})</p>
                                    <p className="text-sm font-bold text-[#E3E0F8]">{paymentInfo.jazzcash_number}</p>
                                </div>
                            </div>
                        )}
                        {paymentInfo.easypaisa_enabled === 1 && (
                            <div className="bg-[#28283a] p-3 rounded-lg flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#FFB59D]/10 rounded flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#FFB59D] text-lg">smartphone</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#e1bfb5] leading-none">EasyPaisa ({paymentInfo.easypaisa_name})</p>
                                    <p className="text-sm font-bold text-[#E3E0F8]">{paymentInfo.easypaisa_number}</p>
                                </div>
                            </div>
                        )}
                        {paymentInfo.bank_account && (
                            <div className="bg-[#28283a] p-3 rounded-lg flex items-center gap-3 md:col-span-2 text-sm">
                                <div className="w-8 h-8 shrink-0 bg-[#E3E0F8]/10 rounded flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#E3E0F8] text-lg">account_balance</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#e1bfb5] leading-none">{paymentInfo.bank_name}</p>
                                    <p className="font-bold text-[#E3E0F8]">{paymentInfo.bank_account}</p>
                                    {paymentInfo.bank_instructions && <p className="text-xs text-[#e1bfb5] mt-1">{paymentInfo.bank_instructions}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-[#e1bfb5]">Cafeteria has not setup online payments.</p>
                )}

                <div className="space-y-3">
                    <p className="text-xs text-[#e1bfb5]">Upload your transaction screenshot for instant verification</p>
                    <label className="border-2 border-dashed border-[#594139]/50 rounded-lg p-6 flex flex-col items-center justify-center group hover:border-[#FFB59D]/50 transition-colors cursor-pointer w-full text-center">
                        <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                        <span className="material-symbols-outlined text-3xl text-[#e1bfb5] group-hover:text-[#FFB59D] mb-2">cloud_upload</span>
                        <p className="text-sm font-semibold text-[#e1bfb5] group-hover:text-[#E3E0F8]">
                            {screenshot ? screenshot.name : "Click or Drag to Upload"}
                        </p>
                        <p className="text-[10px] text-[#594139] mt-1">PNG, JPG (Auto-compressed to 2MB)</p>
                    </label>
                </div>
             </section>
             )}

             {/* Action Button */}
             <div className="pt-4">
                <button 
                  onClick={handleCheckout}
                  disabled={submitting}
                  className="w-full h-14 bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] rounded-lg text-[#5d1900] font-['Manrope'] font-extrabold text-lg flex items-center justify-center gap-2 shadow-xl shadow-[#FF6B35]/20 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:active:scale-100"
                >
                  {submitting ? 'Processing...' : 'Place Order'}
                  {!submitting && <span className="material-symbols-outlined">chevron_right</span>}
                </button>
             </div>
          </div>
      </div>

    </div>
  );
}
