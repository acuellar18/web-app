'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Plus, UserCheck, AlertTriangle } from 'lucide-react';

export default function CreditsPage() {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [paymentCreditId, setPaymentCreditId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    amount: '',
    dueDate: '',
    notes: ''
  });

  const fetchCredits = () => {
    setLoading(true);
    fetch('/api/credits')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar créditos');
        return res.json();
      })
      .then(data => {
        setCredits(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setCredits([]);
        setLoading(false);
      });
  };

  useEffect(() => fetchCredits(), []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar crédito');
      }
      setFormData({ customerName: '', customerPhone: '', amount: '', dueDate: '', notes: '' });
      setShowForm(false);
      fetchCredits();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || !paymentCreditId) return;
    
    try {
      const res = await fetch(`/api/credits/${paymentCreditId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentAmount })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al registrar abono');
      }
      alert('✅ Abono registrado correctamente');
      setPaymentAmount('');
      setPaymentCreditId(null);
      fetchCredits();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  const totalActive = credits.filter(c => c.status === 'ACTIVE').reduce((sum, c) => sum + (c.balance || 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-2 m-0"><CreditCard /> Cuentas por Cobrar</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> Nuevo Crédito
        </button>
      </div>

      {/* Summary card */}
      <div className="glass-panel p-6 mb-4" style={{ borderLeft: '4px solid var(--warning-color)' }}>
        <div className="flex justify-between items-center">
          <div>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>Total pendiente de cobro</p>
            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem' }}>Q{totalActive.toFixed(2)}</h3>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {credits.filter(c => c.status === 'ACTIVE').length} créditos activos
            </span>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-panel p-6 mb-4 grid grid-cols-2 gap-4">
          <h3 style={{ gridColumn: '1 / -1', margin: '0 0 0.5rem 0' }}>Nuevo Crédito</h3>
          <div className="form-group">
            <label className="form-label">Nombre del Cliente *</label>
            <input required value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} placeholder="Nombre completo" />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} placeholder="Opcional" />
          </div>
          <div className="form-group">
            <label className="form-label">Monto (Q) *</label>
            <input required type="number" step="0.01" min="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha de Vencimiento</label>
            <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Notas</label>
            <input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Descripción del crédito (opcional)" />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-success">Guardar Crédito</button>
            <button type="button" className="btn" style={{ background: 'var(--text-secondary)', color: 'white' }} onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {/* Payment Panel */}
      {paymentCreditId && (
        <div className="glass-panel p-6 mb-4" style={{ borderLeft: '4px solid var(--primary-color)' }}>
          <h3 className="m-0 mb-4">Registrar Abono</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
            Cliente: <strong style={{ color: 'white' }}>{credits.find(c => c.id === paymentCreditId)?.customerName}</strong> — 
            Saldo: <strong style={{ color: 'var(--danger-color)' }}>Q{credits.find(c => c.id === paymentCreditId)?.balance?.toFixed(2)}</strong>
          </p>
          <form className="flex gap-4 items-end" onSubmit={handlePayment}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
              <label className="form-label">Monto del Abono (Q)</label>
              <input required type="number" step="0.01" min="0.01" max={credits.find(c => c.id === paymentCreditId)?.balance} value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-success">Abonar</button>
            <button type="button" className="btn" style={{ backgroundColor: 'var(--text-secondary)', color: 'white' }} onClick={() => setPaymentCreditId(null)}>Cancelar</button>
          </form>
        </div>
      )}

      <div className="glass-panel p-6 table-container">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando créditos...</p>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger-color)' }}>
            <p>Error: {error}</p>
            <button className="btn btn-primary" onClick={fetchCredits}>Reintentar</button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Monto Inicial</th>
                <th>Saldo Actual</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {credits.map(c => (
                <tr key={c.id}>
                  <td>
                    <strong style={{ display: 'block' }}>{c.customerName}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.customerPhone || ''}</span>
                    {c.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{c.notes}</div>}
                  </td>
                  <td>Q{c.amount?.toFixed(2)}</td>
                  <td style={{ fontWeight: 'bold', color: c.balance > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                    Q{c.balance?.toFixed(2)}
                  </td>
                  <td>
                    {c.dueDate ? new Date(c.dueDate).toLocaleDateString() : '-'}
                    {c.dueDate && new Date(c.dueDate) < new Date() && c.status === 'ACTIVE' && (
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--danger-color)' }}>⚠ Vencido</span>
                    )}
                  </td>
                  <td>
                     <span style={{ 
                       padding: '0.2rem 0.5rem', 
                       borderRadius: '1rem', 
                       fontSize: '0.75rem',
                       backgroundColor: c.status === 'ACTIVE' ? 'var(--warning-color)' : 'var(--success-color)',
                       color: 'white'
                     }}>
                       {c.status === 'ACTIVE' ? 'Pendiente' : 'Pagado'}
                     </span>
                  </td>
                  <td>
                    {c.status === 'ACTIVE' && (
                      <button onClick={() => { setPaymentCreditId(c.id); setPaymentAmount(''); }} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                        Abonar
                      </button>
                    )}
                    {c.status === 'PAID' && (
                       <UserCheck size={18} style={{ color: 'var(--success-color)' }} />
                    )}
                  </td>
                </tr>
              ))}
              {credits.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding: '2rem'}}>No hay créditos registrados</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
