'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, UserCheck, AlertTriangle, Trash2 } from 'lucide-react';

export default function CreditsPage() {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [paymentCreditId, setPaymentCreditId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    amount: '',
    dueDate: '',
    purchaseDate: new Date().toISOString().split('T')[0],
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
      setFormData({ 
        customerName: '', 
        customerPhone: '', 
        amount: '', 
        dueDate: '', 
        purchaseDate: new Date().toISOString().split('T')[0], 
        notes: '' 
      });
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
        body: JSON.stringify({ paymentAmount, date: paymentDate })
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

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este crédito? Esta acción no se puede deshacer y eliminará todos los pagos asociados.')) return;
    
    try {
      const res = await fetch(`/api/credits/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar el crédito');
      }
      alert('✅ Crédito eliminado correctamente');
      fetchCredits();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  const filteredCredits = credits
    .filter(c => c.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.customerName.localeCompare(b.customerName));

  const totalActive = credits.filter(c => c.status === 'ACTIVE').reduce((sum, c) => sum + (c.balance || 0), 0);

  return (
    <div className="credits-container">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h2 className="flex items-center gap-2 m-0"><CreditCard /> Cuentas por Cobrar</h2>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={{ paddingLeft: '1rem', width: '100%' }}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} /> Nuevo Crédito
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div className="glass-panel p-6 mb-4" style={{ borderLeft: '4px solid var(--warning-color)' }}>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>Total pendiente de cobro</p>
            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem' }}>Q{totalActive.toFixed(2)}</h3>
          </div>
          <div className="text-right">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>
              {credits.filter(c => c.status === 'ACTIVE').length} créditos activos
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ordenado por nombre A-Z</span>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-panel p-6 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="form-label">Monto de la Compra (Q) *</label>
            <input required type="number" step="0.01" min="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha de Compra</label>
            <input type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha de Vencimiento (Relativo)</label>
            <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Notas</label>
            <input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Ej: Compra de víveres" />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
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
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end" onSubmit={handlePayment}>
            <div className="form-group mb-0">
              <label className="form-label">Monto a Abonar (Q)</label>
              <input required type="number" step="0.01" min="0.01" max={credits.find(c => c.id === paymentCreditId)?.balance} value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Fecha del Abono</label>
              <input type="date" required value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-success flex-1">Abonar</button>
              <button type="button" className="btn flex-1" style={{ backgroundColor: 'var(--text-secondary)', color: 'white' }} onClick={() => setPaymentCreditId(null)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel p-6 table-container overflow-x-auto">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando créditos...</p>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger-color)' }}>
            <p>Error: {error}</p>
            <button className="btn btn-primary" onClick={fetchCredits}>Reintentar</button>
          </div>
        ) : (
          <>
            <table className="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Monto Inicial</th>
                  <th>Saldo Actual</th>
                  <th>Fecha Compra</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCredits.map(c => (
                  <React.Fragment key={c.id}>
                    <tr>
                      <td>
                        <strong style={{ display: 'block' }}>{c.customerName}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.customerPhone || ''}</span>
                        {c.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{c.notes}</div>}
                      </td>
                      <td>Q{c.amount?.toFixed(2)}</td>
                      <td style={{ fontWeight: 'bold', color: c.balance > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                        Q{c.balance?.toFixed(2)}
                      </td>
                      <td>{c.purchaseDate ? new Date(c.purchaseDate).toLocaleDateString() : '-'}</td>
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
                        <div className="flex gap-2">
                          {c.status === 'ACTIVE' && (
                            <button onClick={() => { setPaymentCreditId(c.id); setPaymentAmount(''); }} className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
                              Abonar
                            </button>
                          )}
                          <button onClick={() => setSelectedHistoryId(selectedHistoryId === c.id ? null : c.id)} className="btn" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', background: 'var(--glass-bg)' }}>
                            {selectedHistoryId === c.id ? 'Cerrar' : 'Historial'}
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="btn btn-danger" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} title="Eliminar crédito">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {selectedHistoryId === c.id && (
                      <tr key={`history-${c.id}`} style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <td colSpan="7" style={{ padding: '1.5rem' }}>
                          <div className="glass-panel p-4" style={{ margin: 0 }}>
                            <h4 className="m-0 mb-3" style={{ fontSize: '0.9rem', color: 'var(--primary-color)' }}>Historial de Abonos - {c.customerName}</h4>
                            <table className="inner-table" style={{ width: '100%', fontSize: '0.85rem' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Fecha</th>
                                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Monto Abonado</th>
                                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Saldo Pendiente</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                  <td style={{ padding: '0.5rem' }}>{new Date(c.purchaseDate).toLocaleDateString()}</td>
                                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>-</td>
                                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>Q{c.amount.toFixed(2)} (Compra)</td>
                                </tr>
                                {c.payments && c.payments.length > 0 ? (
                                  [...c.payments].reverse().map((p, idx) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                      <td style={{ padding: '0.5rem' }}>{new Date(p.date).toLocaleDateString()}</td>
                                      <td style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--success-color)', fontWeight: 'bold' }}>-Q{p.amount.toFixed(2)}</td>
                                      <td style={{ textAlign: 'right', padding: '0.5rem' }}>Q{p.balanceAfter?.toFixed(2) || 'N/A'}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>No hay abonos registrados</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filteredCredits.length === 0 && <tr><td colSpan="7" style={{textAlign:'center', padding: '2rem'}}>No se encontraron créditos registrados</td></tr>}
              </tbody>
            </table>
          </>
        )}
      </div>
      <style jsx>{`
        .inner-table th { background: transparent !important; color: var(--text-secondary) !important; font-weight: normal; }
        @media (max-width: 768px) {
          .table-container { font-size: 0.85rem; }
          th, td { padding: 0.5rem 0.25rem; }
          .btn { padding: 0.4rem 0.5rem; }
        }
      `}</style>
    </div>
  );
}
