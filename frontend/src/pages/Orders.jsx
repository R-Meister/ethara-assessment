import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Plus, Eye, X } from 'lucide-react';
import { getOrders, getOrder, createOrder, deleteOrder, getProducts, getCustomers } from '../services/api';
import { toast } from 'react-toastify';

const emptyForm = { customer_id: '', items: [{ product_id: '', quantity: 1 }] };

function TableSkeleton({ rows = 5 }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th style={{ width: 120 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td><div className="skeleton" style={{ width: 40, height: 16 }} /></td>
              <td><div className="skeleton" style={{ width: '50%', height: 16 }} /></td>
              <td><div className="skeleton" style={{ width: 20, height: 16 }} /></td>
              <td><div className="skeleton" style={{ width: 60, height: 16 }} /></td>
              <td><div className="skeleton" style={{ width: 50, height: 20, borderRadius: 'var(--radius-pill)' }} /></td>
              <td><div className="skeleton" style={{ width: 70, height: 16 }} /></td>
              <td><div className="skeleton" style={{ width: 80, height: 16 }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this order? Stock will be restored.')) return;
    try {
      await deleteOrder(id);
      toast.success('Order cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel');
    }
  };

  const getProductName = (id) => {
    const p = products.find(p => p.id === id);
    return p ? p.name : `Product #${id}`;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Create Order
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <ShoppingCart />
          <h3>No orders yet</h3>
          <p>Create your first order to start tracking sales.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600 }}>#{o.id}</td>
                  <td>{o.customer?.full_name || `Customer #${o.customer_id}`}</td>
                  <td>{o.items?.length || 0}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>${o.total_amount.toFixed(2)}</td>
                  <td><span className="badge badge-success">{o.status}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleView(o.id)} aria-label={`View order ${o.id}`}>
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(o.id)} aria-label={`Cancel order ${o.id}`} style={{ color: 'var(--danger)' }}>
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Create order">
            <h2>Create Order</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="order-customer">Customer</label>
                <select
                  id="order-customer"
                  value={form.customer_id}
                  onChange={e => setForm({...form, customer_id: e.target.value})}
                  required
                >
                  <option value="">Select customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14 }}>Order Items</label>
              {form.items.map((item, index) => (
                <div className="order-item" key={index}>
                  <select value={item.product_id} onChange={e => updateItem(index, 'product_id', e.target.value)} required>
                    <option value="">Select product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (${p.price}) [Stock: {p.quantity_in_stock}]</option>
                    ))}
                  </select>
                  <input type="number" min="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} required />
                  <span>${item.product_id ? (products.find(p => p.id === parseInt(item.product_id))?.price * item.quantity || 0).toFixed(2) : '0.00'}</span>
                  <button type="button" onClick={() => removeItem(index)} aria-label="Remove item" disabled={form.items.length <= 1}>×</button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={addItem} style={{ marginTop: 8 }}>
                <Plus size={14} /> Add Item
              </button>

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

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Order ${selectedOrder.id} details`}>
            <h2>Order #{selectedOrder.id}</h2>
            <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
              <p><strong>Customer:</strong> {selectedOrder.customer?.full_name}</p>
              <p><strong>Status:</strong> <span className="badge badge-success">{selectedOrder.status}</span></p>
              <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map(item => (
                    <tr key={item.id}>
                      <td>{item.product?.name || getProductName(item.product_id)}</td>
                      <td>{item.quantity}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>${item.unit_price.toFixed(2)}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>${(item.unit_price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: 16, fontWeight: 700, fontSize: 16 }}>
              Total: ${selectedOrder.total_amount.toFixed(2)}
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
