import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Eye, Heart, TrendingUp, DollarSign, Users } from 'lucide-react';
import { api } from '../lib/api';
import type { Product } from '../types';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.getTrendingProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.refreshProducts();
      await fetchProducts();
    } catch (error) {
      console.error('Error refreshing:', error);
    }
    setRefreshing(false);
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

  const getSaturationColor = (sat: string) => {
    const colors: Record<string, string> = { Low: '#00d4aa', Medium: '#f59e0b', High: '#ef4444' };
    return colors[sat] || '#6b7280';
  };

  if (loading) {
    return <div className="loading">Analyse des produits...</div>;
  }

  return (
    <div className="products-page">
      <header className="header">
        <div>
          <h1>Produits Tendances</h1>
          <p>Type Minea / Kalodata</p>
        </div>
        <button className={`refresh-btn ${refreshing ? 'spinning' : ''}`} onClick={handleRefresh}>
          <RefreshCw size={20} />
        </button>
      </header>

      <div className="filters">
        {['Tous', 'Minea', 'Kalodata', 'PipiAds', 'TikTok'].map(source => (
          <button key={source} className="filter-chip">{source}</button>
        ))}
      </div>

      <div className="products-list">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => navigate(`/products/${product.id}`)}
          >
            <div className={`rank-badge ${index < 3 ? 'top' : ''}`}>#{index + 1}</div>

            <div className="product-header">
              <div className="product-info">
                <h3>{product.name}</h3>
                <span className="category-badge">{product.category}</span>
              </div>
              <div className="total-score" style={{ background: `${getScoreColor(product.total_score)}20`, borderColor: getScoreColor(product.total_score) }}>
                <span style={{ color: getScoreColor(product.total_score) }}>{product.total_score}</span>
                <small>/100</small>
              </div>
            </div>

            <div className="scores">
              <div className="score-item">
                <div className="score-label"><TrendingUp size={14} color="#ef4444" /> Viral</div>
                <div className="score-bar"><div style={{ width: `${product.viral_score}%`, background: '#ef4444' }} /></div>
                <span>{product.viral_score}</span>
              </div>
              <div className="score-item">
                <div className="score-label"><DollarSign size={14} color="#00d4aa" /> Profit</div>
                <div className="score-bar"><div style={{ width: `${product.profit_score}%`, background: '#00d4aa' }} /></div>
                <span>{product.profit_score}</span>
              </div>
              <div className="score-item">
                <div className="score-label"><Users size={14} color="#3b82f6" /> Compétition</div>
                <div className="score-bar"><div style={{ width: `${product.competition_score}%`, background: '#3b82f6' }} /></div>
                <span>{product.competition_score}</span>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat"><Eye size={14} /> {formatNumber(product.views)} vues</div>
              <div className="stat"><Heart size={14} /> {product.engagement}% eng.</div>
              <span className="saturation" style={{ background: `${getSaturationColor(product.market_saturation)}20`, color: getSaturationColor(product.market_saturation) }}>
                {product.market_saturation} Saturation
              </span>
            </div>

            <div className="product-footer">
              <div><small>Prix</small><strong style={{ color: '#00d4aa' }}>{product.price}€</strong></div>
              <div><small>Source</small><strong>{product.source}</strong></div>
              <div>
                <small>Régions</small>
                <div className="regions">
                  {product.potential_regions.slice(0, 2).map(r => <span key={r}>{r}</span>)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
