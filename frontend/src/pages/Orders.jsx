import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShoppingCart, Plus, Eye, Trash2, Search, X,
  DollarSign, TrendingUp, Calendar,
} from 'lucide-react';
import { getOrders, getOrder, createOrder, deleteOrder, getProducts, getCustomers } from '../services/api';
import { toast } from 'react-toastify';

const emptyForm = { customer_id: '', items: [{ product_id: '', quantity: 1 }] };

function getCustomerName(order, customers) {
  if (order.customer?.full_name) return order.customer.full_name;
  const c = customers.find(c => c.id === order.customer_id);
  return c ? c.full_name : `Customer #${order.customer_id}`;
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(name) {
  const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function TableSkeleton({ rows = 5 }) {
  return (
    <div className="orders-table-wrap">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td><div className="skeleton" style={{ width: 36, height: 16 }} /></td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 'var(--radius-pill)' }} />
                  <div className="skeleton" style={{ width: '45%', height: 16 }} />
                </div>
              </td>
              <td><div className="skeleton" style={{ width: 20, height: 16 }} /></td>
              <td><div className="skeleton" style={{ width: 56, height: 16 }} /></td>
              <td><div className="skeleton" style={{ width: 56, height: 22, borderRadius: 'var(--radius-pill)' }} /></td>
              <td><div className="skeleton" style={{ width: 72, height: 16 }} /></td>
              <td><div className="skeleton" style={{ width: 56, height: 16 }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CancelModal({ orderId, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Cancel order">
        <div className="delete-modal-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
          <Trash2 size={24} />
        </div>
        <h2>Cancel order?</h2>
        <p className="delete-modal-desc">
          Order <strong>#{orderId}</strong> will be cancelled and stock will be restored. This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Keep Order</button>
          <button className="btn btn-danger" onClick={onConfirm}>Cancel Order</button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, customers, products, onClose }) {
  const customerName = getCustomerName(order, customers);

  const getProductName = (id) => {
    const p = products.find(p => p.id === id);
    return p ? p.name : `Product #${id}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Order ${order.id} details`}>
        <div className="order-detail-header">
          <div>
            <h2>Order #{order.id}</h2>
            <p className="order-detail-date">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <span className="order-status-badge">{order.status}</span>
        </div>

        <div className="order-detail-customer">
          <div className="customer-avatar" style={{ background: avatarColor(customerName) }}>
            {getInitials(customerName)}
          </div>
          <div>
            <span className="order-detail-customer-name">{customerName}</span>
            <span className="order-detail-customer-id">Customer #{order.customer_id}</span>
          </div>
        </div>

        <div className="order-detail-items">
          <table className="order-detail-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map(item => (
                <tr key={item.id}>
                  <td className="order-detail-product">{item.product?.name || getProductName(item.product_id)}</td>
                  <td>{item.quantity}</td>
                  <td className="order-detail-money">${item.unit_price.toFixed(2)}</td>
                  <td className="order-detail-money">${(item.unit_price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="order-detail-total">
          <span>Total</span>
          <span className="order-detail-total-value">${order.total_amount.toFixed(2)}</span>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getOrders(), getProducts(), getCustomers()])
      .then(([ordersRes, productsRes, customersRes]) => {
        setOrders(ordersRes.data);
        setProducts(productsRes.data);
        setCustomers(customersRes.data);
      })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(o => {
      const name = getCustomerName(o, customers).toLowerCase();
      const id = String(o.id);
      return name.includes(q) || id.includes(q);
    });
  }, [orders, customers, search]);

  const stats = useMemo(() => {
    const total = orders.length;
    const revenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const avg = total > 0 ? revenue / total : 0;
    const totalItems = orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);
    return { total, revenue, avg, totalItems };
  }, [orders]);

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1 }] });
  };

  const removeItem = (index) => {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    setForm({ ...form, items });
  };

  const orderTotal = useMemo(() => {
    return form.items.reduce((sum, item) => {
      const product = products.find(p => p.id === parseInt(item.product_id));
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  }, [form.items, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        customer_id: parseInt(form.customer_id, 10),
        items: form.items.map(i => ({
          product_id: parseInt(i.product_id, 10),
          quantity: parseInt(i.quantity, 10),
        })),
      };
      await createOrder(data);
      toast.success('Order created');
      setShowModal(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = async (id) => {
    try {
      const res = await getOrder(id);
      setSelectedOrder(res.data);
    } catch {
      toast.error('Failed to load order details');
    }
  };

  const handleDelete = async () => {
    if (!cancelTarget) return;
    try {
      await deleteOrder(cancelTarget.id);
      toast.success('Order cancelled');
      setCancelTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel');
    }
  };

  return (
    <div className="orders-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p className="page-header-sub">Track and manage customer orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Create Order
        </button>
      </div>

      {/* Stats strip */}
      {!loading && orders.length > 0 && (
        <div className="orders-stats">
          <div className="orders-stat">
            <div className="orders-stat-icon orders-stat-icon-blue">
              <ShoppingCart size={18} />
            </div>
            <div className="orders-stat-body">
              <span className="orders-stat-value">{stats.total}</span>
              <span className="orders-stat-label">Orders</span>
            </div>
          </div>
          <div className="orders-stat">
            <div className="orders-stat-icon orders-stat-icon-green">
              <DollarSign size={18} />
            </div>
            <div className="orders-stat-body">
              <span className="orders-stat-value">${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              <span className="orders-stat-label">Revenue</span>
            </div>
          </div>
          <div className="orders-stat">
            <div className="orders-stat-icon orders-stat-icon-violet">
              <TrendingUp size={18} />
            </div>
            <div className="orders-stat-body">
              <span className="orders-stat-value">${stats.avg.toFixed(2)}</span>
              <span className="orders-stat-label">Avg. Order</span>
            </div>
          </div>
          <div className="orders-stat">
            <div className="orders-stat-icon orders-stat-icon-amber">
              <Calendar size={18} />
            </div>
            <div className="orders-stat-body">
              <span className="orders-stat-value">{stats.totalItems}</span>
              <span className="orders-stat-label">Total Items</span>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {!loading && orders.length > 0 && (
        <div className="orders-search-bar">
          <div className="orders-search">
            <Search size={16} className="orders-search-icon" />
            <input
              type="text"
              placeholder="Search by order # or customer name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="orders-search-input"
            />
            {search && (
              <button className="orders-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
          {search && (
            <span className="orders-search-count">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <TableSkeleton />
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <ShoppingCart size={48} />
          </div>
          <h3>No orders yet</h3>
          <p>Create your first order to start tracking sales.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: 16 }}>
            <Plus size={16} /> Create Order
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Search size={48} />
          </div>
          <h3>No matches</h3>
          <p>No orders match "{search}". Try a different search term.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="orders-table-wrap desktop-only">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const custName = getCustomerName(o, customers);
                  return (
                    <tr key={o.id} className="orders-row">
                      <td>
                        <span className="order-id">#{o.id}</span>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar customer-avatar-sm" style={{ background: avatarColor(custName) }}>
                            {getInitials(custName)}
                          </div>
                          <span className="customer-name">{custName}</span>
                        </div>
                      </td>
                      <td className="order-items-count">{o.items?.length || 0}</td>
                      <td className="order-total">${o.total_amount.toFixed(2)}</td>
                      <td><span className="order-status-badge">{o.status}</span></td>
                      <td className="order-date">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => handleView(o.id)} aria-label={`View order ${o.id}`}>
                            <Eye size={14} />
                          </button>
                          <button className="btn btn-ghost btn-sm btn-danger-ghost" onClick={() => setCancelTarget(o)} aria-label={`Cancel order ${o.id}`}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="orders-cards mobile-only">
            {filtered.map(o => {
              const custName = getCustomerName(o, customers);
              return (
                <div className="order-card" key={o.id}>
                  <div className="order-card-header">
                    <span className="order-id">#{o.id}</span>
                    <span className="order-status-badge">{o.status}</span>
                  </div>
                  <div className="order-card-customer">
                    <div className="customer-avatar customer-avatar-sm" style={{ background: avatarColor(custName) }}>
                      {getInitials(custName)}
                    </div>
                    <span className="customer-name">{custName}</span>
                  </div>
                  <div className="order-card-details">
                    <span>{o.items?.length || 0} items</span>
                    <span className="order-total">${o.total_amount.toFixed(2)}</span>
                    <span className="order-date">{new Date(o.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="product-card-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleView(o.id)} style={{ flex: 1, justifyContent: 'center' }}>
                      <Eye size={14} /> View
                    </button>
                    <button className="btn btn-ghost btn-sm btn-danger-ghost" onClick={() => setCancelTarget(o)} style={{ flex: 1, justifyContent: 'center' }}>
                      <Trash2 size={14} /> Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Create order modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Create order">
            <h2>New Order</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="order-customer">Customer</label>
                <select
                  id="order-customer"
                  value={form.customer_id}
                  onChange={e => setForm({...form, customer_id: e.target.value})}
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <label className="order-items-label">Order Items</label>
              {form.items.map((item, index) => {
                const product = products.find(p => p.id === parseInt(item.product_id));
                const lineTotal = product ? product.price * item.quantity : 0;
                return (
                  <div className="order-form-item" key={index}>
                    <div className="order-form-item-fields">
                      <select
                        className="order-form-select"
                        value={item.product_id}
                        onChange={e => updateItem(index, 'product_id', e.target.value)}
                        required
                      >
                        <option value="">Select product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ${p.price.toFixed(2)} (Stock: {p.quantity_in_stock})
                          </option>
                        ))}
                      </select>
                      <input
                        className="order-form-qty"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItem(index, 'quantity', e.target.value)}
                        required
                      />
                      <span className="order-form-total">${lineTotal.toFixed(2)}</span>
                      <button
                        type="button"
                        className="order-form-remove"
                        onClick={() => removeItem(index)}
                        aria-label="Remove item"
                        disabled={form.items.length <= 1}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="order-form-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
                  <Plus size={14} /> Add Item
                </button>
                <div className="order-form-grand-total">
                  <span>Total</span>
                  <span className="order-form-grand-total-value">${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <CancelModal
          orderId={cancelTarget.id}
          onConfirm={handleDelete}
          onCancel={() => setCancelTarget(null)}
        />
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          customers={customers}
          products={products}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
