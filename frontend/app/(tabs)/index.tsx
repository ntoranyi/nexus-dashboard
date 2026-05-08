import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const CHECKLIST_STORAGE_KEY = 'nexus_launch_checklist';
const KPI_STORAGE_KEY = 'nexus_kpi_data';
const REVENUE_LOG_STORAGE_KEY = 'nexus_revenue_log';
const MONTHLY_TARGET_KEY = 'nexus_monthly_target';

const LAUNCH_CHECKLIST_ITEMS = [
  { id: 1, text: 'Créer compte Shopify', category: 'Setup' },
  { id: 2, text: 'Configurer domaine personnalisé', category: 'Setup' },
  { id: 3, text: 'Installer thème optimisé', category: 'Setup' },
  { id: 4, text: 'Configurer paiements (Stripe/PayPal)', category: 'Setup' },
  { id: 5, text: 'Ajouter 5+ produits gagnants', category: 'Produits' },
  { id: 6, text: 'Optimiser descriptions produits', category: 'Produits' },
  { id: 7, text: 'Créer collections produits', category: 'Produits' },
  { id: 8, text: 'Configurer prix et marges', category: 'Produits' },
  { id: 9, text: 'Créer compte TikTok Business', category: 'Marketing' },
  { id: 10, text: 'Créer compte Meta Business', category: 'Marketing' },
  { id: 11, text: 'Installer pixels tracking', category: 'Marketing' },
  { id: 12, text: 'Préparer 3 creatives vidéo', category: 'Marketing' },
  { id: 13, text: 'Configurer email marketing', category: 'Automation' },
  { id: 14, text: 'Créer séquence abandon panier', category: 'Automation' },
  { id: 15, text: 'Tester processus commande', category: 'QA' },
  { id: 16, text: 'Lancer première campagne', category: 'Launch' },
];

const AFFILIATE_PROGRAMS = ['FF', '7FA', 'Shopify', 'Other'];

interface KPIData {
  revenue: number;
  leads: number;
  subscribers: number;
  clicks: number;
  shopifyRevenue: number;
}

interface RevenueEntry {
  id: string;
  date: string;
  program: string;
  amount: number;
  notes: string;
}

interface DailyAction {
  id: string;
  action_type: string;
  title: string;
  description: string;
  priority: string;
  product_name: string | null;
  recommended_budget: number | null;
}

const DEFAULT_KPI: KPIData = {
  revenue: 4187,
  leads: 31,
  subscribers: 247,
  clicks: 496,
  shopifyRevenue: 1840,
};

