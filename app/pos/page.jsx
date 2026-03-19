'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, CheckCircle, Plus, Minus, AlertTriangle } from 'lucide-react';

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const loadProducts = () => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Error cargando productos');
        return res.json();
      })
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setProducts([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.barcode && p.barcode.includes(searchTerm))
  );

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    const existing = cart.find(i => i.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert(`Solo hay ${product.stock} unidades de ${product.name}`);
        return;
      }
      setCart(cart.map(i => i.productId === product.id ? {
        ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price
      } : i));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.salePrice,
        quantity: 1,
        subtotal: product.salePrice,
        maxStock: product.stock
      }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(i => {
      if (i.productId !== productId) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return null;
      if (newQty > i.maxStock) return i;
      return { ...i, quantity: newQty, subtotal: newQty * i.price };
    }).filter(Boolean));
  };

  const removeFromCart = (productId) => setCart(cart.filter(i => i.productId !== productId));

  const totalAmount = cart.reduce((acc, i) => acc + i.subtotal, 0);
  const finalAmount = Math.max(0, totalAmount - discount);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('El carrito está vacío');
    if (processing) return;
    
    setProcessing(true);

    // Map UI payment methods to DB expected values
    const methodMap = {
      'EFECTIVO': 'CASH',
      'TARJETA': 'CARD',
      'TRANSFERENCIA': 'TRANSFER',
    };

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount,
          discount,
          finalAmount,
          paymentMethod: methodMap[paymentMethod] || 'CASH',
          items: cart.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            subtotal: i.subtotal
          }))
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al procesar venta');
      }

      setCart([]);
      setDiscount(0);
      alert('✅ ¡Venta procesada con éxito!');
      loadProducts(); // refresh stock
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Handle barcode scan (Enter key in search)
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      const product = products.find(p => p.barcode === searchTerm.trim());
      if (product) {
        addToCart(product);
        setSearchTerm('');
      }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4" style={{ gridTemplateColumns: 'minmax(300px, 2fr) minmax(300px, 1fr)' }}>
      {/* Product Selection */}
      <div className="glass-panel p-6 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
        <h2 className="flex items-center gap-2 m-0 mb-4"><ShoppingCart /> Punto de Venta</h2>
        <div className="flex items-center gap-4 mb-4" style={{ position: 'relative' }}>
          <Search style={{ color: 'var(--text-secondary)' }} />
          <input 
            placeholder="Buscar por nombre o escanear código de barras..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            autoFocus
            style={{ flex: 1 }}
          />
        </div>
        
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando productos...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4" style={{ overflowY: 'auto', alignContent: 'start', flex: 1 }}>
            {filteredProducts.length === 0 && (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
              </p>
            )}
            {filteredProducts.map(p => (
              <div 
                key={p.id} 
                className="glass-panel p-4 cursor-pointer" 
                style={{ 
                  textAlign: 'center', 
                  transition: 'transform 0.15s, box-shadow 0.15s', 
                  opacity: p.stock > 0 ? 1 : 0.4,
                  cursor: p.stock > 0 ? 'pointer' : 'not-allowed'
                }}
                onClick={() => p.stock > 0 && addToCart(p)}
                onMouseEnter={e => { if (p.stock > 0) e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{p.name}</h4>
                <p style={{ margin: '0', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1.1rem' }}>Q{p.salePrice?.toFixed(2)}</p>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: p.stock <= p.minStock ? 'var(--danger-color)' : 'var(--text-secondary)' }}>
                  {p.stock > 0 ? `Stock: ${p.stock}` : '⚠ Sin stock'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Area */}
      <div className="glass-panel p-6 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="flex items-center gap-4 mb-4">
          <ShoppingCart size={24} />
          <h2 className="m-0">Ticket de Venta</h2>
          {cart.length > 0 && (
            <span style={{ background: 'var(--primary-color)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cart.map(item => (
            <div key={item.productId} className="flex justify-between items-center mb-4 p-2" style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>{item.name}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Q{item.price?.toFixed(2)} c/u
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => updateQuantity(item.productId, -1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ fontWeight: 'bold', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={14} />
                  </button>
                </div>
                <strong style={{ minWidth: '70px', textAlign: 'right' }}>Q{item.subtotal?.toFixed(2)}</strong>
                <button onClick={() => removeFromCart(item.productId)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-secondary)' }}>
              <ShoppingCart size={48} style={{ opacity: 0.3, margin: '0 auto 1rem', display: 'block' }} />
              <p>Selecciona productos para vender</p>
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '2px solid var(--surface-border)' }}>
          <div className="flex justify-between items-center mb-2">
            <span>Subtotal:</span>
            <span>Q{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-4" style={{ color: 'var(--text-secondary)' }}>
            <span>Descuento (Q):</span>
            <input 
              type="number" 
              style={{ width: '100px', padding: '0.3rem', textAlign: 'right' }} 
              value={discount} 
              min="0"
              max={totalAmount}
              onChange={e => setDiscount(Math.min(parseFloat(e.target.value) || 0, totalAmount))} 
            />
          </div>
          <div className="flex justify-between items-center mb-4" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
            <span>Total:</span>
            <span>Q{finalAmount.toFixed(2)}</span>
          </div>
          
          <div className="mb-4">
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Método de Pago</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>

          <button 
            className="btn btn-success" 
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem' }}
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
          >
            <CheckCircle size={20} /> {processing ? 'Procesando...' : 'Cobrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
