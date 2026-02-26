import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface AdScript {
  id: string;
  product_id: string;
  concept_type: string;
  hook: string;
  script: string;
  voiceover: string;
  scenes: string[];
  captions: string[];
  hashtags: string[];
  cta: string;
  platform: string;
}

export default function AdsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<AdScript | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState('Problem Solution');
  const [selectedPlatform, setSelectedPlatform] = useState('TikTok');
  const [loading, setLoading] = useState(true);

  const concepts = ['Problem Solution', 'Lifestyle', 'Demonstration'];
  const platforms = ['TikTok', 'Meta', 'Instagram'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/trending`);
      const data = await response.json();
      setProducts(data.slice(0, 6)); // Top 6 products
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateScript = async () => {
    if (!selectedProduct) {
      Alert.alert('Erreur', 'Sélectionnez un produit');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch(`${API_URL}/api/ads/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: selectedProduct.name,
          product_category: selectedProduct.category,
          product_price: selectedProduct.price,
          concept_type: selectedConcept,
          platform: selectedPlatform,
        }),
      });

      const data = await response.json();
      setGeneratedScript(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error generating script:', error);
      Alert.alert('Erreur', 'Impossible de générer le script');
    } finally {
      setGenerating(false);
    }
  };

  const getConceptIcon = (concept: string) => {
    switch (concept) {
      case 'Problem Solution': return 'bulb';
      case 'Lifestyle': return 'heart';
      case 'Demonstration': return 'videocam';
      default: return 'ellipse';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'TikTok': return 'musical-notes';
      case 'Meta': return 'logo-facebook';
      case 'Instagram': return 'logo-instagram';
      default: return 'ellipse';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00d4aa" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Générateur de Publicités</Text>
          <Text style={styles.subtitle}>Créez des ads virales avec l'IA</Text>
        </View>

        {/* Product Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Sélectionnez un produit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.productChip,
                  selectedProduct?.id === product.id && styles.productChipSelected,
                ]}
                onPress={() => setSelectedProduct(product)}
              >
                <Text
                  style={[
                    styles.productChipText,
                    selectedProduct?.id === product.id && styles.productChipTextSelected,
                  ]}
                >
                  {product.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Concept Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Type de concept</Text>
          <View style={styles.optionsGrid}>
            {concepts.map((concept) => (
              <TouchableOpacity
                key={concept}
                style={[
                  styles.optionCard,
                  selectedConcept === concept && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedConcept(concept)}
              >
                <Ionicons
                  name={getConceptIcon(concept) as any}
                  size={24}
                  color={selectedConcept === concept ? '#00d4aa' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedConcept === concept && styles.optionTextSelected,
                  ]}
                >
                  {concept}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Platform Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Plateforme</Text>
          <View style={styles.optionsGrid}>
            {platforms.map((platform) => (
              <TouchableOpacity
                key={platform}
                style={[
                  styles.optionCard,
                  selectedPlatform === platform && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedPlatform(platform)}
              >
                <Ionicons
                  name={getPlatformIcon(platform) as any}
                  size={24}
                  color={selectedPlatform === platform ? '#00d4aa' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedPlatform === platform && styles.optionTextSelected,
                  ]}
                >
                  {platform}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generate Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.generateButton, generating && styles.generateButtonDisabled]}
            onPress={generateScript}
            disabled={generating || !selectedProduct}
          >
            {generating ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#000000" />
                <Text style={styles.generateButtonText}>Générer le Script</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Generated Script Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Script Généré</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {generatedScript && (
              <ScrollView style={styles.modalScrollView}>
                {/* Hook */}
                <View style={styles.scriptSection}>
                  <View style={styles.scriptSectionHeader}>
                    <Ionicons name="flash" size={18} color="#f59e0b" />
                    <Text style={styles.scriptSectionTitle}>Hook (3 sec)</Text>
                  </View>
                  <Text style={styles.hookText}>{generatedScript.hook}</Text>
                </View>

                {/* Script */}
                <View style={styles.scriptSection}>
                  <View style={styles.scriptSectionHeader}>
                    <Ionicons name="document-text" size={18} color="#3b82f6" />
                    <Text style={styles.scriptSectionTitle}>Script</Text>
                  </View>
                  <Text style={styles.scriptText}>{generatedScript.script}</Text>
                </View>

                {/* Voiceover */}
                <View style={styles.scriptSection}>
                  <View style={styles.scriptSectionHeader}>
                    <Ionicons name="mic" size={18} color="#8b5cf6" />
                    <Text style={styles.scriptSectionTitle}>Voix Off</Text>
                  </View>
                  <Text style={styles.scriptText}>{generatedScript.voiceover}</Text>
                </View>

                {/* Scenes */}
                <View style={styles.scriptSection}>
                  <View style={styles.scriptSectionHeader}>
                    <Ionicons name="film" size={18} color="#00d4aa" />
                    <Text style={styles.scriptSectionTitle}>Scènes</Text>
                  </View>
                  {generatedScript.scenes.map((scene, index) => (
                    <View key={index} style={styles.sceneItem}>
                      <Text style={styles.sceneNumber}>{index + 1}</Text>
                      <Text style={styles.sceneText}>{scene}</Text>
                    </View>
                  ))}
                </View>

                {/* Captions */}
                <View style={styles.scriptSection}>
                  <View style={styles.scriptSectionHeader}>
                    <Ionicons name="text" size={18} color="#ec4899" />
                    <Text style={styles.scriptSectionTitle}>Captions</Text>
                  </View>
                  {generatedScript.captions.map((caption, index) => (
                    <Text key={index} style={styles.captionText}>"{caption}"</Text>
                  ))}
                </View>

                {/* Hashtags */}
                <View style={styles.scriptSection}>
                  <View style={styles.scriptSectionHeader}>
                    <Ionicons name="pricetag" size={18} color="#14b8a6" />
                    <Text style={styles.scriptSectionTitle}>Hashtags</Text>
                  </View>
                  <View style={styles.hashtagsContainer}>
                    {generatedScript.hashtags.map((tag, index) => (
                      <View key={index} style={styles.hashtagBadge}>
                        <Text style={styles.hashtagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* CTA */}
                <View style={styles.scriptSection}>
                  <View style={styles.scriptSectionHeader}>
                    <Ionicons name="megaphone" size={18} color="#ef4444" />
                    <Text style={styles.scriptSectionTitle}>CTA</Text>
                  </View>
                  <Text style={styles.ctaText}>{generatedScript.cta}</Text>
                </View>

                <View style={styles.modalBottomPadding} />
              </ScrollView>
            )}
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
  productChip: {
    backgroundColor: '#12121a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#1f1f2e',
  },
  productChipSelected: {
    backgroundColor: '#00d4aa20',
    borderColor: '#00d4aa',
  },
  productChipText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  productChipTextSelected: {
    color: '#00d4aa',
    fontWeight: '600',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#12121a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f1f2e',
  },
  optionCardSelected: {
    backgroundColor: '#00d4aa15',
    borderColor: '#00d4aa',
  },
  optionText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#00d4aa',
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#00d4aa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#12121a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
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
  modalScrollView: {
    paddingHorizontal: 20,
  },
  scriptSection: {
    marginTop: 20,
  },
  scriptSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  scriptSectionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  hookText: {
    color: '#f59e0b',
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  scriptText: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 22,
  },
  sceneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sceneNumber: {
    color: '#00d4aa',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#00d4aa20',
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
    borderRadius: 12,
    marginRight: 10,
  },
  sceneText: {
    color: '#d1d5db',
    fontSize: 13,
    flex: 1,
  },
  captionText: {
    color: '#ec4899',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtagBadge: {
    backgroundColor: '#14b8a620',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hashtagText: {
    color: '#14b8a6',
    fontSize: 13,
  },
  ctaText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBottomPadding: {
    height: 40,
  },
});
