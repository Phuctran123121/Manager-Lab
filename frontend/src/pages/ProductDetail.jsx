import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [returnDate, setReturnDate] = useState('');
  const [activeTransaction, setActiveTransaction] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);

      if (data && (data.status === 'borrowed' || data.status === 'overdue')) {
         const transRes = await api.get('/transactions');
         const active = transRes.data.find(t => 
             (t.productId?._id === data._id || t.productId === data._id) && 
             (t.status === 'borrowing' || t.status === 'overdue')
         );
         // If a user has borrowed this, `api.get('/transactions')` fetches their personal list so if found it's theirs.
         // If admin, it fetches all transactions, so we allow admin to also return it on their behalf.
         if(active) {
             setActiveTransaction(active);
         }
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!returnDate) return alert('Vui lòng chọn ngày và giờ trả máy!');
    
    if (new Date(returnDate) <= new Date()) {
       return alert('Thời gian hẹn trả phải diễn ra trong tương lai!');
    }

    try {
      await api.post('/transactions/borrow', { productId: product._id, returnDate });
      alert('Thuê máy thành công!');
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi thuê máy');
    }
  };

  const handleReturn = async () => {
     if (!activeTransaction) return;
     try {
       await api.post('/transactions/return', { transactionId: activeTransaction._id });
       alert('Trả máy thành công! Cám ơn bạn đã sử dụng.');
       navigate('/dashboard');
     } catch (error) {
       alert(error.response?.data?.message || 'Lỗi khi trả máy');
     }
  }

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (!product) return <div>Không tìm thấy thiết bị</div>;

  const isBorrowedOrOverdue = product.status === 'borrowed' || product.status === 'overdue';

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Chi Tiết Thiết Bị (Device Details)</h2>
      <div className="card flex-responsive" style={{ display: 'flex', gap: '2rem' }}>
        <img src={product.image} alt={product.name} className="responsive-img" style={{ width: '250px', height: '250px', objectFit: 'cover', borderRadius: '12px' }} />
        
        <div style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>{product.name}</h2>
            <span className={`badge badge-${product.status === 'overdue' ? 'danger' : product.status}`} style={{ fontSize: '1rem', padding: '0.4rem 1rem' }}>
              {product.status.toUpperCase()}
            </span>
          </div>
          
          <div className="grid-responsive" style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Mã Thiết Bị</p>
              <p style={{ fontWeight: 600 }}>{product.productId || product._id}</p>
            </div>
            {product.cpu && (
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>CPU</p>
                <p style={{ fontWeight: 600 }}>{product.cpu}</p>
              </div>
            )}
            {product.ram && (
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>RAM</p>
                <p style={{ fontWeight: 600 }}>{product.ram}</p>
              </div>
            )}
            {product.ssd && (
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Bộ nhớ lưu trữ</p>
                <p style={{ fontWeight: 600 }}>{product.ssd}</p>
              </div>
            )}
          </div>
          
          {product.description && (
            <div style={{ marginTop: '1.5rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
               <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Mô tả thêm:</h4>
               <p style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{product.description}</p>
            </div>
          )}
          
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            {product.status === 'available' ? (
              user?.role === 'user' ? (
                <div>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Xác nhận thuê thiết bị</h3>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Ngày và Giờ dự kiến trả máy (Expected Return Time)</label>
                    <input 
                      type="datetime-local" 
                      value={returnDate} 
                      onChange={e => setReturnDate(e.target.value)} 
                      style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', fontSize: '1rem' }}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={handleBorrow} style={{ width: '100%', padding: '0.75rem', fontSize: '1.1rem', fontWeight: 600 }}>
                    Xác nhận Thuê Máy
                  </button>
                </div>
              ) : (
                <div style={{ padding: '1rem', border: '1px dashed var(--primary-light)', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--primary-color)', fontWeight: 500 }}>Chỉ dành cho Sinh Viên (Users)</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Quyền Admin chỉ có thể Quản trị thiết bị, không thể tự thao tác thuê mượn.</p>
                </div>
              )
            ) : isBorrowedOrOverdue ? (
              activeTransaction ? (
                <div>
                   <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', backgroundColor: product.status === 'overdue' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'}}>
                      <h3 style={{ color: product.status === 'overdue' ? 'var(--danger)' : 'var(--success)', marginBottom: '0.5rem' }}>Bạn đang mượn máy này</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Hạn trả: {new Date(activeTransaction.returnDate).toLocaleString('vi-VN')}
                      </p>
                      {product.status === 'overdue' && <p style={{ marginTop: '0.5rem', color: 'var(--danger)', fontWeight: 600}}>⚠️ Hết hạn! Vui lòng trả sớm nhất có thể.</p>}
                   </div>
                   <button className="btn" onClick={handleReturn} style={{ width: '100%', padding: '0.75rem', fontSize: '1.1rem', fontWeight: 600, backgroundColor: 'var(--success)', color: 'white' }}>
                      ☑️ Xác nhận Trả Máy
                   </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ marginBottom: '1rem', color: 'var(--warning)', fontWeight: 600 }}>Máy này đang được mượn bởi người khác.</p>
                  <p style={{ color: 'var(--text-secondary)' }}>Vui lòng kiểm tra các thiết bị có trạng thái "Available".</p>
                </div>
              )
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--danger)', fontWeight: 600 }}>Thiết bị đang được bảo trì.</p>
                <p style={{ color: 'var(--text-secondary)' }}>Không thể tiến hành thuê mượn lúc này.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
