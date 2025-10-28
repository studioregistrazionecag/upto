// src/pages/ProducerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import styles from './ProducerDashboard.module.css';

const ProducerDashboard = () => {
  const [mySessions, setMySessions] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: producerSessions, error: sessionsError } = await supabase.from('time_slots').select(`id, start_time, event:events!inner(id, event_date), artist:profiles!time_slots_artist_id_fkey(id, full_name)`).eq('producer_id', user.id).gte('events.event_date', new Date().toISOString()).order('event_date', { referencedTable: 'events', ascending: true });
      if (sessionsError) console.error("Errore sessioni:", sessionsError);
      else setMySessions(producerSessions || []);

      const { data: eventsData, error: eventsError } = await supabase.from('events').select(`id, event_date, time_slots (id, start_time, end_time, status, artist:profiles!time_slots_artist_id_fkey(full_name), producer:profiles!time_slots_producer_id_fkey(full_name))`).gte('event_date', new Date().toISOString()).order('event_date', { ascending: true });
      if (eventsError) console.error("Errore eventi:", eventsError);
      else setAllEvents(eventsData || []);

      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <p>Caricamento dashboard produttore...</p>;

  return (
    <div>
      <div className={styles.mySessionsSection}>
        <h2 className={styles.title}>Le Tue Prossime Sessioni</h2>
        {mySessions.length > 0 ? (
          <div className={styles.sessionsGrid}>
            {mySessions.map(session => (
              <div key={session.id} className={styles.sessionCard}><span className={styles.sessionArtist}>{session.artist.full_name}</span><span className={styles.sessionDate}>{new Date(session.event.event_date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'short' })}</span><span className={styles.sessionTime}>{session.start_time.slice(0, 5)}</span></div>
            ))}
          </div>
        ) : (<p>Nessuna sessione in programma al momento.</p>)}
      </div>
      <div className={styles.fullCalendarSection}>
        <h2 className={styles.title}>Calendario Completo</h2>
        {allEvents.map((event, index) => (
          <div key={event.id} className={styles.eventCard} style={{ animationDelay: `${index * 100}ms` }}>
            <h3>{new Date(event.event_date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
            <div className={styles.slotsContainer}>
              {event.time_slots
                .sort((a, b) => { const getSortableHour = t => (parseInt(t.slice(0, 2)) < 6 ? parseInt(t.slice(0, 2)) + 24 : parseInt(t.slice(0, 2))); return getSortableHour(a.start_time) - getSortableHour(b.start_time); })
                .map(slot => (
                  <div key={slot.id} className={`${styles.slot} ${slot.status === 'prenotato' ? styles.booked : ''}`}>
                    <div className={styles.slotTime}>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</div>
                    <div className={styles.slotStatus}>
                      {slot.status === 'disponibile' ? <span className={styles.freeSlot}>Libero</span> : <div className={styles.bookingInfo}><span>{slot.artist.full_name}</span><span className={styles.producerName}>con {slot.producer?.full_name || 'N/D'}</span></div>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProducerDashboard;