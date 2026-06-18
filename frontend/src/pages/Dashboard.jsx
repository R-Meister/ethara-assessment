import { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react';
import { getDashboard } from '../services/api';

const statConfigs = [
  { key: 'total_products', label: 'Total Products', icon: Package, color: 'blue' },
  { key: 'total_customers', label: 'Total Customers', icon: Users, color: 'green' },
  { key: 'total_orders', label: 'Total Orders', icon: ShoppingCart, color: 'orange' },
  { key: 'low_stock_products', label: 'Low Stock', icon: AlertTriangle, color: 'red' },
];

function StatSkeleton() {
  return (
    <div className="stat-card">
      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)' }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: 48, height: 28, marginBottom: 4 }} />
        <div className="skeleton" style={{ width: 80, height: 14 }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboard()
      .then(res => setStats(res.data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to load dashboard'));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {error && (
        <div className="card" style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }}>
          {error}
        </div>
      )}

      <div className="stats-grid">
        {!stats
          ? statConfigs.map(s => <StatSkeleton key={s.key} />)
          : statConfigs.map(({ key, label, icon: Icon, color }) => (
              <div className="stat-card" key={key}>
                <div className={`stat-icon ${color}`}>
                  <Icon />
                </div>
                <div className="stat-info">
                  <h3>{stats[key]}</h3>
                  <p>{label}</p>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}
