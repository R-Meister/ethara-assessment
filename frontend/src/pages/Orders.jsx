import { useState, useEffect } from 'react';
import { getOrders, getOrder, createOrder, deleteOrder, getProducts, getCustomers } from '../services/api';
import { toast } from 'react-toastify';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form, setForm] = useState({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });

  const load = () => {
    getOrders().then(res => setOrders(res.data));
    getProducts().then(res => setProducts(res.data));
    getCustomers().then(res => setCustomers(res.data));
  };

  useEffect(() => { load(); }, []);

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
    try {
      const data = {
        customer_id: parseInt(form.customer_id),
        items: form.items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })),
      };
      await createOrder(data);
      toast.success('Order created');
      setShowModal(false);
      setForm({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error creating order');
    }
  };

  const handleView = async (id) => {
    const res = await getOrder(id);
    setSelectedOrder(res.data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this order? Stock will be restored.')) return;
    try {
      await deleteOrder(id);
      toast.success('Order cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error');
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
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Order</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>#{o.id}</td>
              <td>{o.customer?.full_name || `Customer #${o.customer_id}`}</td>
              <td>{o.items?.length || 0}</td>
              <td>${o.total_amount.toFixed(2)}</td>
              <td><span className="badge badge-success">{o.status}</span></td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
              <td>
                <button className="btn btn-secondary btn-sm" onClick={() => handleView(o.id)}>View</button>{' '}
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create Order</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer</label>
                <select value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})} required>
                  <option value="">Select customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                  ))}
                </select>
              </div>
              <label>Order Items</label>
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
                  <button type="button" onClick={() => removeItem(index)}>×</button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={addItem} style={{marginBottom: 16}}>+ Add Item</button>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Order #{selectedOrder.id}</h2>
            <p><strong>Customer:</strong> {selectedOrder.customer?.full_name}</p>
            <p><strong>Status:</strong> <span className="badge badge-success">{selectedOrder.status}</span></p>
            <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
            <table style={{marginTop: 16}}>
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
                    <td>${item.unit_price.toFixed(2)}</td>
                    <td>${(item.unit_price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{marginTop: 16, fontWeight: 700}}>Total: ${selectedOrder.total_amount.toFixed(2)}</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
