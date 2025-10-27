// src/components/BookingModal.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import styles from './BookingModal.module.css';

const BookingModal = ({ slot, onClose, onBookingSuccess }) => {
  const [producers, setProducers] = useState([]);
  const [selectedProducer, setSelectedProducer] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducers = async () => {
      // Carichiamo tutti gli utenti con il ruolo 'produttore'
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'produttore');

      if (error) {
        console.error('Errore nel caricamento dei produttori:', error);
      } else {
        setProducers(data);
        // Impostiamo un produttore di default, se presente
        if (data.length > 0) {
          // Cerchiamo W8 come default, altrimenti prendiamo il primo della lista
          const defaultProducer = data.find(p => p.full_name.toLowerCase() === 'w8') || data[0];
          setSelectedProducer(defaultProducer.id);
        }
      }
      setLoading(false);
    };
    fetchProducers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('time_slots')
      .update({
        status: 'prenotato',
        artist_id: (await supabase.auth.getUser()).data.user.id, // ID dell'artista loggato
        producer_id: selectedProducer,
      })
      .eq('id', slot.id);

    if (error) {
      alert(`Errore nella prenotazione: ${error.message}`);
    } else {
      onBookingSuccess(); // Comunica al componente padre che la prenotazione è andata a buon fine
    }
    setIsSubmitting(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Conferma Prenotazione</h3>
        <p className={styles.slotInfo}>
          Stai per prenotare lo slot dalle {slot.start_time.slice(0, 5)} alle {slot.end_time.slice(0, 5)}.
        </p>
        {loading ? <p>Carico produttori...</p> : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="producer-select">Scegli un produttore</label>
            <select
              id="producer-select"
              className={styles.select}
              value={selectedProducer}
              onChange={(e) => setSelectedProducer(e.target.value)}
              required
            >
              {producers.map(p => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
            <div className={styles.buttonGroup}>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                Annulla
              </button>
              <button type="submit" className={styles.confirmButton} disabled={isSubmitting}>
                {isSubmitting ? 'Prenoto...' : 'Conferma'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;