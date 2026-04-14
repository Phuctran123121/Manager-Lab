import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(username, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', backgroundColor: 'var(--bg-color)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Package size={48} color="var(--primary-color)" style={{ margin: '0 auto' }} />
          <h2 style={{ marginTop: '1rem' }}>Login to Lab Manager</h2>
        </div>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tài khoản</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Enter Account..."/>
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <span 
                style={{ fontSize: '0.8rem', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500 }} 
                onClick={() => alert('🔒 CHÚ Ý: \nSinh viên quên mật khẩu vui lòng liên hệ Bộ phận Admin Lab:\n- Email: admin@labmanager.vn\n- SĐT: (028) 3812 3456\n\nĐể được cấp lại mật khẩu mới.')}>
                Quên mật khẩu?
              </span>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
