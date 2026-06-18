import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Users, ShoppingCart, AlertTriangle,
  TrendingUp, ArrowRight, Clock, ChevronRight,
} from 'lucide-react';
import { getDashboard, getOrders, getProducts } from '../services/api';

function DashboardSkeleton() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div className="skeleton" style={{ width: 200, height: 28, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 300, height: 16 }} />
      </div>
      <div className="dashboard-stats">
        {[1, 2, 3, 4].map(i => (
          <div className="dash-stat-card" key={i}>
            <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: 56, height: 32, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: 90, height: 14 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="skeleton" style={{ width: 140, height: 20, marginBottom: 20 }} />
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div className="skeleton" style={{ width: '30%', height: 16 }} />
              <div className="skeleton" style={{ width: '25%', height: 16 }} />
              <div className="skeleton" style={{ width: '20%', height: 16 }} />
              <div className="skeleton" style={{ width: '15%', height: 16 }} />
            </div>
          ))}
        </div>
        <div className="dashboard-panel">
          <div className="skeleton" style={{ width: 120, height: 20, marginBottom: 20 }} />
          {[1, 2].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '60%', height: 16, marginBottom: 4 }} />
                <div className="skeleton" style={{ width: '40%', height: 12 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getDashboard(), getOrders(), getProducts()])
      .then(([statsRes, ordersRes, productsRes]) => {
        setStats(statsRes.data);
        const sorted = [...ordersRes.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRecentOrders(sorted.slice(0, 5));
        const lowStock = productsRes.data
          .filter(p => p.quantity_in_stock < 10)
          .sort((a, b) => a.quantity_in_stock - b.quantity_in_stock);
        setLowStockProducts(lowStock.slice(0, 5));
      })
      .catch(err => setError(err.response?.data?.detail || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const statCards = stats ? [
    { key: 'total_products', label: 'Products', icon: Package, color: 'blue', value: stats.total_products },
    { key: 'total_customers', label: 'Customers', icon: Users, color: 'green', value: stats.total_customers },
    { key: 'total_orders', label: 'Orders', icon: ShoppingCart, color: 'violet', value: stats.total_orders },
    { key: 'low_stock_products', label: 'Low Stock', icon: AlertTriangle, color: 'amber', value: stats.low_stock_products },
  ] : [];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{getGreeting()}</h1>
          <p className="dashboard-subtitle">{formatDate(new Date())}</p>
        </div>
      </div>

      {error && (
        <div className="dashboard-error">{error}</div>
      )}

      {/* Stat cards */}
      <div className="dashboard-stats">
        {statCards.map(({ key, label, icon: Icon, color, value }) => (
          <div className={`dash-stat-card dash-stat-${color}`} key={key}>
            <div className={`dash-stat-icon dash-stat-icon-${color}`}>
              <Icon size={22} />
            </div>
            <div className="dash-stat-body">
              <span className="dash-stat-value">{value}</span>
              <span className="dash-stat-label">{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="dashboard-grid">
        {/* Recent Orders */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <Clock size={16} />
              Recent Orders
            </h2>
            <Link to="/orders" className="panel-link">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="panel-empty">
              <ShoppingCart size={32} />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="panel-table">
              <div className="panel-table-header">
                <span>Order</span>
                <span>Customer</span>
                <span>Total</span>
                <span>Date</span>
              </div>
              {recentOrders.map(o => (
                <div className="panel-table-row" key={o.id}>
                  <span className="row-order-id">#{o.id}</span>
                  <span className="row-customer">{o.customer?.full_name || `#${o.customer_id}`}</span>
                  <span className="row-total">${o.total_amount.toFixed(2)}</span>
                  <span className="row-date">{new Date(o.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <AlertTriangle size={16} />
              Low Stock
            </h2>
            <Link to="/products" className="panel-link">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="panel-empty">
              <Package size={32} />
              <p>All products are well stocked</p>
            </div>
          ) : (
            <div className="low-stock-list">
              {lowStockProducts.map(p => (
                <div className="low-stock-item" key={p.id}>
                  <div className="low-stock-info">
                    <span className="low-stock-name">{p.name}</span>
                    <span className="low-stock-sku">{p.sku}</span>
                  </div>
                  <div className="low-stock-qty">
                    <div className="stock-bar">
                      <div
                        className="stock-bar-fill"
                        style={{ width: `${Math.min((p.quantity_in_stock / 10) * 100, 100)}%` }}
                      />
                    </div>
                    <span className={`low-stock-number ${p.quantity_in_stock === 0 ? 'out-of-stock' : ''}`}>
                      {p.quantity_in_stock} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
