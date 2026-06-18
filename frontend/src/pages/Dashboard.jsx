import { useState, useEffect } from 'react';
import { getDashboard } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboard().then(res => setStats(res.data));
  }, []);

  if (!stats) return <div className="empty-state">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📦</div>
          <div className="stat-info">
            <h3>{stats.total_products}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">👥</div>
          <div className="stat-info">
            <h3>{stats.total_customers}</h3>
            <p>Total Customers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🛒</div>
          <div className="stat-info">
            <h3>{stats.total_orders}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">⚠️</div>
          <div className="stat-info">
            <h3>{stats.low_stock_products}</h3>
            <p>Low Stock Products</p>
          </div>
        </div>
      </div>
    </div>
  );
}
