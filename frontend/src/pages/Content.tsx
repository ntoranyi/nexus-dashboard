import { useState, useEffect } from 'react';
import { MonitorPlay as Youtube, AtSign, Users, Eye, Video, ExternalLink, Calendar, Plus, X, Play, Radio, Smartphone, Layers, Pencil, Check } from 'lucide-react';
import { loadFromStorage, saveToStorage, YOUTUBE_STORAGE_KEY, CALENDAR_STORAGE_KEY } from '../lib/storage';
import './Content.css';

const YOUTUBE_STUDIO_URL = 'https://studio.youtube.com/channel/UCpaKX2Lw39z06NtJdldZmgQ';
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const FULL_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const EVENT_TYPES = [
  { id: 'video', icon: Play, color: '#ef4444', label: 'Vidéo' },
  { id: 'short', icon: Smartphone, color: '#8b5cf6', label: 'Short' },
  { id: 'live', icon: Radio, color: '#00d4aa', label: 'Live' },
  { id: 'story', icon: Layers, color: '#f59e0b', label: 'Story' },
];

interface YouTubeData {
  channelName: string;
  subscribers: string;
  totalViews: string;
  videosPublished: number;
}

interface CalendarEvent {
  id: string;
  day: number;
  title: string;
  type: string;
}

const DEFAULT_YT: YouTubeData = {
  channelName: '@nexusai.system',
  subscribers: '0',
  totalViews: '0',
  videosPublished: 0,
};

