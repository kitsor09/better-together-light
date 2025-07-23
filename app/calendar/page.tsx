import { useState, useEffect } from 'react';
import { storageService, CalendarEvent } from '../../src/utils/storage';

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'reminder' as CalendarEvent['type'],
    recurring: 'none' as CalendarEvent['recurring']
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const loadedEvents = await storageService.getCalendarEvents();
      setEvents(loadedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEvent.title || !newEvent.date) {
      alert('Please fill in title and date');
      return;
    }

    try {
      const event: CalendarEvent = {
        id: `${Date.now()}-${Math.random()}`,
        title: newEvent.title,
        description: newEvent.description,
        date: new Date(newEvent.date + (newEvent.time ? `T${newEvent.time}` : '')),
        time: newEvent.time,
        type: newEvent.type,
        recurring: newEvent.recurring
      };

      await storageService.addCalendarEvent(event);
      setEvents([...events, event]);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        type: 'reminder',
        recurring: 'none'
      });
      setShowAddEvent(false);
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event. Please try again.');
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'anniversary': return '💕';
      case 'date': return '🌹';
      case 'cycle': return '🌸';
      case 'reminder': return '⏰';
      default: return '📅';
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    // const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayEvents = getEventsForDate(currentDay);
      days.push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === new Date().toDateString(),
        events: dayEvents
      });
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  if (isLoading) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>📅 Calendar</h1>
        <p>Loading your events...</p>
      </main>
    );
  }

  const calendarDays = generateCalendarDays();

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div className="calendar-header">
        <h1>📅 Calendar & Reminders</h1>
        <button 
          onClick={() => setShowAddEvent(!showAddEvent)}
          className={`add-event-btn ${showAddEvent ? 'active' : ''}`}
        >
          {showAddEvent ? '✕ Cancel' : '+ Add Event'}
        </button>
      </div>

      {showAddEvent && (
        <div className="add-event-form">
          <h3>Add New Event</h3>
          <form onSubmit={handleAddEvent}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                required
              />
            </div>
            
            <div className="form-row">
              <textarea
                placeholder="Description (optional)"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />
            </div>
            
            <div className="form-row">
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                required
              />
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
              />
            </div>
            
            <div className="form-row">
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({...newEvent, type: e.target.value as CalendarEvent['type']})}
              >
                <option value="reminder">⏰ Reminder</option>
                <option value="anniversary">💕 Anniversary</option>
                <option value="date">🌹 Date Night</option>
                <option value="cycle">🌸 Cycle Related</option>
                <option value="custom">📅 Custom</option>
              </select>
              
              <select
                value={newEvent.recurring}
                onChange={(e) => setNewEvent({...newEvent, recurring: e.target.value as CalendarEvent['recurring']})}
              >
                <option value="none">No repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="primary-button">Add Event</button>
            </div>
          </form>
        </div>
      )}

      <div className="calendar-navigation">
        <button onClick={() => navigateMonth('prev')}>‹ Previous</button>
        <h2>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => navigateMonth('next')}>Next ›</button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-header-row">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
        </div>
        
        {Array.from({ length: 6 }, (_, weekIndex) => (
          <div key={weekIndex} className="calendar-week">
            {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}`}
              >
                <div className="day-number">{day.date.getDate()}</div>
                {day.events.length > 0 && (
                  <div className="day-events">
                    {day.events.slice(0, 3).map((event, index) => (
                      <div key={index} className={`event-dot event-${event.type}`} title={event.title}>
                        {getEventIcon(event.type)}
                      </div>
                    ))}
                    {day.events.length > 3 && (
                      <div className="more-events">+{day.events.length - 3}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="upcoming-events">
        <h3>Upcoming Events</h3>
        {events
          .filter(event => new Date(event.date) >= new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5)
          .map(event => (
            <div key={event.id} className="event-item">
              <div className="event-icon">{getEventIcon(event.type)}</div>
              <div className="event-details">
                <h4>{event.title}</h4>
                <p className="event-date">
                  {formatDate(new Date(event.date))}
                  {event.time && ` at ${event.time}`}
                </p>
                {event.description && <p className="event-description">{event.description}</p>}
              </div>
            </div>
          ))}
        
        {events.filter(event => new Date(event.date) >= new Date()).length === 0 && (
          <p className="no-events">No upcoming events. Add some special moments! 💝</p>
        )}
      </div>
    </main>
  );
}