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
import { useRouter } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  viral_score: number;
  profit_score: number;
  competition_score: number;
  total_score: number;
  source: string;
  views: number;
  engagement: number;
  market_saturation: string;
  potential_regions: string[];
}

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/trending`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetch(`${API_URL}/api/refresh-products`, { method: 'POST' });
      await fetchProducts();
    } catch (error) {
      console.error('Error refreshing:', error);
    }
    setRefreshing(false);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00d4aa';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getSaturationColor = (saturation: string) => {
    switch (saturation) {
      case 'Low': return '#00d4aa';
      case 'Medium': return '#f59e0b';
      case 'High': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00d4aa" />
          <Text style={styles.loadingText}>Analyse des produits...</Text>
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
          <Text style={styles.title}>Produits Tendances</Text>
          <Text style={styles.subtitle}>Type Minea / Kalodata</Text>
        </View>

        {/* Source Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {['Tous', 'Minea', 'Kalodata', 'PipiAds', 'TikTok'].map((source) => (
            <TouchableOpacity key={source} style={styles.filterChip}>
              <Text style={styles.filterText}>{source}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products List */}
        <View style={styles.productsContainer}>
          {products.map((product, index) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
            >
              {/* Rank Badge */}
              <View style={[styles.rankBadge, index < 3 && styles.topRankBadge]}>
                <Text style={[styles.rankText, index < 3 && styles.topRankText]}>#{index + 1}</Text>
              </View>

              {/* Product Header */}
              <View style={styles.productHeader}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{product.category}</Text>
                  </View>
                </View>
                <View style={[styles.totalScoreBadge, { backgroundColor: `${getScoreColor(product.total_score)}20` }]}>
                  <Text style={[styles.totalScoreText, { color: getScoreColor(product.total_score) }]}>
                    {product.total_score}
                  </Text>
                  <Text style={styles.totalScoreLabel}>/100</Text>
                </View>
              </View>

              {/* Scores */}
              <View style={styles.scoresContainer}>
                <View style={styles.scoreItem}>
                  <View style={styles.scoreHeader}>
                    <Ionicons name="flame" size={14} color="#ef4444" />
                    <Text style={styles.scoreLabel}>Viral</Text>
                  </View>
                  <View style={styles.scoreBarContainer}>
                    <View style={[styles.scoreBar, { width: `${product.viral_score}%`, backgroundColor: '#ef4444' }]} />
                  </View>
                  <Text style={styles.scoreValue}>{product.viral_score}</Text>
                </View>

                <View style={styles.scoreItem}>
                  <View style={styles.scoreHeader}>
                    <Ionicons name="cash" size={14} color="#00d4aa" />
                    <Text style={styles.scoreLabel}>Profit</Text>
                  </View>
                  <View style={styles.scoreBarContainer}>
                    <View style={[styles.scoreBar, { width: `${product.profit_score}%`, backgroundColor: '#00d4aa' }]} />
                  </View>
                  <Text style={styles.scoreValue}>{product.profit_score}</Text>
                </View>

                <View style={styles.scoreItem}>
                  <View style={styles.scoreHeader}>
                    <Ionicons name="people" size={14} color="#3b82f6" />
                    <Text style={styles.scoreLabel}>Compétition</Text>
                  </View>
                  <View style={styles.scoreBarContainer}>
                    <View style={[styles.scoreBar, { width: `${product.competition_score}%`, backgroundColor: '#3b82f6' }]} />
                  </View>
                  <Text style={styles.scoreValue}>{product.competition_score}</Text>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="eye" size={14} color="#6b7280" />
                  <Text style={styles.statText}>{formatNumber(product.views)} vues</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="heart" size={14} color="#6b7280" />
                  <Text style={styles.statText}>{product.engagement}% eng.</Text>
                </View>
                <View style={[styles.saturationBadge, { backgroundColor: `${getSaturationColor(product.market_saturation)}20` }]}>
                  <Text style={[styles.saturationText, { color: getSaturationColor(product.market_saturation) }]}>
                    {product.market_saturation} Saturation
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.productFooter}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Prix</Text>
                  <Text style={styles.priceValue}>{product.price}€</Text>
                </View>
                <View style={styles.sourceContainer}>
                  <Text style={styles.sourceLabel}>Source</Text>
                  <Text style={styles.sourceValue}>{product.source}</Text>
                </View>
                <View style={styles.regionsContainer}>
                  <Text style={styles.regionsLabel}>Régions</Text>
                  <View style={styles.regionsBadges}>
                    {product.potential_regions.slice(0, 2).map((region) => (
                      <View key={region} style={styles.regionBadge}>
                        <Text style={styles.regionText}>{region}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
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
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#12121a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1f1f2e',
  },
  filterText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  productsContainer: {
    paddingHorizontal: 20,
  },
  productCard: {
    backgroundColor: '#12121a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f1f2e',
  },
  rankBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#1f1f2e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topRankBadge: {
    backgroundColor: '#f59e0b',
  },
  rankText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: 'bold',
  },
  topRankText: {
    color: '#000000',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: '#3b82f620',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  categoryText: {
    color: '#3b82f6',
    fontSize: 11,
  },
  totalScoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  totalScoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  totalScoreLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginLeft: 2,
  },
  scoresContainer: {
    marginBottom: 16,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
    gap: 4,
  },
  scoreLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  scoreBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#1f1f2e',
    borderRadius: 3,
    marginHorizontal: 8,
  },
  scoreBar: {
    height: '100%',
    borderRadius: 3,
  },
  scoreValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#6b7280',
    fontSize: 12,
  },
  saturationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  saturationText: {
    fontSize: 11,
    fontWeight: '500',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f1f2e',
  },
  priceContainer: {},
  priceLabel: {
    color: '#6b7280',
    fontSize: 10,
  },
  priceValue: {
    color: '#00d4aa',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sourceContainer: {},
  sourceLabel: {
    color: '#6b7280',
    fontSize: 10,
  },
  sourceValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  regionsContainer: {},
  regionsLabel: {
    color: '#6b7280',
    fontSize: 10,
  },
  regionsBadges: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  regionBadge: {
    backgroundColor: '#1f1f2e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  regionText: {
    color: '#9ca3af',
    fontSize: 10,
  },
  bottomPadding: {
    height: 20,
  },
});
