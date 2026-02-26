import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
  trending_since: string;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00d4aa" />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Produit non trouvé</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const profitMargin = ((product.price - product.cost) / product.price) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails Produit</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Product Name and Score */}
        <View style={styles.productHeader}>
          <View style={styles.productNameContainer}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
          </View>
          <View style={[styles.totalScoreCircle, { borderColor: getScoreColor(product.total_score) }]}>
            <Text style={[styles.totalScoreValue, { color: getScoreColor(product.total_score) }]}>
              {product.total_score}
            </Text>
            <Text style={styles.totalScoreLabel}>Score</Text>
          </View>
        </View>

        {/* Price Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyse Prix</Text>
          <View style={styles.priceGrid}>
            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>Prix de vente</Text>
              <Text style={styles.priceValue}>{product.price}€</Text>
            </View>
            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>Coût produit</Text>
              <Text style={styles.costValue}>{product.cost}€</Text>
            </View>
            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>Marge</Text>
              <Text style={styles.marginValue}>{profitMargin.toFixed(1)}%</Text>
            </View>
            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>Profit/unité</Text>
              <Text style={styles.profitValue}>{(product.price - product.cost).toFixed(2)}€</Text>
            </View>
          </View>
        </View>

        {/* Scores Detail */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scores Détaillés</Text>
          
          <View style={styles.scoreDetailCard}>
            <View style={styles.scoreDetailHeader}>
              <Ionicons name="flame" size={20} color="#ef4444" />
              <Text style={styles.scoreDetailTitle}>Viral Score</Text>
              <Text style={[styles.scoreDetailValue, { color: '#ef4444' }]}>{product.viral_score}/100</Text>
            </View>
            <View style={styles.scoreBarFull}>
              <View style={[styles.scoreBarFill, { width: `${product.viral_score}%`, backgroundColor: '#ef4444' }]} />
            </View>
            <Text style={styles.scoreDescription}>
              Potentiel de viralité sur les réseaux sociaux basé sur l'engagement et les tendances.
            </Text>
          </View>

          <View style={styles.scoreDetailCard}>
            <View style={styles.scoreDetailHeader}>
              <Ionicons name="cash" size={20} color="#00d4aa" />
              <Text style={styles.scoreDetailTitle}>Profit Score</Text>
              <Text style={[styles.scoreDetailValue, { color: '#00d4aa' }]}>{product.profit_score}/100</Text>
            </View>
            <View style={styles.scoreBarFull}>
              <View style={[styles.scoreBarFill, { width: `${product.profit_score}%`, backgroundColor: '#00d4aa' }]} />
            </View>
            <Text style={styles.scoreDescription}>
              Rentabilité estimée basée sur les marges et le volume potentiel de ventes.
            </Text>
          </View>

          <View style={styles.scoreDetailCard}>
            <View style={styles.scoreDetailHeader}>
              <Ionicons name="people" size={20} color="#3b82f6" />
              <Text style={styles.scoreDetailTitle}>Competition Score</Text>
              <Text style={[styles.scoreDetailValue, { color: '#3b82f6' }]}>{product.competition_score}/100</Text>
            </View>
            <View style={styles.scoreBarFull}>
              <View style={[styles.scoreBarFill, { width: `${product.competition_score}%`, backgroundColor: '#3b82f6' }]} />
            </View>
            <Text style={styles.scoreDescription}>
              Niveau de concurrence sur le marché. Plus bas = moins de concurrents.
            </Text>
          </View>
        </View>

        {/* Market Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyse Marché</Text>
          <View style={styles.marketGrid}>
            <View style={styles.marketCard}>
              <Ionicons name="eye" size={24} color="#8b5cf6" />
              <Text style={styles.marketValue}>{formatNumber(product.views)}</Text>
              <Text style={styles.marketLabel}>Vues pub</Text>
            </View>
            <View style={styles.marketCard}>
              <Ionicons name="heart" size={24} color="#ec4899" />
              <Text style={styles.marketValue}>{product.engagement}%</Text>
              <Text style={styles.marketLabel}>Engagement</Text>
            </View>
            <View style={styles.marketCard}>
              <Ionicons name="speedometer" size={24} color="#f59e0b" />
              <Text style={styles.marketValue}>{product.market_saturation}</Text>
              <Text style={styles.marketLabel}>Saturation</Text>
            </View>
          </View>
        </View>

        {/* Regions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Régions Potentielles</Text>
          <View style={styles.regionsContainer}>
            {product.potential_regions.map((region) => (
              <View key={region} style={styles.regionBadgeLarge}>
                <Ionicons name="location" size={16} color="#00d4aa" />
                <Text style={styles.regionTextLarge}>{region}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Source Info */}
        <View style={styles.section}>
          <View style={styles.sourceCard}>
            <Ionicons name="analytics" size={20} color="#6b7280" />
            <View style={styles.sourceInfo}>
              <Text style={styles.sourceLabel}>Source données</Text>
              <Text style={styles.sourceValue}>{product.source}</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/ads')}
          >
            <Ionicons name="sparkles" size={20} color="#000000" />
            <Text style={styles.actionButtonText}>Générer des Ads pour ce produit</Text>
          </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#1f1f2e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f2e',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
  },
  productNameContainer: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  categoryBadge: {
    backgroundColor: '#3b82f620',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  categoryText: {
    color: '#3b82f6',
    fontSize: 12,
  },
  totalScoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#12121a',
  },
  totalScoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  totalScoreLabel: {
    color: '#6b7280',
    fontSize: 10,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  priceCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#12121a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f1f2e',
  },
  priceLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  priceValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  costValue: {
    color: '#ef4444',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  marginValue: {
    color: '#f59e0b',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  profitValue: {
    color: '#00d4aa',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  scoreDetailCard: {
    backgroundColor: '#12121a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f1f2e',
  },
  scoreDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreDetailTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  scoreDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreBarFull: {
    height: 8,
    backgroundColor: '#1f1f2e',
    borderRadius: 4,
    marginBottom: 10,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreDescription: {
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 18,
  },
  marketGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  marketCard: {
    flex: 1,
    backgroundColor: '#12121a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f1f2e',
  },
  marketValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  marketLabel: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 4,
  },
  regionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  regionBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00d4aa15',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  regionTextLarge: {
    color: '#00d4aa',
    fontSize: 14,
    fontWeight: '500',
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f1f2e',
  },
  sourceInfo: {
    marginLeft: 12,
  },
  sourceLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  sourceValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#00d4aa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 40,
  },
});
