// src/App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './utils/supabaseClient';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';

function App() {
  // 1. Creiamo uno stato per memorizzare la sessione dell'utente
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 2. Controlliamo subito se c'è una sessione attiva
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 3. Mettiamo in ascolto l'app per futuri cambi di stato (login, logout)
    //    Supabase ci avvisa in automatico!
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 4. Pulizia: quando il componente non è più visibile, smettiamo di ascoltare
    return () => subscription.unsubscribe();
  }, []); // L'array vuoto [] assicura che questo codice venga eseguito solo una volta

  return (
    <>
      {/* 5. Logica di rendering:
          - Se NON c'è una sessione, mostra la pagina di login.
          - Se C'È una sessione, mostra la HomePage (la nostra dashboard).
      */}
      {!session ? (
        <AuthPage />
      ) : (
        // Usiamo la 'key' per forzare il re-render del componente se l'utente cambia
        <HomePage key={session.user.id} session={session} />
      )}
    </>
  );
}

export default App;