// src/pages/ArtistDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import styles from './ArtistDashboard.module.css';
import BookingModal from '../components/BookingModal';
import AlertModal from '../components/AlertModal';
import ConfirmModal from '../components/ConfirmModal';

const getMonday = (d) => {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const ArtistDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [myWeeklyBookings, setMyWeeklyBookings] = useState({});
  const [userId, setUserId] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ isOpen: false, message: '' });
  const [confirmInfo, setConfirmInfo] = useState({ isOpen: false, slotId: null });

  const fetchEventsAndBookings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);

    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select(`id, event_date, time_slots (id, start_time, end_time, status, artist_id, artist:profiles!time_slots_artist_id_fkey(full_name), producer:profiles!time_slots_producer_id_fkey(full_name))`)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (eventError) console.error('Errore:', eventError);
    else setEvents(eventData || []);

    const weeklyBookings = {};
    if (eventData) {
      eventData.forEach(event => {
        const monday = getMonday(event.event_date).toISOString().split('T')[0];
        const userHasBooking = event.time_slots.some(slot => slot.artist_id === user.id);
        if (userHasBooking) weeklyBookings[monday] = true;
      });
    }
    setMyWeeklyBookings(weeklyBookings);
    setLoading(false);
  };

  useEffect(() => {
    fetchEventsAndBookings();
  }, []);

  const handleCancelBooking = (slotId) => {
    setConfirmInfo({ isOpen: true, slotId: slotId });
  };

  const executeCancellation = async () => {
    const { slotId } = confirmInfo;
    if (!slotId) return;

    const { error } = await supabase
      .from('time_slots')
      .update({
        status: 'disponibile',
        artist_id: null,
        producer_id: null,
      })
      .eq('id', slotId);

    if (error) {
      alert(`Errore durante l'annullamento: ${error.message}`);
    } else {
      fetchEventsAndBookings();
    }
    setConfirmInfo({ isOpen: false, slotId: null });
  };

  const handleBookingAttempt = (slot, event) => {
    const now = new Date();
    const eventDate = new Date(event.event_date);
    const isAfter6PMOnEventDay = now.getFullYear() === eventDate.getFullYear() && now.getMonth() === eventDate.getMonth() && now.getDate() === eventDate.getDate() && now.getHours() >= 18;
    const eventMonday = getMonday(event.event_date).toISOString().split('T')[0];
    const hasWeeklyBooking = myWeeklyBookings[eventMonday];
    const isMyBooking = slot.artist_id === userId;

    if (isMyBooking) {
      handleCancelBooking(slot.id);
      return;
    }
    if (!hasWeeklyBooking || isAfter6PMOnEventDay) {
      setSelectedSlot(slot);
      setIsBookingModalOpen(true);
    } else {
      const eventDayString = eventDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
      setAlertInfo({ isOpen: true, message: `Non puoi prenotare un altro slot per questa settimana.\n\nPotrai prenotare eventuali slot liberi per il giorno ${eventDayString} solo dopo le 18:00.` });
    }
  };

  const handleCloseBookingModal = () => { setIsBookingModalOpen(false); setSelectedSlot(null); };
  const handleBookingSuccess = () => { handleCloseBookingModal(); fetchEventsAndBookings(); };

  if (loading) return <p>Caricamento calendario...</p>;

  return (
    <div>
      <h2 className={styles.title}>Prossime Aperture</h2>
      {events.length === 0 ? (<p>Nessun evento programmato.</p>) : (
        <div className={styles.eventsContainer}>
          {events.map((event, index) => (
            <div key={event.id} className={styles.eventCard} style={{ animationDelay: `${index * 100}ms` }}>
              <h3>{new Date(event.event_date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
              <div className={styles.slotsContainer}>
                {event.time_slots
                  .sort((a, b) => { const getSortableHour = t => (parseInt(t.slice(0, 2)) < 6 ? parseInt(t.slice(0, 2)) + 24 : parseInt(t.slice(0, 2))); return getSortableHour(a.start_time) - getSortableHour(b.start_time); })
                  .map(slot => {
                    const isMyBooking = slot.artist_id === userId;
                    return (
                      <div key={slot.id} className={`${styles.slot} ${slot.status === 'prenotato' ? styles.booked : ''}`}>
                        <div className={styles.slotTime}>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</div>
                        <div className={styles.slotStatus}>
                          {slot.status === 'disponibile' ? (
                            <button className={styles.bookButton} onClick={() => handleBookingAttempt(slot, event)}>Prenota</button>
                          ) : (
                            isMyBooking ? (
                              <button className={styles.cancelButton} onClick={() => handleCancelBooking(slot.id)}>Annulla</button>
                            ) : (
                              <div className={styles.bookingInfo}><span>{slot.artist.full_name}</span><span className={styles.producerName}>con {slot.producer?.full_name || 'N/D'}</span></div>
                            )
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
      {isBookingModalOpen && <BookingModal slot={selectedSlot} onClose={handleCloseBookingModal} onBookingSuccess={handleBookingSuccess} />}
      {alertInfo.isOpen && <AlertModal title="Prenotazione non consentita" message={alertInfo.message} onClose={() => setAlertInfo({ isOpen: false, message: '' })} />}
      {confirmInfo.isOpen && (
        <ConfirmModal
          title="Annulla Prenotazione"
          message="Sei sicuro di voler annullare questa prenotazione?"
          onConfirm={executeCancellation}
          onCancel={() => setConfirmInfo({ isOpen: false, slotId: null })}
        />
      )}
    </div>
  );
};

export default ArtistDashboard;