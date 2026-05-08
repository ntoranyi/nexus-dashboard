import { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, Heart, Video, Loader2, X, Film, Mic, Type, Hash, Megaphone } from 'lucide-react';
import { api } from '../lib/api';
import type { Product, AdScript } from '../types';
import './Ads.css';

const CONCEPTS = [
  { id: 'Problem Solution', icon: Lightbulb },
  { id: 'Lifestyle', icon: Heart },
  { id: 'Demonstration', icon: Video },
];

const PLATFORMS = [
  { id: 'TikTok', icon: '🎵' },
  { id: 'Meta', icon: '📱' },
  { id: 'Instagram', icon: '📷' },
];

export default function Ads() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedConcept, setSelectedConcept] = useState('Problem Solution');
  const [selectedPlatform, setSelectedPlatform] = useState('TikTok');
  const [generating, setGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<AdScript | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.getTrendingProducts();
      setProducts(data.slice(0, 6));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateScript = async () => {
    if (!selectedProduct) return;
    setGenerating(true);
    try {
      const data = await api.generateAdScript({
        product_name: selectedProduct.name,
        product_category: selectedProduct.category,
        product_price: selectedProduct.price,
        concept_type: selectedConcept,
        platform: selectedPlatform,
      });
      setGeneratedScript(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="ads-page">
      <header className="header">
        <h1>Générateur de Publicités</h1>
        <p>Créez des ads virales avec l'IA</p>
      </header>

      <section className="form-section">
        <h3>1. Sélectionnez un produit</h3>
        <div className="product-chips">
          {products.map(product => (
            <button
              key={product.id}
              className={`product-chip ${selectedProduct?.id === product.id ? 'selected' : ''}`}
              onClick={() => setSelectedProduct(product)}
            >
              {product.name}
            </button>
          ))}
        </div>
      </section>

      <section className="form-section">
        <h3>2. Type de concept</h3>
        <div className="options-grid">
          {CONCEPTS.map(concept => {
            const Icon = concept.icon;
            return (
              <button
                key={concept.id}
                className={`option-card ${selectedConcept === concept.id ? 'selected' : ''}`}
                onClick={() => setSelectedConcept(concept.id)}
              >
                <Icon size={24} />
                <span>{concept.id}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="form-section">
        <h3>3. Plateforme</h3>
        <div className="options-grid">
          {PLATFORMS.map(platform => (
            <button
              key={platform.id}
              className={`option-card ${selectedPlatform === platform.id ? 'selected' : ''}`}
              onClick={() => setSelectedPlatform(platform.id)}
            >
              <span className="platform-icon">{platform.icon}</span>
              <span>{platform.id}</span>
            </button>
          ))}
        </div>
      </section>

      <button
        className="generate-btn"
        onClick={generateScript}
        disabled={generating || !selectedProduct}
      >
        {generating ? (
          <><Loader2 size={20} className="spinning" /> Génération en cours...</>
        ) : (
          <><Sparkles size={20} /> Générer le Script</>
        )}
      </button>

      {showModal && generatedScript && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Script Généré</h3>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <div className="modal-body">
              <div className="script-section">
                <div className="section-label"><Sparkles size={18} color="#f59e0b" /> Hook (3 sec)</div>
                <p className="hook-text">{generatedScript.hook}</p>
              </div>

              <div className="script-section">
                <div className="section-label"><Type size={18} color="#3b82f6" /> Script</div>
                <p>{generatedScript.script}</p>
              </div>

              <div className="script-section">
                <div className="section-label"><Mic size={18} color="#8b5cf6" /> Voix Off</div>
                <p>{generatedScript.voiceover}</p>
              </div>

              <div className="script-section">
                <div className="section-label"><Film size={18} color="#00d4aa" /> Scènes</div>
                <div className="scenes-list">
                  {generatedScript.scenes.map((scene, i) => (
                    <div key={i} className="scene-item">
                      <span className="scene-num">{i + 1}</span>
                      <span>{scene}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="script-section">
                <div className="section-label"><Type size={18} color="#ec4899" /> Captions</div>
                {generatedScript.captions.map((caption, i) => (
                  <p key={i} className="caption">"{caption}"</p>
                ))}
              </div>

              <div className="script-section">
                <div className="section-label"><Hash size={18} color="#14b8a6" /> Hashtags</div>
                <div className="hashtags">
                  {generatedScript.hashtags.map((tag, i) => (
                    <span key={i} className="hashtag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="script-section">
                <div className="section-label"><Megaphone size={18} color="#ef4444" /> CTA</div>
                <p className="cta-text">{generatedScript.cta}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
