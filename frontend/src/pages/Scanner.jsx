import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Scanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [quickBorrowData, setQuickBorrowData] = useState(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(
      async (result) => {
        // Prevent multiple scans
        if (scanResult) return;
        setScanResult(result);
        scanner.clear();
        
        try {
          const url = new URL(result);
          if (url.pathname.startsWith('/product/')) {
            const productIdSegment = url.pathname.split('/product/')[1];
            
            // Only Quick Borrow if logged in as student/user
            if (user && user.role === 'user') {
              try {
                const { data: product } = await api.get(`/products/${productIdSegment}`);
                if (product.status === 'available') {
                  // Check active reservations
                  const { data: resData } = await api.get(`/reservations/product/${product._id}`);
                  const hasReservation = resData && resData.length > 0;
                  
                  // Calculate tomorrow 18:00
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(18, 0, 0, 0); // 18:00 (6:00 PM)

                  const noOverlap = !hasReservation || new Date(resData[0].reservationDate) >= tomorrow;

                  if (noOverlap) {
                     setQuickBorrowData({
                         product,
                         returnDate: tomorrow,
                         pathname: url.pathname
                     });
                     return; // STOP execution and UI will show Quick Borrow Prompt
                  }
                }
              } catch (err) {
                 console.error('Error fetching product for quick borrow', err);
              }
            }
            
            // Fallback navigation
            navigate(url.pathname);
          }
        } catch (e) {
          console.warn("Not a valid URL, handling raw text: ", result);
        }
      },
      (err) => {}
    );

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, [navigate, user, scanResult]);

  const handleQuickBorrow = async () => {
     if (!quickBorrowData) return;
     try {
       await api.post('/transactions/borrow', { 
           productId: quickBorrowData.product._id, 
           returnDate: quickBorrowData.returnDate 
       });
       alert(`Mượn nhanh thành công! Hạn trả: ${quickBorrowData.returnDate.toLocaleString('vi-VN')}`);
       navigate('/dashboard');
     } catch (error) {
       alert(error.response?.data?.message || 'Có lỗi xảy ra khi mượn nhanh.');
       // Fallback navigate to details if error
       navigate(quickBorrowData.pathname);
     }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Scan Device QR</h2>
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        
        {quickBorrowData && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
               <img src={quickBorrowData.product.image} alt={quickBorrowData.product.name} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
            </div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>{quickBorrowData.product.name}</h3>
            <p style={{ color: 'var(--success)', fontWeight: 600, marginBottom: '1.5rem' }}>Thiết bị đang sẵn sàng!</p>
            
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Thời hạn trả máy (Mượn nhanh):</p>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{quickBorrowData.returnDate.toLocaleString('vi-VN')}</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
               <button className="btn btn-primary" onClick={handleQuickBorrow} style={{ padding: '0.75rem', fontSize: '1.1rem', fontWeight: 600 }}>
                 🚀 Mượn Nhanh Ngay
               </button>
               <button className="btn btn-outline" onClick={() => navigate(quickBorrowData.pathname)} style={{ padding: '0.75rem', fontSize: '1rem' }}>
                 Xem Chi Tiết Máy
               </button>
            </div>
          </div>
        )}

        <div id="reader" style={{ display: (quickBorrowData || scanResult) ? 'none' : 'block' }}></div>

      </div>
    </div>
  );
};

export default Scanner;
