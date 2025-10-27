// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import DashboardLayout from '../components/DashboardLayout';
import ArtistDashboard from './ArtistDashboard';
import AdminDashboard from './AdminDashboard';
import ProducerDashboard from './ProducerDashboard';

const HomePage = ({ session }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Funzione asincrona interna per gestire il caricamento
    const fetchProfile = async () => {
      // Assicuriamoci che non ci sia nulla in sospeso
      setProfile(null);
      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Errore nel recupero del profilo:', error);
      } else {
        // Memorizziamo il profilo nello stato
        setProfile(data);
      }
      
      // SOLO ALLA FINE di tutto, smettiamo di caricare
      setLoading(false);
    };

    fetchProfile();
  }, [session.user.id]);

  // 1. Mostra "Caricamento..." finché loading è true.
  //    prima barriera di sicurezza.
  if (loading) {
    return <p style={{ textAlign: 'center' }}>Caricamento dati utente...</p>;
  }

  // 2. Se il caricamento è finito MA il profilo è ancora nullo,
  //    c'è stato un errore --> seconda barriera.
  if (!profile) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1>Errore</h1>
        <p>Impossibile caricare i dati del profilo. Potrebbe esserci un problema con i permessi del database (RLS).</p>
        <button onClick={() => supabase.auth.signOut()}>Logout</button>
      </div>
    );
  }

  // 3. SOLO SE il caricamento è finito E il profilo esiste,
  //    procediamo a mostrare la dashboard corretta.
  const renderDashboard = () => {
    switch (profile.role) {
      case 'artista':
        return <ArtistDashboard />;
      case 'produttore':
        return <ProducerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <p>Ruolo non riconosciuto.</p>;
    }
  };

  return (
    <DashboardLayout user={profile}>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default HomePage;