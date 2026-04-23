"use client";

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import styles from './page.module.css';

export default function Profile() {
  const { data: session, status, update } = useSession();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ topScore: 0, gamesPlayed: 0, xp: 0, level: 1, image: null });

  useEffect(() => {
    if (session?.user) {
      // Fetch user stats
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(console.error);
    }
  }, [session]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'profile');

    setLoading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setStats(prev => ({ ...prev, image: data.imageUrl }));
        await update({ image: data.imageUrl });
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
    setLoading(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (authMode === 'register') {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.message || 'Registration failed');
          setLoading(false);
          return;
        }
        
        setSuccessMsg(data.message || 'Registration successful! Please check your email to verify.');
        setAuthMode('login');
      } catch (err) {
        setError('Something went wrong');
      }
    } else {
      const result = await signIn('credentials', {
        email: username, // 'username' state holds the email or username string
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === 'CredentialsSignin' ? 'Invalid credentials or email not verified. Please check your inbox.' : result.error);
      }
    }
    setLoading(false);
  };

  const handleGuest = () => {
    window.location.href = '/';
  };

  if (status === 'loading') {
    return <div className={styles.main}><div>Loading...</div></div>;
  }

  if (session) {
    const xpProgress = (stats.xp % 1000) / 10; // since 1000 xp = 1 level, percentage is xp % 1000 / 10

    return (
      <div className={styles.main}>
        <div className={styles.card}>
          <label htmlFor="avatar-upload" style={{ cursor: 'pointer', display: 'block', margin: '0 auto' }}>
            {stats.image ? (
              <img src={stats.image} alt="Profile" className={styles.avatar} style={{ objectFit: 'cover', width: '80px', height: '80px', borderRadius: '50%' }} />
            ) : (
              <div className={styles.avatar}>👤</div>
            )}
          </label>
          <input 
            id="avatar-upload" 
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleImageUpload} 
          />
          
          <h1 className={styles.username}>{session.user.name}</h1>
          {session.user.role === 'admin' && (
            <div style={{color: 'var(--color-primary)', fontSize: '0.8rem', textAlign: 'center', marginTop: '-10px', marginBottom: '10px'}}>Admin</div>
          )}
          
          <div className={styles.xpContainer}>
            <div className={styles.xpLabel}>
              <span>Level {stats.level}</span>
              <span>{stats.xp % 1000} / 1000 XP</span>
            </div>
            <div className={styles.xpBarBg}>
              <div className={styles.xpBarFill} style={{ width: `${xpProgress}%` }}></div>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{stats.topScore}</div>
              <div className={styles.statLabel}>High Score</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{stats.gamesPlayed}</div>
              <div className={styles.statLabel}>Games Played</div>
            </div>
          </div>

          <div className={styles.divider}></div>
          
          <button 
            className="btn btn-danger" 
            style={{ width: '100%' }}
            onClick={() => signOut()}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.title}>{authMode === 'login' ? 'Welcome Back' : 'Join the Family'}</h1>
        
        {successMsg && <div style={{ color: 'green', textAlign: 'center', marginBottom: '10px', fontSize: '0.9rem' }}>{successMsg}</div>}
        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px', fontSize: '0.9rem' }}>{error}</div>}

        <form className={styles.inputGroup} onSubmit={handleAuth}>
          {authMode === 'register' && (
            <input 
              type="email" 
              placeholder="Email" 
              className={styles.input} 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
          <input 
            type="text" 
            placeholder={authMode === 'login' ? "Username or Email" : "Username"} 
            className={styles.input} 
            required 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className={styles.input} 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Processing...' : (authMode === 'login' ? 'Login' : 'Register')}
          </button>
        </form>

        <div className={styles.toggleText}>
          {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button 
            className={styles.toggleLink}
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'register' : 'login');
              setError('');
            }}
          >
            {authMode === 'login' ? 'Register' : 'Login'}
          </button>
        </div>

        <div className={styles.divider}></div>

        <button 
          className="btn" 
          style={{ width: '100%', backgroundColor: '#f0f0f0', color: '#555' }}
          onClick={handleGuest}
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
