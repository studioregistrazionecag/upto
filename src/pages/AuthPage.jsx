// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import styles from './AuthPage.module.css';
import UptoLogo from '../assets/UptoLogo'; 

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('artista')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: 'error' })

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: 'error' });
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, role } } });
    if (error) { setMessage({ text: error.message, type: 'error' }); } 
    else { setMessage({ text: 'Grande! Mo Accedi.', type: 'success' }); setIsLogin(true); }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: 'error' });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMessage({ text: error.message, type: 'error' }); }
    setLoading(false);
  };

  return (
    <div className={styles.authContainer}>
      <UptoLogo className={styles.logo} />
      
      <div className={styles.toggleContainer}>
        <button className={`${styles.toggleButton} ${isLogin ? styles.active : ''}`} onClick={() => { setIsLogin(true); setMessage({ text: '' }) }}>
          Accedi
        </button>
        <button className={`${styles.toggleButton} ${!isLogin ? styles.active : ''}`} onClick={() => { setIsLogin(false); setMessage({ text: '' }) }}>
          Registrati
        </button>
      </div>
      {message.text && <p className={`${styles.message} ${styles[message.type]}`}>{message.text}</p>}

      {isLogin ? (
        <form className={styles.form} onSubmit={handleLogin}>
          <label className={styles.label}>Email</label>
          <input type="email" placeholder="bobby@gmail.com" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className={styles.label}>Password</label>
          <input type="password" placeholder="••••••••" className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className={styles.submitButton} disabled={loading}>{loading ? 'Aspè' : 'Accedi'}</button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleRegister}>
          <label className={styles.label}>Nome</label>
          <input type="text" placeholder="Il tuo nome d'arte" className={styles.input} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <label className={styles.label}>Email</label>
          <input type="email" placeholder="bobby@gmail.com" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className={styles.label}>Password</label>
          <input type="password" placeholder="••••••••" className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" />
          <label className={styles.label}>Ruolo</label>
          <select className={styles.select} value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="artista">Artista</option>
            <option value="produttore">Produttore</option>
          </select>
          <button type="submit" className={styles.submitButton} disabled={loading}>{loading ? 'Aspè' : 'Registrati'}</button>
        </form>
      )}
    </div>
  )
}

export default AuthPage;