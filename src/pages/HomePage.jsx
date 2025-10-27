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
    const fetchProfile = async () => {
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
        setProfile(data);
      }
      
      setLoading(false);
    };

    fetchProfile();
  }, [session.user.id]);

  if (loading) {
    return <p style={{ textAlign: 'center' }}>Caricamento dati utente...</p>;
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1>Errore</h1>
        <p>Impossibile caricare i dati del profilo. Potrebbe esserci un problema con i permessi del database (RLS).</p>
        <button onClick={() => supabase.auth.signOut()}>Logout</button>
      </div>
    );
  }

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