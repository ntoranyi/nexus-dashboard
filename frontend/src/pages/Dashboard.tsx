import { useState, useEffect } from 'react';
import { DollarSign, Users, Mail, MousePointer, ShoppingBag, Wallet, Plus, Check, ChevronDown, ChevronUp, Pencil, Trash2, Rocket, PlayCircle, StopCircle, Settings } from 'lucide-react';
import { api } from '../lib/api';
import type { DailyAction } from '../types';
import { loadFromStorage, saveToStorage, CHECKLIST_STORAGE_KEY, KPI_STORAGE_KEY, REVENUE_LOG_STORAGE_KEY, MONTHLY_TARGET_KEY } from '../lib/storage';
import './Dashboard.css';

const LAUNCH_CHECKLIST = [
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

const DEFAULT_KPI: KPIData = {
  revenue: 4187,
  leads: 31,
  subscribers: 247,
  clicks: 496,
  shopifyRevenue: 1840,
};

export default function Dashboard() {
  const [actions, setActions] = useState<DailyAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [showAllChecklist, setShowAllChecklist] = useState(false);
  const [kpiData, setKpiData] = useState<KPIData>(DEFAULT_KPI);
  const [editingKPI, setEditingKPI] = useState<string | null>(null);
  const [tempKPIValue, setTempKPIValue] = useState('');
  const [revenueEntries, setRevenueEntries] = useState<RevenueEntry[]>([]);
  const [monthlyTarget, setMonthlyTarget] = useState(10000);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showRevenueList, setShowRevenueList] = useState(false);
  const [editingTarget, setEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState('');
  const [newRevenue, setNewRevenue] = useState({
    date: new Date().toISOString().split('T')[0],
    program: 'FF',
    amount: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
    fetchActions();
  }, []);

  const loadData = () => {
    setCheckedItems(loadFromStorage(CHECKLIST_STORAGE_KEY, []));
    setKpiData(loadFromStorage(KPI_STORAGE_KEY, DEFAULT_KPI));
    setRevenueEntries(loadFromStorage(REVENUE_LOG_STORAGE_KEY, []));
    setMonthlyTarget(loadFromStorage(MONTHLY_TARGET_KEY, 10000));
  };

  const fetchActions = async () => {
    try {
      const data = await api.getDashboardActions();
      setActions(data);
    } catch (error) {
      console.error('Error fetching actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheckItem = (id: number) => {
    const newItems = checkedItems.includes(id)
      ? checkedItems.filter(i => i !== id)
      : [...checkedItems, id];
    setCheckedItems(newItems);
    saveToStorage(CHECKLIST_STORAGE_KEY, newItems);
  };

  const startEditingKPI = (key: string, value: number) => {
    setEditingKPI(key);
    setTempKPIValue(value.toString());
  };

  const saveKPIEdit = () => {
    if (!editingKPI) return;
    const newData = { ...kpiData, [editingKPI]: parseFloat(tempKPIValue) || 0 };
    setKpiData(newData);
    saveToStorage(KPI_STORAGE_KEY, newData);
    setEditingKPI(null);
  };

  const addRevenueEntry = () => {
    if (!newRevenue.amount || parseFloat(newRevenue.amount) <= 0) return;
    const entry: RevenueEntry = {
      id: Date.now().toString(),
      date: newRevenue.date,
      program: newRevenue.program,
      amount: parseFloat(newRevenue.amount),
      notes: newRevenue.notes,
    };
    const updated = [entry, ...revenueEntries];
    setRevenueEntries(updated);
    saveToStorage(REVENUE_LOG_STORAGE_KEY, updated);
    setNewRevenue({ date: new Date().toISOString().split('T')[0], program: 'FF', amount: '', notes: '' });
    setShowRevenueModal(false);
  };

  const deleteRevenueEntry = (id: string) => {
    const updated = revenueEntries.filter(e => e.id !== id);
    setRevenueEntries(updated);
    saveToStorage(REVENUE_LOG_STORAGE_KEY, updated);
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatNumber = (value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString();
  
  const checklistProgress = Math.round((checkedItems.length / LAUNCH_CHECKLIST.length) * 100);
  const totalLoggedRevenue = revenueEntries.reduce((sum, e) => sum + e.amount, 0);
  const revenueProgress = Math.min((totalLoggedRevenue / monthlyTarget) * 100, 100);

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      Setup: '#3b82f6', Produits: '#8b5cf6', Marketing: '#ec4899',
      Automation: '#f59e0b', QA: '#14b8a6', Launch: '#00d4aa'
    };
    return colors[cat] || '#6b7280';
  };

  const getProgramColor = (prog: string) => {
    const colors: Record<string, string> = {
      FF: '#ef4444', '7FA': '#8b5cf6', Shopify: '#00d4aa', Other: '#f59e0b'
    };
    return colors[prog] || '#6b7280';
  };

  const getActionIcon = (type: string) => {
    const icons: Record<string, typeof Rocket> = {
      scale: Rocket, launch: PlayCircle, stop: StopCircle, optimize: Settings
    };
    return icons[type] || Settings;
  };

  const getActionColor = (type: string) => {
    const colors: Record<string, string> = {
      scale: '#00d4aa', launch: '#3b82f6', stop: '#ef4444', optimize: '#f59e0b'
    };
    return colors[type] || '#6b7280';
  };

  const displayedChecklist = showAllChecklist ? LAUNCH_CHECKLIST : LAUNCH_CHECKLIST.slice(0, 6);

  const renderKPICard = (key: keyof KPIData, label: string, Icon: typeof DollarSign, color: string, prefix = '', suffix = '') => {
    const value = kpiData[key];
    const isEditing = editingKPI === key;
    
    return (
      <div className="stat-card">
        <div className="stat-header">
          <Icon size={22} color={color} />
          <button className="edit-icon" onClick={() => startEditingKPI(key, value)}>
            <Pencil size={12} />
          </button>
        </div>
        {isEditing ? (
          <div className="edit-kpi">
            <input
              type="number"
              value={tempKPIValue}
              onChange={(e) => setTempKPIValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && saveKPIEdit()}
            />
            <button className="save-btn" onClick={saveKPIEdit}>
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div className="stat-value" onClick={() => startEditingKPI(key, value)}>
            {prefix}{formatNumber(value)}{suffix}
          </div>
        )}
        <div className="stat-label">{label}</div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Chargement NEXUS AI...</div>;
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <p className="greeting">Bonjour, CEO</p>
          <h1 className="title">NEXUS AI Dashboard</h1>
        </div>
        <div className="status-badge">
          <span className="status-dot" />
          <span>Live</span>
        </div>
      </header>

      <div className="stats-grid">
        {renderKPICard('revenue', 'Revenue Total', DollarSign, '#00d4aa', '$')}
        {renderKPICard('leads', 'Leads', Users, '#3b82f6')}
        {renderKPICard('subscribers', 'Subscribers', Mail, '#8b5cf6')}
        {renderKPICard('clicks', 'Clicks', MousePointer, '#f59e0b')}
      </div>

      <div className="shopify-card">
        <div className="shopify-header">
          <ShoppingBag size={20} color="#00d4aa" />
          <span>Shopify Revenue</span>
          <button className="edit-icon" onClick={() => startEditingKPI('shopifyRevenue', kpiData.shopifyRevenue)}>
            <Pencil size={12} />
          </button>
        </div>
        {editingKPI === 'shopifyRevenue' ? (
          <div className="edit-kpi large">
            <input
              type="number"
              value={tempKPIValue}
              onChange={(e) => setTempKPIValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && saveKPIEdit()}
            />
            <button className="save-btn" onClick={saveKPIEdit}>
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div className="shopify-value" onClick={() => startEditingKPI('shopifyRevenue', kpiData.shopifyRevenue)}>
            {formatCurrency(kpiData.shopifyRevenue)}
          </div>
        )}
      </div>

      <div className="revenue-section">
        <div className="section-header">
          <Wallet size={22} color="#00d4aa" />
          <h2>Revenue Logger</h2>
          <button className="add-btn" onClick={() => setShowRevenueModal(true)}>
            <Plus size={18} />
          </button>
        </div>

        <div className="target-container">
          <div className="target-header">
            <span>Monthly Target</span>
            {editingTarget ? (
              <div className="edit-target">
                <input
                  type="number"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                  autoFocus
                />
                <button onClick={() => {
                  setMonthlyTarget(parseFloat(tempTarget) || 10000);
                  saveToStorage(MONTHLY_TARGET_KEY, parseFloat(tempTarget) || 10000);
                  setEditingTarget(false);
                }}>
                  <Check size={16} color="#00d4aa" />
                </button>
              </div>
            ) : (
              <button className="target-value" onClick={() => { setTempTarget(monthlyTarget.toString()); setEditingTarget(true); }}>
                {formatCurrency(monthlyTarget)} <Pencil size={12} />
              </button>
            )}
          </div>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${revenueProgress}%` }} />
            </div>
            <span className="progress-text">{revenueProgress.toFixed(0)}%</span>
          </div>
          <div className="revenue-stats">
            <div><span>Logged</span><strong style={{ color: '#00d4aa' }}>{formatCurrency(totalLoggedRevenue)}</strong></div>
            <div><span>Remaining</span><strong style={{ color: '#f59e0b' }}>{formatCurrency(Math.max(0, monthlyTarget - totalLoggedRevenue))}</strong></div>
          </div>
        </div>

        {revenueEntries.length > 0 && (
          <div className="entries-container">
            <button className="entries-toggle" onClick={() => setShowRevenueList(!showRevenueList)}>
              Recent Entries ({revenueEntries.length})
              {showRevenueList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showRevenueList && (
              <div className="entries-list">
                {revenueEntries.slice(0, 10).map(entry => (
                  <div key={entry.id} className="entry-item">
                    <span className="entry-program" style={{ background: `${getProgramColor(entry.program)}20`, color: getProgramColor(entry.program) }}>
                      {entry.program}
                    </span>
                    <div className="entry-details">
                      <strong>{formatCurrency(entry.amount)}</strong>
                      <small>{entry.date}</small>
                      {entry.notes && <em>{entry.notes}</em>}
                    </div>
                    <button onClick={() => deleteRevenueEntry(entry.id)}>
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="checklist-section">
        <div className="checklist-header">
          <div className="checklist-title">
            <Check size={22} color="#00d4aa" />
            <h2>Launch Checklist</h2>
          </div>
          <div className="checklist-progress">
            <div className="mini-progress">
              <div style={{ width: `${checklistProgress}%` }} />
            </div>
            <span>{checklistProgress}%</span>
          </div>
        </div>
        <p className="checklist-subtitle">{checkedItems.length}/{LAUNCH_CHECKLIST.length} tâches complétées</p>

        <div className="checklist-items">
          {displayedChecklist.map(item => {
            const isChecked = checkedItems.includes(item.id);
            return (
              <button
                key={item.id}
                className={`checklist-item ${isChecked ? 'checked' : ''}`}
                onClick={() => toggleCheckItem(item.id)}
              >
                <div className={`checkbox ${isChecked ? 'checked' : ''}`}>
                  {isChecked && <Check size={14} />}
                </div>
                <span className={isChecked ? 'struck' : ''}>{item.text}</span>
                <span className="category-badge" style={{ background: `${getCategoryColor(item.category)}20`, color: getCategoryColor(item.category) }}>
                  {item.category}
                </span>
              </button>
            );
          })}
        </div>

        <button className="show-more" onClick={() => setShowAllChecklist(!showAllChecklist)}>
          {showAllChecklist ? 'Voir moins' : `Voir tout (${LAUNCH_CHECKLIST.length})`}
          {showAllChecklist ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <div className="actions-section">
        <h2>Actions Prioritaires</h2>
        {actions.map(action => {
          const Icon = getActionIcon(action.action_type);
          const color = getActionColor(action.action_type);
          return (
            <div key={action.id} className="action-card">
              <div className="action-icon" style={{ background: `${color}20` }}>
                <Icon size={20} color={color} />
              </div>
              <div className="action-content">
                <strong>{action.title}</strong>
                <p>{action.description}</p>
              </div>
              <span className="priority-badge" data-priority={action.priority}>
                {action.priority.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>

      {showRevenueModal && (
        <div className="modal-overlay" onClick={() => setShowRevenueModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log Affiliate Commission</h3>
              <button onClick={() => setShowRevenueModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newRevenue.date}
                  onChange={e => setNewRevenue({ ...newRevenue, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Program</label>
                <div className="program-buttons">
                  {AFFILIATE_PROGRAMS.map(prog => (
                    <button
                      key={prog}
                      className={newRevenue.program === prog ? 'active' : ''}
                      style={newRevenue.program === prog ? { background: `${getProgramColor(prog)}30`, borderColor: getProgramColor(prog), color: getProgramColor(prog) } : {}}
                      onClick={() => setNewRevenue({ ...newRevenue, program: prog })}
                    >
                      {prog}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Amount ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newRevenue.amount}
                  onChange={e => setNewRevenue({ ...newRevenue, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  placeholder="Add notes..."
                  value={newRevenue.notes}
                  onChange={e => setNewRevenue({ ...newRevenue, notes: e.target.value })}
                />
              </div>
              <button className="submit-btn" onClick={addRevenueEntry}>
                <Plus size={18} /> Log Commission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