export default function Content() {
  const [ytData, setYtData] = useState<YouTubeData>(DEFAULT_YT);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState('video');

  useEffect(() => {
    setYtData(loadFromStorage(YOUTUBE_STORAGE_KEY, DEFAULT_YT));
    setEvents(loadFromStorage(CALENDAR_STORAGE_KEY, []));
  }, []);

  const saveYT = (data: YouTubeData) => {
    setYtData(data);
    saveToStorage(YOUTUBE_STORAGE_KEY, data);
  };

  const saveEvents = (data: CalendarEvent[]) => {
    setEvents(data);
    saveToStorage(CALENDAR_STORAGE_KEY, data);
  };

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  const saveEdit = () => {
    if (!editingField) return;
    const newData = { ...ytData };
    if (editingField === 'subscribers') newData.subscribers = tempValue;
    else if (editingField === 'totalViews') newData.totalViews = tempValue;
    else if (editingField === 'videosPublished') newData.videosPublished = parseInt(tempValue) || 0;
    saveYT(newData);
    setEditingField(null);
  };

  const formatNumber = (num: string) => {
    const n = parseInt(num.replace(/[^0-9]/g, '')) || 0;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const addEvent = () => {
    if (selectedDay === null || !newEventTitle.trim()) return;
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      day: selectedDay,
      title: newEventTitle.trim(),
      type: newEventType,
    };
    saveEvents([...events, newEvent]);
    setNewEventTitle('');
  };

  const removeEvent = (id: string) => {
    saveEvents(events.filter(e => e.id !== id));
  };

  const getEventsForDay = (day: number) => events.filter(e => e.day === day);
  const getTypeInfo = (type: string) => EVENT_TYPES.find(t => t.id === type) || EVENT_TYPES[0];

  return (
    <div className="content-page">
      <header className="header">
        <h1>Content Hub</h1>
        <p>YouTube & Calendrier</p>
      </header>

      {/* YouTube Section */}
      <section className="youtube-section">
        <div className="section-title">
          <Youtube size={24} color="#ff0000" />
          <h2>YouTube Channel</h2>
        </div>

        <div className="youtube-card">
          <div className="yt-stat">
            <div className="yt-icon"><AtSign size={20} color="#3b82f6" /></div>
            <div className="yt-content">
              <small>Channel</small>
              <strong>{ytData.channelName}</strong>
            </div>
          </div>

          <div className="yt-stat" onClick={() => startEdit('subscribers', ytData.subscribers)}>
            <div className="yt-icon"><Users size={20} color="#ef4444" /></div>
            <div className="yt-content">
              <small>Abonnés</small>
              {editingField === 'subscribers' ? (
                <div className="edit-row">
                  <input value={tempValue} onChange={e => setTempValue(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                  <button onClick={saveEdit}><Check size={18} color="#00d4aa" /></button>
                </div>
              ) : (
                <div className="editable"><strong>{formatNumber(ytData.subscribers)}</strong><Pencil size={14} /></div>
              )}
            </div>
          </div>

          <div className="yt-stat" onClick={() => startEdit('totalViews', ytData.totalViews)}>
            <div className="yt-icon"><Eye size={20} color="#00d4aa" /></div>
            <div className="yt-content">
              <small>Vues Totales</small>
              {editingField === 'totalViews' ? (
                <div className="edit-row">
                  <input value={tempValue} onChange={e => setTempValue(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                  <button onClick={saveEdit}><Check size={18} color="#00d4aa" /></button>
                </div>
              ) : (
                <div className="editable"><strong>{formatNumber(ytData.totalViews)}</strong><Pencil size={14} /></div>
              )}
            </div>
          </div>

          <div className="yt-stat" onClick={() => startEdit('videosPublished', ytData.videosPublished.toString())}>
            <div className="yt-icon"><Video size={20} color="#8b5cf6" /></div>
            <div className="yt-content">
              <small>Vidéos Publiées</small>
              {editingField === 'videosPublished' ? (
                <div className="edit-row">
                  <input type="number" value={tempValue} onChange={e => setTempValue(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                  <button onClick={saveEdit}><Check size={18} color="#00d4aa" /></button>
                </div>
              ) : (
                <div className="editable"><strong>{ytData.videosPublished}</strong><Pencil size={14} /></div>
              )}
            </div>
          </div>

          <a href={YOUTUBE_STUDIO_URL} target="_blank" rel="noopener noreferrer" className="yt-studio-btn">
            <ExternalLink size={18} /> Ouvrir YouTube Studio
          </a>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="calendar-section">
        <div className="section-title">
          <Calendar size={24} color="#00d4aa" />
          <h2>Content Calendar</h2>
        </div>
        <p className="calendar-subtitle">Semaine actuelle</p>

        <div className="week-grid">
          {DAYS.map((day, i) => {
            const dayEvents = getEventsForDay(i);
            const isSelected = selectedDay === i;
            return (
              <button
                key={day}
                className={`day-column ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDay(isSelected ? null : i)}
              >
                <span className="day-label">{day}</span>
                <div className="day-dots">
                  {dayEvents.length > 0 ? (
                    dayEvents.slice(0, 2).map(e => (
                      <span key={e.id} className="event-dot" style={{ background: getTypeInfo(e.type).color }} />
                    ))
                  ) : (
                    <span className="event-dot empty" />
                  )}
                  {dayEvents.length > 2 && <span className="more">+{dayEvents.length - 2}</span>}
                </div>
                {dayEvents.length > 0 && <span className="event-count">{dayEvents.length}</span>}
              </button>
            );
          })}
        </div>

        {selectedDay !== null && (
          <div className="selected-day">
            <h3>{FULL_DAYS[selectedDay]}</h3>
            
            {getEventsForDay(selectedDay).map(event => {
              const typeInfo = getTypeInfo(event.type);
              const Icon = typeInfo.icon;
              return (
                <div key={event.id} className="event-item">
                  <div className="event-icon" style={{ background: `${typeInfo.color}20` }}>
                    <Icon size={16} color={typeInfo.color} />
                  </div>
                  <span className="event-title">{event.title}</span>
                  <button onClick={() => removeEvent(event.id)}><X size={18} color="#ef4444" /></button>
                </div>
              );
            })}

            <div className="add-event-form">
              <input
                placeholder="Nouveau contenu..."
                value={newEventTitle}
                onChange={e => setNewEventTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addEvent()}
              />
              <div className="type-buttons">
                {EVENT_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      className={newEventType === type.id ? 'active' : ''}
                      style={newEventType === type.id ? { background: `${type.color}30`, borderColor: type.color } : {}}
                      onClick={() => setNewEventType(type.id)}
                    >
                      <Icon size={14} color={newEventType === type.id ? type.color : '#6b7280'} />
                    </button>
                  );
                })}
              </div>
              <button className="add-btn" onClick={addEvent} disabled={!newEventTitle.trim()}>
                <Plus size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="legend">
          {EVENT_TYPES.map(type => (
            <div key={type.id} className="legend-item">
              <span className="legend-dot" style={{ background: type.color }} />
              <span>{type.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
