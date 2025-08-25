import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// tiny helper
const slugify = (s = '') =>
  s.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export default function AdminPanel() {
  const { token } = useAuth();
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  // ----- Orders state -----
  const [orders, setOrders] = useState([]);

  // ----- Products state -----
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [creating, setCreating] = useState(false);

  // ----- Categories state -----
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState({ name: '', slug: '' });
  const [creatingCat, setCreatingCat] = useState(false);

  // ----- New product form state -----
  const emptyVariant = { sku: '', size: '', color: '', price: '', stock: '' };
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    imagesCsv: '',
    variants: [{ ...emptyVariant }]
  });
  const [error, setError] = useState('');

  // ====== LOADERS ======
  const loadOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders/admin/all', { headers });
      setOrders(data);
    } catch {
      alert('Admin only (orders).');
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await axios.get('/api/categories');
      setCategories(data);
    } catch {
      // ignore
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      // pull first 100 for admin view
      const { data } = await axios.get('/api/products', { params: { page: 1, limit: 100 } });
      setProducts(data.items || []);
    } catch {
      // ignore
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadOrders();
    loadCategories();
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ====== ORDERS ======
  const updateStatus = async (id, status) => {
    const { data } = await axios.put(
      `/api/orders/admin/${id}/status`,
      { status },
      { headers }
    );
    setOrders(prev => prev.map(o => (o._id === id ? data : o)));
  };

  // ====== CATEGORIES ======
  const createCategory = async (e) => {
    e.preventDefault();
    const payload = {
      name: newCat.name.trim(),
      slug: (newCat.slug || slugify(newCat.name)).trim()
    };
    if (!payload.name || !payload.slug) return setError('Category name/slug required.');
    setError('');
    setCreatingCat(true);
    try {
      await axios.post('/api/categories', payload, { headers });
      setNewCat({ name: '', slug: '' });
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setCreatingCat(false);
    }
  };

  // ====== PRODUCTS ======
  const addVariantRow = () => setForm(f => ({ ...f, variants: [...f.variants, { ...emptyVariant }] }));
  const removeVariantRow = (idx) =>
    setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));

  const setVariantField = (idx, key, val) =>
    setForm(f => ({
      ...f,
      variants: f.variants.map((v, i) => (i === idx ? { ...v, [key]: val } : v))
    }));

  const resetProductForm = () => {
    setForm({
      name: '',
      description: '',
      category: '',
      imagesCsv: '',
      variants: [{ ...emptyVariant }]
    });
    setError('');
  };

  const createProduct = async (e) => {
    e.preventDefault();
    setError('');
    // validate
    if (!form.name.trim()) return setError('Product name is required.');
    if (!form.variants.length) return setError('At least one variant is required.');
    const variants = form.variants
      .map(v => ({
        sku: v.sku.trim(),
        size: v.size.trim() || undefined,
        color: v.color.trim() || undefined,
        price: Number(v.price),
        stock: Number(v.stock)
      }))
      .filter(v => v.sku && !Number.isNaN(v.price) && !Number.isNaN(v.stock));
    if (!variants.length) return setError('Variants must include valid sku, price, and stock.');

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      images: form.imagesCsv
        ? form.imagesCsv.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      category: form.category || undefined,
      variants,
      active: true
    };

    setCreating(true);
    try {
      await axios.post('/api/products', payload, { headers });
      resetProductForm();
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setCreating(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`, { headers });
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // ====== RENDER ======
  return (
    <div style={{ padding: 16 }}>
      <h2>Admin Panel</h2>

      {/* ---------- PRODUCTS ---------- */}
      <section style={{ marginTop: 18, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <h3>Products</h3>

        {/* Create product form */}
        <form onSubmit={createProduct} style={{ margin: '12px 0', background: '#fafafa', padding: 12, borderRadius: 8 }}>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <label>
              <div>Name *</div>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </label>

            <label>
              <div>Category</div>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                <option value="">— None —</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <div>Description</div>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <div>Image URLs (comma separated)</div>
              <input
                value={form.imagesCsv}
                onChange={e => setForm(f => ({ ...f, imagesCsv: e.target.value }))}
                placeholder="https://img/1.jpg, https://img/2.jpg"
              />
            </label>
          </div>

          {/* Variants */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong>Variants *</strong>
              <button type="button" onClick={addVariantRow}>+ Add variant</button>
            </div>

            <div style={{ marginTop: 8 }}>
              {form.variants.map((v, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '120px 100px 100px 100px 100px auto', gap: 8, marginBottom: 6 }}>
                  <input
                    placeholder="SKU *"
                    value={v.sku}
                    onChange={e => setVariantField(idx, 'sku', e.target.value)}
                    required
                  />
                  <input
                    placeholder="Size"
                    value={v.size}
                    onChange={e => setVariantField(idx, 'size', e.target.value)}
                  />
                  <input
                    placeholder="Color"
                    value={v.color}
                    onChange={e => setVariantField(idx, 'color', e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price *"
                    value={v.price}
                    onChange={e => setVariantField(idx, 'price', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Stock *"
                    value={v.stock}
                    onChange={e => setVariantField(idx, 'stock', e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => removeVariantRow(idx)}>Remove</button>
                </div>
              ))}
            </div>
          </div>

          {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}

          <div style={{ marginTop: 10 }}>
            <button type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Create Product'}
            </button>
            <button type="button" onClick={resetProductForm} style={{ marginLeft: 8 }}>
              Reset
            </button>
          </div>
        </form>

        {/* Product list */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong>All Products</strong>
            <button onClick={loadProducts} disabled={loadingProducts}>
              {loadingProducts ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {products.length === 0 ? (
            <div style={{ opacity: 0.7, marginTop: 8 }}>No products yet.</div>
          ) : (
            <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
              {products.map(p => (
                <div key={p._id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {p.category?.name || 'Uncategorized'} · {Array.isArray(p.variants) ? p.variants.length : 0} variant(s)
                      </div>
                    </div>
                    <div>
                      <button onClick={() => deleteProduct(p._id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6 }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- CATEGORIES (quick add) ---------- */}
      <section style={{ marginTop: 18, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <h3>Categories</h3>
        <form onSubmit={createCategory} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            placeholder="Category name"
            value={newCat.name}
            onChange={e => setNewCat({ ...newCat, name: e.target.value, slug: slugify(e.target.value) })}
            required
          />
          <input
            placeholder="Slug"
            value={newCat.slug}
            onChange={e => setNewCat({ ...newCat, slug: e.target.value })}
            required
          />
          <button type="submit" disabled={creatingCat}>{creatingCat ? 'Adding…' : 'Add Category'}</button>
        </form>
        {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <span key={c._id} style={{ padding: '4px 8px', borderRadius: 999, background: '#eef2ff' }}>
              {c.name}
            </span>
          ))}
        </div>
      </section>

      {/* ---------- ORDERS ---------- */}
      <section style={{ marginTop: 18, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <h3>Orders</h3>
        {orders.map(o => (
          <div key={o._id} style={{ border: '1px solid #eee', marginBottom: 8, padding: 8, borderRadius: 6 }}>
            <div>#{o._id} — {o.status} — ${o.totals?.grandTotal}</div>
            <div style={{ marginTop: 6 }}>
              <button onClick={() => updateStatus(o._id, 'confirmed')}>Confirm</button>
              <button onClick={() => updateStatus(o._id, 'shipped')} style={{ marginLeft: 8 }}>Ship</button>
              <button onClick={() => updateStatus(o._id, 'delivered')} style={{ marginLeft: 8 }}>Deliver</button>
            </div>
          </div>
        ))}
        {!orders.length && <div style={{ opacity: 0.7 }}>No orders yet.</div>}
      </section>
    </div>
  );
}
