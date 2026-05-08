import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, DollarSign, Users, Eye, Heart, Gauge, MapPin, BarChart3, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import type { Product } from '../types';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await api.getProduct(id!);
      setProduct(data);
    } catch (error) {
      console.error('Error:', error);
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

  if (loading) return <div className="loading">Chargement...</div>;
  if (!product) return <div className="loading">Produit non trouvé</div>;

  const profitMargin = ((product.price - product.cost) / product.price) * 100;

  return (
    <div className="product-detail">
      <header className="detail-header">
        <button className="back-btn" onClick={() => navigate('/products')}>
          <ArrowLeft size={24} />
        </button>
        <h1>Détails Produit</h1>
        <div style={{ width: 40 }} />
      </header>

      <div className="product-hero">
        <div className="hero-content">
          <h2>{product.name}</h2>
          <span className="category">{product.category}</span>
        </div>
        <div className="score-circle" style={{ borderColor: getScoreColor(product.total_score) }}>
          <span style={{ color: getScoreColor(product.total_score) }}>{product.total_score}</span>
          <small>Score</small>
        </div>
      </div>

      <section className="section">
        <h3>Analyse Prix</h3>
        <div className="price-grid">
          <div className="price-card"><small>Prix de vente</small><strong>{product.price}€</strong></div>
          <div className="price-card"><small>Coût produit</small><strong style={{ color: '#ef4444' }}>{product.cost}€</strong></div>
          <div className="price-card"><small>Marge</small><strong style={{ color: '#f59e0b' }}>{profitMargin.toFixed(1)}%</strong></div>
          <div className="price-card"><small>Profit/unité</small><strong style={{ color: '#00d4aa' }}>{(product.price - product.cost).toFixed(2)}€</strong></div>
        </div>
      </section>

      <section className="section">
        <h3>Scores Détaillés</h3>
        
        <div className="score-detail">
          <div className="score-header">
            <TrendingUp size={20} color="#ef4444" />
            <span>Viral Score</span>
            <strong style={{ color: '#ef4444' }}>{product.viral_score}/100</strong>
          </div>
          <div className="score-bar-full"><div style={{ width: `${product.viral_score}%`, background: '#ef4444' }} /></div>
          <p>Potentiel de viralité sur les réseaux sociaux.</p>
        </div>

        <div className="score-detail">
          <div className="score-header">
            <DollarSign size={20} color="#00d4aa" />
            <span>Profit Score</span>
            <strong style={{ color: '#00d4aa' }}>{product.profit_score}/100</strong>
          </div>
          <div className="score-bar-full"><div style={{ width: `${product.profit_score}%`, background: '#00d4aa' }} /></div>
          <p>Rentabilité estimée basée sur les marges.</p>
        </div>

        <div className="score-detail">
          <div className="score-header">
            <Users size={20} color="#3b82f6" />
            <span>Competition Score</span>
            <strong style={{ color: '#3b82f6' }}>{product.competition_score}/100</strong>
          </div>
          <div className="score-bar-full"><div style={{ width: `${product.competition_score}%`, background: '#3b82f6' }} /></div>
          <p>Niveau de concurrence sur le marché.</p>
        </div>
      </section>

      <section className="section">
        <h3>Analyse Marché</h3>
        <div className="market-grid">
          <div className="market-card">
            <Eye size={24} color="#8b5cf6" />
            <strong>{formatNumber(product.views)}</strong>
            <small>Vues pub</small>
          </div>
          <div className="market-card">
            <Heart size={24} color="#ec4899" />
            <strong>{product.engagement}%</strong>
            <small>Engagement</small>
          </div>
          <div className="market-card">
            <Gauge size={24} color="#f59e0b" />
            <strong>{product.market_saturation}</strong>
            <small>Saturation</small>
          </div>
        </div>
      </section>

      <section className="section">
        <h3>Régions Potentielles</h3>
        <div className="regions-list">
          {product.potential_regions.map(region => (
            <span key={region} className="region-badge">
              <MapPin size={16} /> {region}
            </span>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="source-card">
          <BarChart3 size={20} color="#6b7280" />
          <div>
            <small>Source données</small>
            <strong>{product.source}</strong>
          </div>
        </div>
      </section>

      <button className="action-btn" onClick={() => navigate('/ads')}>
        <Sparkles size={20} /> Générer des Ads pour ce produit
      </button>
    </div>
  );
}
