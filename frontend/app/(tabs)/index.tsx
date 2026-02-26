import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface DashboardStats {
  total_sales: number;
  conversion_rate: number;
  active_products: number;
  winning_ads: number;
  daily_revenue: number;
  monthly_revenue: number;
  top_product: string;
  alerts: string[];
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

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [actions, setActions] = useState<DailyAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, actionsRes] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/stats`),
        fetch(`${API_URL}/api/dashboard/actions`),
      ]);
      
      const statsData = await statsRes.json();
      const actionsData = await actionsRes.json();
      
      setStats(statsData);
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
    setRefreshing(false);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
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

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <Ionicons name="cash" size={24} color="#00d4aa" />
            <Text style={styles.statValue}>{formatCurrency(stats?.monthly_revenue || 0)}</Text>
            <Text style={styles.statLabel}>Revenu Mensuel</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#3b82f6" />
            <Text style={styles.statValue}>{stats?.conversion_rate || 0}%</Text>
            <Text style={styles.statLabel}>Taux Conversion</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cube" size={24} color="#f59e0b" />
            <Text style={styles.statValue}>{stats?.active_products || 0}</Text>
            <Text style={styles.statLabel}>Produits Actifs</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#ef4444" />
            <Text style={styles.statValue}>{stats?.winning_ads || 0}</Text>
            <Text style={styles.statLabel}>Winning Ads</Text>
          </View>
        </View>

        {/* Top Product */}
        {stats?.top_product && (
          <View style={styles.topProductCard}>
            <View style={styles.topProductHeader}>
              <Ionicons name="trophy" size={20} color="#f59e0b" />
              <Text style={styles.topProductTitle}>Top Produit</Text>
            </View>
            <Text style={styles.topProductName}>{stats.top_product}</Text>
            <Text style={styles.topProductRevenue}>
              Revenu Jour: {formatCurrency(stats.daily_revenue)}
            </Text>
          </View>
        )}

        {/* Alerts */}
        {stats?.alerts && stats.alerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Alertes</Text>
            {stats.alerts.map((alert, index) => (
              <View key={index} style={styles.alertCard}>
                <Ionicons name="warning" size={18} color="#f59e0b" />
                <Text style={styles.alertText}>{alert}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Daily Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions Prioritaires du Jour</Text>
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
              {action.recommended_budget && (
                <View style={styles.actionFooter}>
                  <Ionicons name="wallet" size={14} color="#6b7280" />
                  <Text style={styles.budgetText}>Budget recommandé: {formatCurrency(action.recommended_budget)}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
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
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f1f2e',
  },
  statCardPrimary: {
    borderColor: '#00d4aa40',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  topProductCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#12121a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f59e0b40',
  },
  topProductHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topProductTitle: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '600',
  },
  topProductName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  topProductRevenue: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
  alertsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b10',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f59e0b30',
    gap: 10,
  },
  alertText: {
    color: '#f59e0b',
    fontSize: 13,
    flex: 1,
  },
  actionsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  actionCard: {
    backgroundColor: '#12121a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f1f2e',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  actionDescription: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f1f2e',
    gap: 6,
  },
  budgetText: {
    color: '#6b7280',
    fontSize: 12,
  },
  bottomPadding: {
    height: 20,
  },
});
