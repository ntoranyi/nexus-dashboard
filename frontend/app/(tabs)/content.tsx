import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const YOUTUBE_STORAGE_KEY = 'nexus_youtube_channel';
const CALENDAR_STORAGE_KEY = 'nexus_content_calendar';

const YOUTUBE_STUDIO_URL = 'https://studio.youtube.com/channel/UCpaKX2Lw39z06NtJdldZmgQ';

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
  type: 'video' | 'short' | 'live' | 'story';
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const FULL_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const DEFAULT_YOUTUBE_DATA: YouTubeData = {
  channelName: '@nexusai.system',
  subscribers: '0',
  totalViews: '0',
  videosPublished: 0,
};

export default function ContentScreen() {
  const [youtubeData, setYoutubeData] = useState<YouTubeData>(DEFAULT_YOUTUBE_DATA);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<'video' | 'short' | 'live' | 'story'>('video');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const ytData = await AsyncStorage.getItem(YOUTUBE_STORAGE_KEY);
      if (ytData) {
        setYoutubeData(JSON.parse(ytData));
      }
      
      const calData = await AsyncStorage.getItem(CALENDAR_STORAGE_KEY);
      if (calData) {
        setCalendarEvents(JSON.parse(calData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveYoutubeData = async (data: YouTubeData) => {
    try {
      await AsyncStorage.setItem(YOUTUBE_STORAGE_KEY, JSON.stringify(data));
      setYoutubeData(data);
    } catch (error) {
      console.error('Error saving YouTube data:', error);
    }
  };

  const saveCalendarEvents = async (events: CalendarEvent[]) => {
    try {
      await AsyncStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
      setCalendarEvents(events);
    } catch (error) {
      console.error('Error saving calendar:', error);
    }
  };

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingField) return;
    
    const newData = { ...youtubeData };
    if (editingField === 'subscribers') {
      newData.subscribers = tempValue;
    } else if (editingField === 'totalViews') {
      newData.totalViews = tempValue;
    } else if (editingField === 'videosPublished') {
      newData.videosPublished = parseInt(tempValue) || 0;
    }
    
    saveYoutubeData(newData);
    setEditingField(null);
    setTempValue('');
  };

  const formatNumber = (num: string) => {
    const n = parseInt(num.replace(/[^0-9]/g, '')) || 0;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const openYouTubeStudio = () => {
    Linking.openURL(YOUTUBE_STUDIO_URL).catch(() => {
      Alert.alert('Erreur', 'Impossible d\'ouvrir YouTube Studio');
    });
  };

  const addCalendarEvent = () => {
    if (selectedDay === null || !newEventTitle.trim()) return;
    
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      day: selectedDay,
      title: newEventTitle.trim(),
      type: newEventType,
    };
    
    const updatedEvents = [...calendarEvents, newEvent];
    saveCalendarEvents(updatedEvents);
    setNewEventTitle('');
    setSelectedDay(null);
  };

  const removeCalendarEvent = (eventId: string) => {
    const updatedEvents = calendarEvents.filter(e => e.id !== eventId);
    saveCalendarEvents(updatedEvents);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'video': return '#ef4444';
      case 'short': return '#8b5cf6';
      case 'live': return '#00d4aa';
      case 'story': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return 'play-circle';
      case 'short': return 'phone-portrait';
      case 'live': return 'radio';
      case 'story': return 'layers';
      default: return 'ellipse';
    }
  };

  const getEventsForDay = (day: number) => {
    return calendarEvents.filter(e => e.day === day);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Content Hub</Text>
          <Text style={styles.subtitle}>YouTube & Calendrier</Text>
        </View>

        {/* YouTube Channel Module */}
        <View style={styles.youtubeSection}>
          <View style={styles.youtubeTitleRow}>
            <Ionicons name="logo-youtube" size={24} color="#ff0000" />
            <Text style={styles.sectionTitle}>YouTube Channel</Text>
          </View>

          {/* Channel Name */}
          <View style={styles.youtubeCard}>
            <View style={styles.youtubeStatRow}>
              <View style={styles.youtubeStatIcon}>
                <Ionicons name="at" size={20} color="#3b82f6" />
              </View>
              <View style={styles.youtubeStatContent}>
                <Text style={styles.youtubeStatLabel}>Channel</Text>
                <Text style={styles.youtubeStatValue}>{youtubeData.channelName}</Text>
              </View>
            </View>

            {/* Subscribers */}
            <TouchableOpacity
              style={styles.youtubeStatRow}
              onPress={() => startEditing('subscribers', youtubeData.subscribers)}
            >
              <View style={styles.youtubeStatIcon}>
                <Ionicons name="people" size={20} color="#ef4444" />
              </View>
              <View style={styles.youtubeStatContent}>
                <Text style={styles.youtubeStatLabel}>Abonnés</Text>
                {editingField === 'subscribers' ? (
                  <View style={styles.editRow}>
                    <TextInput
                      style={styles.editInput}
                      value={tempValue}
                      onChangeText={setTempValue}
                      keyboardType="numeric"
                      autoFocus
                      onBlur={saveEdit}
                      onSubmitEditing={saveEdit}
                    />
                    <TouchableOpacity onPress={saveEdit}>
                      <Ionicons name="checkmark-circle" size={24} color="#00d4aa" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.editableRow}>
                    <Text style={styles.youtubeStatValue}>{formatNumber(youtubeData.subscribers)}</Text>
                    <Ionicons name="pencil" size={14} color="#6b7280" />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Total Views */}
            <TouchableOpacity
              style={styles.youtubeStatRow}
              onPress={() => startEditing('totalViews', youtubeData.totalViews)}
            >
              <View style={styles.youtubeStatIcon}>
                <Ionicons name="eye" size={20} color="#00d4aa" />
              </View>
              <View style={styles.youtubeStatContent}>
                <Text style={styles.youtubeStatLabel}>Vues Totales</Text>
                {editingField === 'totalViews' ? (
                  <View style={styles.editRow}>
                    <TextInput
                      style={styles.editInput}
                      value={tempValue}
                      onChangeText={setTempValue}
                      keyboardType="numeric"
                      autoFocus
                      onBlur={saveEdit}
                      onSubmitEditing={saveEdit}
                    />
                    <TouchableOpacity onPress={saveEdit}>
                      <Ionicons name="checkmark-circle" size={24} color="#00d4aa" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.editableRow}>
                    <Text style={styles.youtubeStatValue}>{formatNumber(youtubeData.totalViews)}</Text>
                    <Ionicons name="pencil" size={14} color="#6b7280" />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Videos Published */}
            <TouchableOpacity
              style={styles.youtubeStatRow}
              onPress={() => startEditing('videosPublished', youtubeData.videosPublished.toString())}
            >
              <View style={styles.youtubeStatIcon}>
                <Ionicons name="videocam" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.youtubeStatContent}>
                <Text style={styles.youtubeStatLabel}>Vidéos Publiées</Text>
                {editingField === 'videosPublished' ? (
                  <View style={styles.editRow}>
                    <TextInput
                      style={styles.editInput}
                      value={tempValue}
                      onChangeText={setTempValue}
                      keyboardType="numeric"
                      autoFocus
                      onBlur={saveEdit}
                      onSubmitEditing={saveEdit}
                    />
                    <TouchableOpacity onPress={saveEdit}>
                      <Ionicons name="checkmark-circle" size={24} color="#00d4aa" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.editableRow}>
                    <Text style={styles.youtubeStatValue}>{youtubeData.videosPublished}</Text>
                    <Ionicons name="pencil" size={14} color="#6b7280" />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* YouTube Studio Link */}
            <TouchableOpacity style={styles.youtubeStudioButton} onPress={openYouTubeStudio}>
              <Ionicons name="open-outline" size={18} color="#ffffff" />
              <Text style={styles.youtubeStudioText}>Ouvrir YouTube Studio</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Calendar */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarTitleRow}>
            <Ionicons name="calendar" size={24} color="#00d4aa" />
            <Text style={styles.sectionTitle}>Content Calendar</Text>
          </View>
          <Text style={styles.calendarSubtitle}>Semaine actuelle</Text>

          {/* Weekly Grid */}
          <View style={styles.weekGrid}>
            {DAYS_OF_WEEK.map((day, index) => {
              const dayEvents = getEventsForDay(index);
              const isSelected = selectedDay === index;
              
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayColumn,
                    isSelected && styles.dayColumnSelected
                  ]}
                  onPress={() => setSelectedDay(isSelected ? null : index)}
                >
                  <Text style={[
                    styles.dayLabel,
                    isSelected && styles.dayLabelSelected
                  ]}>
                    {day}
                  </Text>
                  <View style={styles.dayContent}>
                    {dayEvents.length > 0 ? (
                      dayEvents.slice(0, 2).map((event) => (
                        <View
                          key={event.id}
                          style={[
                            styles.eventDot,
                            { backgroundColor: getEventTypeColor(event.type) }
                          ]}
                        />
                      ))
                    ) : (
                      <View style={styles.emptyDot} />
                    )}
                    {dayEvents.length > 2 && (
                      <Text style={styles.moreEvents}>+{dayEvents.length - 2}</Text>
                    )}
                  </View>
                  {dayEvents.length > 0 && (
                    <Text style={styles.eventCount}>{dayEvents.length}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Day Events */}
          {selectedDay !== null && (
            <View style={styles.selectedDaySection}>
              <Text style={styles.selectedDayTitle}>{FULL_DAYS[selectedDay]}</Text>
              
              {/* Events List */}
              {getEventsForDay(selectedDay).map((event) => (
                <View key={event.id} style={styles.eventItem}>
                  <View style={[
                    styles.eventTypeIcon,
                    { backgroundColor: `${getEventTypeColor(event.type)}20` }
                  ]}>
                    <Ionicons
                      name={getEventTypeIcon(event.type) as any}
                      size={16}
                      color={getEventTypeColor(event.type)}
                    />
                  </View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <TouchableOpacity onPress={() => removeCalendarEvent(event.id)}>
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add Event Form */}
              <View style={styles.addEventForm}>
                <TextInput
                  style={styles.eventInput}
                  placeholder="Nouveau contenu..."
                  placeholderTextColor="#6b7280"
                  value={newEventTitle}
                  onChangeText={setNewEventTitle}
                />
                <View style={styles.eventTypeButtons}>
                  {(['video', 'short', 'live', 'story'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.eventTypeButton,
                        newEventType === type && {
                          backgroundColor: `${getEventTypeColor(type)}30`,
                          borderColor: getEventTypeColor(type)
                        }
                      ]}
                      onPress={() => setNewEventType(type)}
                    >
                      <Ionicons
                        name={getEventTypeIcon(type) as any}
                        size={14}
                        color={newEventType === type ? getEventTypeColor(type) : '#6b7280'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={[
                    styles.addEventButton,
                    !newEventTitle.trim() && styles.addEventButtonDisabled
                  ]}
                  onPress={addCalendarEvent}
                  disabled={!newEventTitle.trim()}
                >
                  <Ionicons name="add" size={20} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>Vidéo</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8b5cf6' }]} />
              <Text style={styles.legendText}>Short</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#00d4aa' }]} />
              <Text style={styles.legendText}>Live</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>Story</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
  // YouTube Section
  youtubeSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  youtubeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  youtubeCard: {
    backgroundColor: '#12121a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ff000030',
  },
  youtubeStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f2e',
  },
  youtubeStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1f1f2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  youtubeStatContent: {
    flex: 1,
  },
  youtubeStatLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  youtubeStatValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#1f1f2e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  youtubeStudioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff0000',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 16,
    gap: 8,
  },
  youtubeStudioText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Calendar Section
  calendarSection: {
    paddingHorizontal: 20,
  },
  calendarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  calendarSubtitle: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 16,
  },
  weekGrid: {
    flexDirection: 'row',
    backgroundColor: '#12121a',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#1f1f2e',
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  dayColumnSelected: {
    backgroundColor: '#00d4aa20',
  },
  dayLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  dayLabelSelected: {
    color: '#00d4aa',
  },
  dayContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 3,
    minHeight: 20,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2d2d3d',
  },
  moreEvents: {
    color: '#6b7280',
    fontSize: 8,
  },
  eventCount: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 4,
  },
  selectedDaySection: {
    backgroundColor: '#12121a',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#00d4aa30',
  },
  selectedDayTitle: {
    color: '#00d4aa',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  eventTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventTitle: {
    flex: 1,
    color: '#e5e7eb',
    fontSize: 14,
  },
  addEventForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  eventInput: {
    flex: 1,
    backgroundColor: '#1a1a24',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
  },
  eventTypeButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  eventTypeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1a1a24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d3d',
  },
  addEventButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#00d4aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addEventButtonDisabled: {
    backgroundColor: '#2d2d3d',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: '#6b7280',
    fontSize: 11,
  },
  bottomPadding: {
    height: 40,
  },
});
