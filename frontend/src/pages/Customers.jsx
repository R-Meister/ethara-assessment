import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Users, Plus, Trash2, Search, X, Mail, Phone, User,
} from 'lucide-react';
import { getCustomers, createCustomer, deleteCustomer } from '../services/api';
import { toast } from 'react-toastify';

const emptyForm = { full_name: '', email: '', phone: '' };

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
    <div className="customers-table-wrap">
      <table className="customers-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Email</th>
            <th>Phone</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="customers-row-skeleton">
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 'var(--radius-pill)' }} />
                  <div className="skeleton" style={{ width: '50%', height: 16 }} />
                </div>
              </td>
              <td><div className="skeleton" style={{ width: '65%', height: 16 }} /></td>
              <td><div className="skeleton" style={{ width: 80, height: 16 }} /></td>
              <td><div className="skeleton" style={{ width: 30, height: 16 }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeleteModal({ customer, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Confirm delete">
        <div className="delete-modal-icon">
          <Trash2 size={24} />
        </div>
        <h2>Delete customer?</h2>
        <p className="delete-modal-desc">
          <strong>{customer.full_name}</strong> ({customer.email}) will be permanently removed. This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const nameInputRef = useRef(null);
  const searchRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    getCustomers()
      .then(res => setCustomers(res.data))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (showModal && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showModal]);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(c =>
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  }, [customers, search]);

  const stats = useMemo(() => {
    const total = customers.length;
    const withEmail = customers.filter(c => c.email).length;
    const withPhone = customers.filter(c => c.phone).length;
    return { total, withEmail, withPhone };
  }, [customers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createCustomer(form);
      toast.success('Customer created');
      setShowModal(false);
      setForm(emptyForm);
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
      await deleteCustomer(deleteTarget.id);
      toast.success('Customer deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete');
    }
  };

  return (
    <div className="customers-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p className="page-header-sub">Manage your customer directory</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Stats strip */}
      {!loading && customers.length > 0 && (
        <div className="customers-stats">
          <div className="customers-stat">
            <div className="customers-stat-icon customers-stat-icon-blue">
              <Users size={18} />
            </div>
            <div className="customers-stat-body">
              <span className="customers-stat-value">{stats.total}</span>
              <span className="customers-stat-label">Customers</span>
            </div>
          </div>
          <div className="customers-stat">
            <div className="customers-stat-icon customers-stat-icon-green">
              <Mail size={18} />
            </div>
            <div className="customers-stat-body">
              <span className="customers-stat-value">{stats.withEmail}</span>
              <span className="customers-stat-label">With Email</span>
            </div>
          </div>
          <div className="customers-stat">
            <div className="customers-stat-icon customers-stat-icon-violet">
              <Phone size={18} />
            </div>
            <div className="customers-stat-body">
              <span className="customers-stat-value">{stats.withPhone}</span>
              <span className="customers-stat-label">With Phone</span>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {!loading && customers.length > 0 && (
        <div className="customers-search-bar">
          <div className="customers-search">
            <Search size={16} className="customers-search-icon" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="customers-search-input"
            />
            {search && (
              <button className="customers-search-clear" onClick={() => { setSearch(''); searchRef.current?.focus(); }} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
          {search && (
            <span className="customers-search-count">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <TableSkeleton />
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Users size={48} />
          </div>
          <h3>No customers yet</h3>
          <p>Add your first customer to start creating orders.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: 16 }}>
            <Plus size={16} /> Add Customer
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Search size={48} />
          </div>
          <h3>No matches</h3>
          <p>No customers match "{search}". Try a different search term.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="customers-table-wrap desktop-only">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="customers-row">
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar" style={{ background: avatarColor(c.full_name) }}>
                          {getInitials(c.full_name)}
                        </div>
                        <span className="customer-name">{c.full_name}</span>
                      </div>
                    </td>
                    <td className="customer-email">{c.email}</td>
                    <td className="customer-phone">{c.phone}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm btn-danger-ghost" onClick={() => setDeleteTarget(c)} aria-label={`Delete ${c.full_name}`}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="customers-cards mobile-only">
            {filtered.map(c => (
              <div className="customer-card" key={c.id}>
                <div className="customer-card-header">
                  <div className="customer-cell">
                    <div className="customer-avatar" style={{ background: avatarColor(c.full_name) }}>
                      {getInitials(c.full_name)}
                    </div>
                    <span className="customer-name">{c.full_name}</span>
                  </div>
                </div>
                <div className="customer-card-details">
                  <div className="customer-card-detail">
                    <Mail size={14} />
                    <span>{c.email}</span>
                  </div>
                  <div className="customer-card-detail">
                    <Phone size={14} />
                    <span>{c.phone}</span>
                  </div>
                </div>
                <div className="product-card-actions">
                  <button className="btn btn-ghost btn-sm btn-danger-ghost" onClick={() => setDeleteTarget(c)} style={{ flex: 1, justifyContent: 'center' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Add customer">
            <h2>New Customer</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="customer-name">Full Name</label>
                <input
                  id="customer-name"
                  ref={nameInputRef}
                  placeholder="e.g. Jane Smith"
                  value={form.full_name}
                  onChange={e => setForm({...form, full_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="customer-email">Email</label>
                <input
                  id="customer-email"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="customer-phone">Phone</label>
                <input
                  id="customer-phone"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          customer={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