export default function DashboardScreen() {
  const [actions, setActions] = useState<DailyAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [showAllChecklist, setShowAllChecklist] = useState(false);
  
  // Editable KPIs
  const [kpiData, setKpiData] = useState<KPIData>(DEFAULT_KPI);
  const [editingKPI, setEditingKPI] = useState<string | null>(null);
  const [tempKPIValue, setTempKPIValue] = useState('');
  
  // Revenue Logger
  const [revenueEntries, setRevenueEntries] = useState<RevenueEntry[]>([]);
  const [monthlyTarget, setMonthlyTarget] = useState(10000);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showRevenueList, setShowRevenueList] = useState(false);
  const [newRevenue, setNewRevenue] = useState({
    date: new Date().toISOString().split('T')[0],
    program: 'FF',
    amount: '',
    notes: '',
  });
  const [editingTarget, setEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState('');

  // Load all data from AsyncStorage
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [checklistData, kpiDataStored, revenueData, targetData] = await Promise.all([
        AsyncStorage.getItem(CHECKLIST_STORAGE_KEY),
        AsyncStorage.getItem(KPI_STORAGE_KEY),
        AsyncStorage.getItem(REVENUE_LOG_STORAGE_KEY),
        AsyncStorage.getItem(MONTHLY_TARGET_KEY),
      ]);
      
      if (checklistData) setCheckedItems(JSON.parse(checklistData));
      if (kpiDataStored) setKpiData(JSON.parse(kpiDataStored));
      if (revenueData) setRevenueEntries(JSON.parse(revenueData));
      if (targetData) setMonthlyTarget(JSON.parse(targetData));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveKPIData = async (data: KPIData) => {
    try {
      await AsyncStorage.setItem(KPI_STORAGE_KEY, JSON.stringify(data));
      setKpiData(data);
    } catch (error) {
      console.error('Error saving KPI data:', error);
    }
  };

  const saveRevenueEntries = async (entries: RevenueEntry[]) => {
    try {
      await AsyncStorage.setItem(REVENUE_LOG_STORAGE_KEY, JSON.stringify(entries));
      setRevenueEntries(entries);
    } catch (error) {
      console.error('Error saving revenue entries:', error);
    }
  };

  const saveMonthlyTarget = async (target: number) => {
    try {
      await AsyncStorage.setItem(MONTHLY_TARGET_KEY, JSON.stringify(target));
      setMonthlyTarget(target);
    } catch (error) {
      console.error('Error saving monthly target:', error);
    }
  };

  const saveChecklistState = async (items: number[]) => {
    try {
      await AsyncStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving checklist:', error);
    }
  };

  const toggleCheckItem = (id: number) => {
    const newCheckedItems = checkedItems.includes(id)
      ? checkedItems.filter(item => item !== id)
      : [...checkedItems, id];
    
    setCheckedItems(newCheckedItems);
    saveChecklistState(newCheckedItems);
  };

  const checklistProgress = Math.round((checkedItems.length / LAUNCH_CHECKLIST_ITEMS.length) * 100);

  // KPI Editing
  const startEditingKPI = (key: string, value: number) => {
    setEditingKPI(key);
    setTempKPIValue(value.toString());
  };

  const saveKPIEdit = () => {
    if (!editingKPI) return;
    
    const newValue = parseFloat(tempKPIValue) || 0;
    const newData = { ...kpiData, [editingKPI]: newValue };
    saveKPIData(newData);
    setEditingKPI(null);
    setTempKPIValue('');
  };

  // Revenue Logger
  const addRevenueEntry = () => {
    if (!newRevenue.amount || parseFloat(newRevenue.amount) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    const entry: RevenueEntry = {
      id: Date.now().toString(),
      date: newRevenue.date,
      program: newRevenue.program,
      amount: parseFloat(newRevenue.amount),
      notes: newRevenue.notes,
    };

    const updatedEntries = [entry, ...revenueEntries];
    saveRevenueEntries(updatedEntries);
    
    setNewRevenue({
      date: new Date().toISOString().split('T')[0],
      program: 'FF',
      amount: '',
      notes: '',
    });
    setShowRevenueModal(false);
  };

  const deleteRevenueEntry = (id: string) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous supprimer cette entrée?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const updatedEntries = revenueEntries.filter(e => e.id !== id);
            saveRevenueEntries(updatedEntries);
          },
        },
      ]
    );
  };

  const totalLoggedRevenue = revenueEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const revenueProgress = Math.min((totalLoggedRevenue / monthlyTarget) * 100, 100);

  const fetchData = async () => {
    try {
      const actionsRes = await fetch(`${API_URL}/api/dashboard/actions`);
      const actionsData = await actionsRes.json();
      setActions(actionsData);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    await loadAllData();
    setRefreshing(false);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'scale': return 'rocket';
      case 'launch': return 'play-circle';
      case 'stop': return 'stop-circle';
      case 'optimize': return 'settings';
      default: return 'ellipse';
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'scale': return '#00d4aa';
      case 'launch': return '#3b82f6';
      case 'stop': return '#ef4444';
      case 'optimize': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Setup': return '#3b82f6';
      case 'Produits': return '#8b5cf6';
      case 'Marketing': return '#ec4899';
      case 'Automation': return '#f59e0b';
      case 'QA': return '#14b8a6';
      case 'Launch': return '#00d4aa';
      default: return '#6b7280';
    }
  };

  const getProgramColor = (program: string) => {
    switch (program) {
      case 'FF': return '#ef4444';
      case '7FA': return '#8b5cf6';
      case 'Shopify': return '#00d4aa';
      case 'Other': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const displayedChecklistItems = showAllChecklist 
    ? LAUNCH_CHECKLIST_ITEMS 
    : LAUNCH_CHECKLIST_ITEMS.slice(0, 6);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00d4aa" />
          <Text style={styles.loadingText}>Chargement NEXUS AI...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderEditableKPI = (
    key: keyof KPIData,
    label: string,
    icon: string,
    iconColor: string,
    prefix: string = '',
    suffix: string = ''
  ) => {
    const isEditing = editingKPI === key;
    const value = kpiData[key];

    return (
      <View style={styles.statCard}>
        <View style={styles.statHeader}>
          <Ionicons name={icon as any} size={22} color={iconColor} />
          <TouchableOpacity
            style={styles.editIconButton}
            onPress={() => startEditingKPI(key, value)}
          >
            <Ionicons name="pencil" size={12} color="#6b7280" />
          </TouchableOpacity>
        </View>
        {isEditing ? (
          <View style={styles.editKPIContainer}>
            <TextInput
              style={styles.editKPIInput}
              value={tempKPIValue}
              onChangeText={setTempKPIValue}
              keyboardType="numeric"
              autoFocus
              selectTextOnFocus
            />
            <TouchableOpacity onPress={saveKPIEdit} style={styles.saveKPIButton}>
              <Ionicons name="checkmark" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => startEditingKPI(key, value)}>
            <Text style={styles.statValue}>
              {prefix}{formatNumber(value)}{suffix}
            </Text>
          </TouchableOpacity>
        )}
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4aa" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour, CEO</Text>
            <Text style={styles.title}>NEXUS AI Dashboard</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Live</Text>
          </View>
        </View>

        {/* Editable KPI Stats Grid */}
        <View style={styles.statsGrid}>
          {renderEditableKPI('revenue', 'Revenue Total', 'cash', '#00d4aa', '$')}
          {renderEditableKPI('leads', 'Leads', 'people', '#3b82f6')}
          {renderEditableKPI('subscribers', 'Subscribers', 'mail', '#8b5cf6')}
          {renderEditableKPI('clicks', 'Clicks', 'finger-print', '#f59e0b')}
        </View>

        {/* Shopify Revenue - Editable */}
        <View style={styles.shopifyCard}>
          <View style={styles.shopifyHeader}>
            <Ionicons name="bag-handle" size={20} color="#00d4aa" />
            <Text style={styles.shopifyTitle}>Shopify Revenue</Text>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => startEditingKPI('shopifyRevenue', kpiData.shopifyRevenue)}
            >
              <Ionicons name="pencil" size={12} color="#6b7280" />
            </TouchableOpacity>
          </View>
          {editingKPI === 'shopifyRevenue' ? (
            <View style={styles.editKPIContainer}>
              <TextInput
                style={styles.editKPIInputLarge}
                value={tempKPIValue}
                onChangeText={setTempKPIValue}
                keyboardType="numeric"
                autoFocus
                selectTextOnFocus
              />
              <TouchableOpacity onPress={saveKPIEdit} style={styles.saveKPIButton}>
                <Ionicons name="checkmark" size={18} color="#000" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => startEditingKPI('shopifyRevenue', kpiData.shopifyRevenue)}>
              <Text style={styles.shopifyValue}>{formatCurrency(kpiData.shopifyRevenue)}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Revenue Logger Section */}
        <View style={styles.revenueSection}>
          <View style={styles.revenueTitleRow}>
            <Ionicons name="wallet" size={22} color="#00d4aa" />
            <Text style={styles.sectionTitle}>Revenue Logger</Text>
            <TouchableOpacity
              style={styles.addRevenueButton}
              onPress={() => setShowRevenueModal(true)}
            >
              <Ionicons name="add" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Progress towards target */}
          <View style={styles.targetContainer}>
            <View style={styles.targetHeader}>
              <Text style={styles.targetLabel}>Monthly Target</Text>
              {editingTarget ? (
                <View style={styles.editTargetRow}>
                  <TextInput
                    style={styles.editTargetInput}
                    value={tempTarget}
                    onChangeText={setTempTarget}
                    keyboardType="numeric"
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => {
                      saveMonthlyTarget(parseFloat(tempTarget) || 10000);
                      setEditingTarget(false);
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={22} color="#00d4aa" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.targetValueRow}
                  onPress={() => {
                    setTempTarget(monthlyTarget.toString());
                    setEditingTarget(true);
                  }}
                >
                  <Text style={styles.targetValue}>{formatCurrency(monthlyTarget)}</Text>
                  <Ionicons name="pencil" size={12} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.revenueProgressContainer}>
              <View style={styles.revenueProgressBar}>
                <View style={[styles.revenueProgressFill, { width: `${revenueProgress}%` }]} />
              </View>
              <Text style={styles.revenueProgressText}>{revenueProgress.toFixed(0)}%</Text>
            </View>

            <View style={styles.revenueStats}>
              <View style={styles.revenueStat}>
                <Text style={styles.revenueStatLabel}>Logged</Text>
                <Text style={styles.revenueStatValue}>{formatCurrency(totalLoggedRevenue)}</Text>
              </View>
              <View style={styles.revenueStat}>
                <Text style={styles.revenueStatLabel}>Remaining</Text>
                <Text style={[styles.revenueStatValue, { color: '#f59e0b' }]}>
                  {formatCurrency(Math.max(0, monthlyTarget - totalLoggedRevenue))}
                </Text>
              </View>
            </View>
          </View>

          {/* Recent Entries */}
          {revenueEntries.length > 0 && (
            <View style={styles.recentEntriesContainer}>
              <TouchableOpacity
                style={styles.recentEntriesHeader}
                onPress={() => setShowRevenueList(!showRevenueList)}
              >
                <Text style={styles.recentEntriesTitle}>
                  Recent Entries ({revenueEntries.length})
                </Text>
                <Ionicons
                  name={showRevenueList ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#6b7280"
                />
              </TouchableOpacity>

              {showRevenueList && (
                <View style={styles.entriesList}>
                  {revenueEntries.slice(0, 10).map((entry) => (
                    <View key={entry.id} style={styles.entryItem}>
                      <View style={[styles.entryProgram, { backgroundColor: `${getProgramColor(entry.program)}20` }]}>
                        <Text style={[styles.entryProgramText, { color: getProgramColor(entry.program) }]}>
                          {entry.program}
                        </Text>
                      </View>
                      <View style={styles.entryDetails}>
                        <Text style={styles.entryAmount}>{formatCurrency(entry.amount)}</Text>
                        <Text style={styles.entryDate}>{entry.date}</Text>
                        {entry.notes ? <Text style={styles.entryNotes}>{entry.notes}</Text> : null}
                      </View>
                      <TouchableOpacity onPress={() => deleteRevenueEntry(entry.id)}>
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Launch Checklist */}
        <View style={styles.checklistSection}>
          <View style={styles.checklistHeader}>
            <View style={styles.checklistTitleRow}>
              <Ionicons name="checkbox" size={22} color="#00d4aa" />
              <Text style={styles.sectionTitle}>Launch Checklist</Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${checklistProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>{checklistProgress}%</Text>
            </View>
          </View>
          <Text style={styles.checklistSubtitle}>
            {checkedItems.length}/{LAUNCH_CHECKLIST_ITEMS.length} tâches complétées
          </Text>
          
          <View style={styles.checklistContainer}>
            {displayedChecklistItems.map((item) => {
              const isChecked = checkedItems.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.checklistItem,
                    isChecked && styles.checklistItemChecked
                  ]}
                  onPress={() => toggleCheckItem(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    isChecked && styles.checkboxChecked
                  ]}>
                    {isChecked && <Ionicons name="checkmark" size={14} color="#000" />}
                  </View>
                  <View style={styles.checklistItemContent}>
                    <Text style={[
                      styles.checklistItemText,
                      isChecked && styles.checklistItemTextChecked
                    ]}>
                      {item.text}
                    </Text>
                    <View style={[
                      styles.categoryBadge,
                      { backgroundColor: `${getCategoryColor(item.category)}20` }
                    ]}>
                      <Text style={[
                        styles.categoryText,
                        { color: getCategoryColor(item.category) }
                      ]}>
                        {item.category}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => setShowAllChecklist(!showAllChecklist)}
          >
            <Text style={styles.showMoreText}>
              {showAllChecklist ? 'Voir moins' : `Voir tout (${LAUNCH_CHECKLIST_ITEMS.length})`}
            </Text>
            <Ionicons 
              name={showAllChecklist ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color="#00d4aa" 
            />
          </TouchableOpacity>
        </View>

        {/* Daily Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions Prioritaires</Text>
          {actions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.actionCard}>
              <View style={styles.actionHeader}>
                <View style={[styles.actionIconContainer, { backgroundColor: `${getActionColor(action.action_type)}20` }]}>
                  <Ionicons
                    name={getActionIcon(action.action_type) as any}
                    size={20}
                    color={getActionColor(action.action_type)}
                  />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(action.priority)}20` }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(action.priority) }]}>
                    {action.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Revenue Modal */}
      <Modal visible={showRevenueModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Affiliate Commission</Text>
              <TouchableOpacity onPress={() => setShowRevenueModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Date */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <TextInput
                  style={styles.formInput}
                  value={newRevenue.date}
                  onChangeText={(text) => setNewRevenue({ ...newRevenue, date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#6b7280"
                />
              </View>

              {/* Program */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Program</Text>
                <View style={styles.programButtons}>
                  {AFFILIATE_PROGRAMS.map((program) => (
                    <TouchableOpacity
                      key={program}
                      style={[
                        styles.programButton,
                        newRevenue.program === program && {
                          backgroundColor: `${getProgramColor(program)}30`,
                          borderColor: getProgramColor(program),
                        }
                      ]}
                      onPress={() => setNewRevenue({ ...newRevenue, program })}
                    >
                      <Text style={[
                        styles.programButtonText,
                        newRevenue.program === program && { color: getProgramColor(program) }
                      ]}>
                        {program}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Amount */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount ($)</Text>
                <TextInput
                  style={styles.formInput}
                  value={newRevenue.amount}
                  onChangeText={(text) => setNewRevenue({ ...newRevenue, amount: text })}
                  placeholder="0.00"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                />
              </View>

              {/* Notes */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notes (optional)</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextarea]}
                  value={newRevenue.notes}
                  onChangeText={(text) => setNewRevenue({ ...newRevenue, notes: text })}
                  placeholder="Add notes..."
                  placeholderTextColor="#6b7280"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={addRevenueEntry}>
                <Ionicons name="add-circle" size={20} color="#000" />
                <Text style={styles.submitButtonText}>Log Commission</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greeting: {
    color: '#6b7280',
    fontSize: 14,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00d4aa20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00d4aa',
    marginRight: 6,
  },
  statusText: {
    color: '#00d4aa',
    fontSize: 12,
    fontWeight: '600',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#12121a',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f1f2e',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editIconButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1f1f2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 4,
  },
  editKPIContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  editKPIInput: {
    flex: 1,
    backgroundColor: '#1f1f2e',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editKPIInputLarge: {
    flex: 1,
    backgroundColor: '#1f1f2e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveKPIButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00d4aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Shopify Card
  shopifyCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#12121a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#00d4aa30',
  },
  shopifyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shopifyTitle: {
    color: '#00d4aa',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  shopifyValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  // Revenue Logger
  revenueSection: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#12121a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#00d4aa30',
  },
  revenueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  addRevenueButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00d4aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetContainer: {
    marginBottom: 16,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  targetLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  targetValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  targetValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  editTargetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editTargetInput: {
    backgroundColor: '#1f1f2e',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: '#ffffff',
    fontSize: 14,
    width: 100,
  },
  revenueProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  revenueProgressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#1f1f2e',
    borderRadius: 6,
    overflow: 'hidden',
  },
  revenueProgressFill: {
    height: '100%',
    backgroundColor: '#00d4aa',
    borderRadius: 6,
  },
  revenueProgressText: {
    color: '#00d4aa',
    fontSize: 14,
    fontWeight: 'bold',
    width: 45,
    textAlign: 'right',
  },
  revenueStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  revenueStat: {},
  revenueStatLabel: {
    color: '#6b7280',
    fontSize: 11,
  },
  revenueStatValue: {
    color: '#00d4aa',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recentEntriesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#1f1f2e',
    paddingTop: 12,
  },
  recentEntriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentEntriesTitle: {
    color: '#9ca3af',
    fontSize: 13,
  },
  entriesList: {
    marginTop: 12,
    gap: 8,
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    borderRadius: 10,
    padding: 10,
    gap: 10,
  },
  entryProgram: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  entryProgramText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  entryDetails: {
    flex: 1,
  },
  entryAmount: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  entryDate: {
    color: '#6b7280',
    fontSize: 11,
  },
  entryNotes: {
    color: '#9ca3af',
    fontSize: 11,
    fontStyle: 'italic',
  },
  // Launch Checklist
  checklistSection: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#12121a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f1f2e',
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  checklistTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBg: {
    width: 60,
    height: 8,
    backgroundColor: '#1f1f2e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00d4aa',
    borderRadius: 4,
  },
  progressText: {
    color: '#00d4aa',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checklistSubtitle: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 12,
  },
  checklistContainer: {
    gap: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2d2d3d',
  },
  checklistItemChecked: {
    backgroundColor: '#00d4aa10',
    borderColor: '#00d4aa30',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4b5563',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#00d4aa',
    borderColor: '#00d4aa',
  },
  checklistItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checklistItemText: {
    color: '#e5e7eb',
    fontSize: 13,
    flex: 1,
  },
  checklistItemTextChecked: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    gap: 4,
  },
  showMoreText: {
    color: '#00d4aa',
    fontSize: 13,
    fontWeight: '500',
  },
  // Actions
  actionsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  actionCard: {
    backgroundColor: '#12121a',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1f1f2e',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionDescription: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 30,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#12121a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f2e',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2d2d3d',
  },
  formTextarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  programButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  programButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1a1a24',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d3d',
  },
  programButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00d4aa',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
