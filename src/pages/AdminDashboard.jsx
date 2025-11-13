// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import styles from './AdminDashboard.module.css';
import ConfirmModal from '../components/ConfirmModal';

const AdminDashboard = () => {
    const [detailedEvents, setDetailedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newEventDate, setNewEventDate] = useState('');
    const [startTime, setStartTime] = useState('21:00');
    const [endTime, setEndTime] = useState('00:00');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: 'error' });
    const [isExporting, setIsExporting] = useState(false);
    const [confirmInfo, setConfirmInfo] = useState({ isOpen: false, slotId: null });

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // AGGIORNATO: Aggiunto 'is_private' alla select
            const { data, error: dbError } = await supabase.from('events').select(`id, event_date, time_slots (id, start_time, end_time, status, is_private, artist:profiles!time_slots_artist_id_fkey(full_name), producer:profiles!time_slots_producer_id_fkey(full_name))`).gte('event_date', new Date().toISOString()).order('event_date', { ascending: true });
            if (dbError) throw dbError;
            setDetailedEvents(data || []);
        } catch (err) {
            console.error("Errore critico:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCancelBooking = (slotId) => {
        setConfirmInfo({ isOpen: true, slotId: slotId });
    };

    const executeCancellation = async () => {
        const { slotId } = confirmInfo;
        if (!slotId) return;

        // Resettiamo anche is_private
        const { error } = await supabase
            .from('time_slots')
            .update({
                status: 'disponibile',
                artist_id: null,
                producer_id: null,
                is_private: false
            })
            .eq('id', slotId);

        if (error) {
            alert(`Errore: ${error.message}`);
        } else {
            fetchData();
        }
        setConfirmInfo({ isOpen: false, slotId: null });
    };

    const handleCreateEvent = async (e) => { e.preventDefault(); if (!newEventDate) { setMessage({ text: 'Seleziona una data.', type: 'error' }); return; } setIsSubmitting(true); setMessage({ text: '', type: 'error' }); const { data: eventData, error: eventError } = await supabase.from('events').insert({ event_date: newEventDate }).select().single(); if (eventError) { setMessage({ text: `Errore: ${eventError.message}`, type: 'error' }); setIsSubmitting(false); return; } const slotsToInsert = []; let currentHour = parseInt(startTime.split(':')[0]); let endHour = parseInt(endTime.split(':')[0]); if (endHour <= currentHour) endHour += 24; while (currentHour < endHour) { const nextHour = currentHour + 1; slotsToInsert.push({ event_id: eventData.id, start_time: `${String(currentHour % 24).padStart(2, '0')}:00:00`, end_time: `${String(nextHour % 24).padStart(2, '0')}:00:00`, status: 'disponibile', is_private: false }); currentHour++; } if (slotsToInsert.length > 0) { const { error: slotsError } = await supabase.from('time_slots').insert(slotsToInsert); if (slotsError) { setMessage({ text: `Errore slot: ${slotsError.message}`, type: 'error' }); } else { setMessage({ text: 'Evento creato!', type: 'success' }); setNewEventDate(''); fetchData(); } } else { setMessage({ text: 'Nessuno slot da creare.', type: 'error' }); } setIsSubmitting(false); };
    const handleExport = async () => { setIsExporting(true); const { data, error } = await supabase.from('time_slots').select(`status, is_private, event:events!inner(event_date), artist:profiles!time_slots_artist_id_fkey(full_name), producer:profiles!time_slots_producer_id_fkey(full_name)`).eq('status', 'prenotato').lt('events.event_date', new Date().toISOString().split('T')[0]); if (error) { alert(`Errore: ${error.message}`); setIsExporting(false); return; } const formattedData = data.map(slot => ({ Data: new Date(slot.event.event_date).toLocaleDateString('it-IT'), Artista: slot.artist.full_name, Produttore: slot.producer.full_name, Tipo: slot.is_private ? 'Privata' : 'Standard' })); const jsonString = JSON.stringify(formattedData, null, 2); const blob = new Blob([jsonString], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `storico_presenze_${new Date().toISOString().split('T')[0]}.json`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); setIsExporting(false); };

    if (loading) return <p style={{ textAlign: 'center' }}>Caricamento dashboard admin...</p>;
    if (error) return <div style={{ padding: '20px', textAlign: 'center', color: '#f87171' }}><h2>Oops!</h2><p>Non è stato possibile caricare i dati.</p><p><strong>Errore:</strong> {error}</p></div>;

    return (
        <div>
            <div className={styles.formContainer}><h2>Crea Nuovo Evento</h2><form onSubmit={handleCreateEvent}><div className={styles.inputGroup}><label htmlFor="event-date">Data Evento</label><input type="date" id="event-date" value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} className={styles.input} /></div><div className={styles.timeRange}><div className={styles.inputGroup}><label htmlFor="start-time">Dalle</label><input type="time" id="start-time" value={startTime} onChange={e => setStartTime(e.target.value)} className={styles.input} step="3600" /></div><div className={styles.inputGroup}><label htmlFor="end-time">Alle</label><input type="time" id="end-time" value={endTime} onChange={e => setEndTime(e.target.value)} className={styles.input} step="3600" /></div></div><button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? 'Creazione...' : 'Crea Evento'}</button>{message.text && <p className={`${styles.message} ${styles[message.type]}`}>{message.text}</p>}</form></div>
            <div className={styles.exportSection}><h2 className={styles.title}>Storico Presenze</h2><p>Scarica un file JSON con l'elenco di tutte le sessioni passate.</p><button onClick={handleExport} className={styles.exportButton} disabled={isExporting}>{isExporting ? 'Esportazione...' : 'Esporta Storico'}</button></div>
            <div className={styles.fullCalendarSection}>
                <h2 className={styles.title}>Calendario Completo</h2>
                {detailedEvents.map((event, index) => (
                    <div key={event.id} className={styles.eventCard} style={{ animationDelay: `${index * 100}ms` }}>
                        <h3>{new Date(event.event_date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                        <div className={styles.slotsContainer}>
                            {event.time_slots
                                .sort((a, b) => { const getSortableHour = t => (parseInt(t.slice(0, 2)) < 6 ? parseInt(t.slice(0, 2)) + 24 : parseInt(t.slice(0, 2))); return getSortableHour(a.start_time) - getSortableHour(b.start_time); })
                                .map(slot => (
                                    // AGGIORNATO: Classe condizionale
                                    <div key={slot.id} className={`${styles.slot} ${slot.status === 'prenotato' ? styles.booked : ''} ${slot.is_private ? styles.privateSlot : ''}`}>
                                        <div className={styles.slotTime}>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</div>
                                        <div className={styles.slotStatus}>
                                            {slot.status === 'disponibile' ? <span className={styles.freeSlot}>Libero</span> :
                                                <div className={styles.bookingInfoWithCancel}>
                                                    <div className={styles.bookingInfo}>
                                                        {/* AGGIORNATO: Label Sessione Privata */}
                                                        {slot.is_private && <span className={styles.privateLabel}>SESSIONE PRIVATA</span>}
                                                        <span>{slot.artist.full_name}</span>
                                                        <span className={styles.producerName}>con {slot.producer?.full_name || 'N/D'}</span>
                                                    </div>
                                                    <button className={styles.cancelButton} onClick={() => handleCancelBooking(slot.id)}>Annulla</button>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
            {confirmInfo.isOpen && (
                <ConfirmModal
                    title="Annulla Prenotazione"
                    message="Sei sicuro di voler annullare la prenotazione di questo utente?"
                    onConfirm={executeCancellation}
                    onCancel={() => setConfirmInfo({ isOpen: false, slotId: null })}
                />
            )}
        </div>
    );
};

export default AdminDashboard;