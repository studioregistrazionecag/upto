// src/components/BookingModal.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import styles from './BookingModal.module.css';

const BookingModal = ({ slot, onClose, onBookingSuccess }) => {
    const [producers, setProducers] = useState([]);
    const [selectedProducer, setSelectedProducer] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProducers = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('role', 'produttore');

            if (error) {
                console.error('Errore:', error);
            } else {
                setProducers(data || []);
                if (data && data.length > 0) {
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
                artist_id: (await supabase.auth.getUser()).data.user.id,
                producer_id: selectedProducer,
                is_private: isPrivate,
            })
            .eq('id', slot.id);

        if (error) {
            alert(`Errore: ${error.message}`);
        } else {
            onBookingSuccess();
        }
        setIsSubmitting(false);
    };

    const togglePrivacy = () => setIsPrivate(!isPrivate);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>Conferma Prenotazione</h3>
                <p className={styles.slotInfo}>
                    Slot orario: {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                </p>

                {loading ? <p>Caricamento...</p> : (
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="producer-select">Produttore</label>
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

                        {/* --- SMART ROW (GARANTITA UNA RIGA) --- */}
                        <div className={styles.privacyContainer}>
                            <div
                                className={`${styles.privacyRow} ${isPrivate ? styles.active : ''}`}
                                onClick={togglePrivacy}
                            >
                                <div className={styles.privacyContent}>
                                    {/* Icona che cambia */}
                                    <span className={styles.icon}>{isPrivate ? '🔒' : '🔓'}</span>
                                    <span className={styles.privacyText}>Sessione Privata</span>
                                </div>

                                {/* Switch visuale personalizzato (non input) */}
                                <div className={styles.toggleTrack}>
                                    <div className={styles.toggleThumb}></div>
                                </div>
                            </div>
                        </div>
                        {/* -------------------------------------- */}

                        <div className={styles.buttonGroup}>
                            <button type="button" className={styles.cancelButton} onClick={onClose}>
                                Annulla
                            </button>
                            <button type="submit" className={styles.confirmButton} disabled={isSubmitting}>
                                {isSubmitting ? '...' : 'Conferma'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default BookingModal;