import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Package, Plus, Pencil, Trash2, Search, X,
  DollarSign, Boxes, AlertTriangle,
} from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import { toast } from 'react-toastify';

const emptyForm = { name: '', sku: '', price: '', quantity_in_stock: '' };

function stockLevel(qty) {
  if (qty === 0) return 'out';
  if (qty < 5) return 'critical';
  if (qty < 10) return 'low';
  return 'ok';
}

function stockLabel(qty) {
  if (qty === 0) return 'Out of stock';
  if (qty < 5) return 'Critical';
  if (qty < 10) return 'Low stock';
  return 'In stock';
}

function TableSkeleton({ rows = 5 }) {
  return (
    <div className="products-table-wrap">
      <table className="products-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Stock</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="products-row-skeleton">
              <td><div className="skeleton" style={{ width: '65%', height: 16 }} /></td>
              <td><div className="skeleton" style={{ width: 64, height: 16 }} /></td>
              <td><div className="skeleton" style={{ width: 48, height: 16 }} /></td>
              <td><div className="skeleton" style={{ width: 72, height: 24, borderRadius: 'var(--radius-pill)' }} /></td>
              <td><div className="skeleton" style={{ width: 56, height: 16 }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeleteModal({ product, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Confirm delete">
        <div className="delete-modal-icon">
          <Trash2 size={24} />
        </div>
        <h2>Delete product?</h2>
        <p className="delete-modal-desc">
          <strong>{product.name}</strong> ({product.sku}) will be permanently removed. This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const nameInputRef = useRef(null);
  const searchRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    getProducts()
      .then(res => setProducts(res.data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (showModal && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showModal]);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

  const stats = useMemo(() => {
    const total = products.length;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity_in_stock, 0);
    const totalStock = products.reduce((sum, p) => sum + p.quantity_in_stock, 0);
    const lowStock = products.filter(p => p.quantity_in_stock < 10).length;
    return { total, totalValue, totalStock, lowStock };
  }, [products]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, price: String(p.price), quantity_in_stock: String(p.quantity_in_stock) });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        quantity_in_stock: parseInt(form.quantity_in_stock, 10),
      };
      if (editing) {
        await updateProduct(editing.id, data);
        toast.success('Product updated');
      } else {
        await createProduct(data);
        toast.success('Product created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete');
    }
  };

  return (
    <div className="products-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p className="page-header-sub">Manage your inventory catalog</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Stats strip */}
      {!loading && products.length > 0 && (
        <div className="products-stats">
          <div className="products-stat">
            <div className="products-stat-icon products-stat-icon-blue">
              <Boxes size={18} />
            </div>
            <div className="products-stat-body">
              <span className="products-stat-value">{stats.total}</span>
              <span className="products-stat-label">Products</span>
            </div>
          </div>
          <div className="products-stat">
            <div className="products-stat-icon products-stat-icon-green">
              <Package size={18} />
            </div>
            <div className="products-stat-body">
              <span className="products-stat-value">{stats.totalStock.toLocaleString()}</span>
              <span className="products-stat-label">Total Units</span>
            </div>
          </div>
          <div className="products-stat">
            <div className="products-stat-icon products-stat-icon-violet">
              <DollarSign size={18} />
            </div>
            <div className="products-stat-body">
              <span className="products-stat-value">${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              <span className="products-stat-label">Inventory Value</span>
            </div>
          </div>
          {stats.lowStock > 0 && (
            <div className="products-stat">
              <div className="products-stat-icon products-stat-icon-amber">
                <AlertTriangle size={18} />
              </div>
              <div className="products-stat-body">
                <span className="products-stat-value">{stats.lowStock}</span>
                <span className="products-stat-label">Low Stock</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      {!loading && products.length > 0 && (
        <div className="products-search-bar">
          <div className="products-search">
            <Search size={16} className="products-search-icon" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="products-search-input"
            />
            {search && (
              <button className="products-search-clear" onClick={() => { setSearch(''); searchRef.current?.focus(); }} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
          {search && (
            <span className="products-search-count">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <TableSkeleton />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Package size={48} />
          </div>
          <h3>No products yet</h3>
          <p>Add your first product to start tracking inventory.</p>
          <button className="btn btn-primary" onClick={openAdd} style={{ marginTop: 16 }}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Search size={48} />
          </div>
          <h3>No matches</h3>
          <p>No products match "{search}". Try a different search term.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="products-table-wrap desktop-only">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const level = stockLevel(p.quantity_in_stock);
                  return (
                    <tr key={p.id} className="products-row">
                      <td>
                        <div className="product-cell">
                          <div className={`product-icon-dot product-dot-${level}`} />
                          <span className="product-name">{p.name}</span>
                        </div>
                      </td>
                      <td><code className="sku-code">{p.sku}</code></td>
                      <td className="product-price">${p.price.toFixed(2)}</td>
                      <td>
                        <span className={`stock-badge stock-${level}`}>
                          {p.quantity_in_stock}
                        </span>
                        <span className="stock-label">{stockLabel(p.quantity_in_stock)}</span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`}>
                            <Pencil size={14} />
                          </button>
                          <button className="btn btn-ghost btn-sm btn-danger-ghost" onClick={() => setDeleteTarget(p)} aria-label={`Delete ${p.name}`}>
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
          <div className="products-cards mobile-only">
            {filtered.map(p => {
              const level = stockLevel(p.quantity_in_stock);
              return (
                <div className="product-card" key={p.id}>
                  <div className="product-card-header">
                    <div className="product-cell">
                      <div className={`product-icon-dot product-dot-${level}`} />
                      <span className="product-name">{p.name}</span>
                    </div>
                    <span className={`stock-badge stock-${level}`}>{p.quantity_in_stock}</span>
                  </div>
                  <div className="product-card-details">
                    <span className="sku-code">{p.sku}</span>
                    <span className="product-price">${p.price.toFixed(2)}</span>
                  </div>
                  <div className="product-card-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button className="btn btn-ghost btn-sm btn-danger-ghost" onClick={() => setDeleteTarget(p)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={editing ? 'Edit product' : 'Add product'}>
            <h2>{editing ? 'Edit Product' : 'New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="product-name">Product Name</label>
                <input
                  id="product-name"
                  ref={nameInputRef}
                  placeholder="e.g. Widget Pro"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="product-sku">SKU</label>
                  <input
                    id="product-sku"
                    placeholder="e.g. WP-001"
                    value={form.sku}
                    onChange={e => setForm({...form, sku: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="product-price">Price ($)</label>
                  <input
                    id="product-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="product-stock">Quantity in Stock</label>
                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.quantity_in_stock}
                  onChange={e => setForm({...form, quantity_in_stock: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
