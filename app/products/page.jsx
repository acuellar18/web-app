'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Search, X, Package } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '', barcode: '', description: '', costPrice: '', salePrice: '', stock: '', minStock: '5', category: ''
  });

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar productos');
        return res.json();
      })
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setProducts([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', barcode: '', description: '', costPrice: '', salePrice: '', stock: '', minStock: '5', category: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar producto');
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      barcode: product.barcode || '',
      description: product.description || '',
      costPrice: product.costPrice.toString(),
      salePrice: product.salePrice.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      category: product.category || ''
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar');
        fetchProducts();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.barcode && p.barcode.includes(searchTerm)) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-2 m-0"><Package /> Inventario de Productos</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-6 mb-4">
        <div className="flex items-center gap-4">
          <Search size={20} style={{ color: 'var(--text-secondary)' }} />
          <input
            placeholder="Buscar por nombre, código de barras o categoría..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-6 mb-4 grid grid-cols-2 gap-4">
          <h3 style={{ gridColumn: '1 / -1', margin: '0 0 0.5rem 0' }}>
            {editingId ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <div className="form-group">
            <label className="form-label">Nombre del Producto *</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Galletas Chiky" />
          </div>
          <div className="form-group">
            <label className="form-label">Código de Barras</label>
            <input value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} placeholder="Opcional" />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Descripción opcional" />
          </div>
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ej: Abarrotes, Bebidas..." />
          </div>
          <div className="form-group">
            <label className="form-label">Costo (Q) *</label>
            <input required type="number" step="0.01" min="0" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Precio de Venta (Q) *</label>
            <input required type="number" step="0.01" min="0" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Stock Actual</label>
            <input type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Stock Mínimo</label>
            <input type="number" min="0" value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-success">{editingId ? 'Actualizar' : 'Guardar'} Producto</button>
            <button type="button" className="btn" style={{ background: 'var(--text-secondary)', color: 'white' }} onClick={resetForm}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="glass-panel p-6 table-container">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando inventario...</p>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger-color)' }}>
            <p>Error: {error}</p>
            <button className="btn btn-primary" onClick={fetchProducts}>Reintentar</button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Costo</th>
                <th>Venta</th>
                <th>Ganancia</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.barcode || '-'}</td>
                  <td>
                    <strong>{p.name}</strong>
                    {p.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.description}</div>}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{p.category || '-'}</td>
                  <td>Q{p.costPrice?.toFixed(2)}</td>
                  <td>Q{p.salePrice?.toFixed(2)}</td>
                  <td style={{ color: 'var(--success-color)', fontWeight: '500' }}>Q{(p.salePrice - p.costPrice)?.toFixed(2)}</td>
                  <td style={{ color: p.stock <= p.minStock ? 'var(--danger-color)' : 'inherit', fontWeight: p.stock <= p.minStock ? 'bold' : 'normal' }}>
                    {p.stock}
                    {p.stock <= p.minStock && <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--danger-color)' }}>⚠ Bajo</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(p)} className="btn btn-primary" style={{ padding: '0.4rem' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="btn btn-danger" style={{ padding: '0.4rem' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr><td colSpan="8" style={{textAlign:'center', padding: '2rem'}}>
                  {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados. ¡Agrega uno!'}
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
