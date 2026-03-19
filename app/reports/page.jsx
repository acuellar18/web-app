'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, Download, Search, Filter } from 'lucide-react';

export default function ReportsPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetch('/api/sales')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar ventas');
        return res.json();
      })
      .then(data => {
        setSales(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setSales([]);
        setLoading(false);
      });
  }, []);

  const filteredSales = filterDate
    ? sales.filter(s => new Date(s.createdAt).toLocaleDateString() === new Date(filterDate).toLocaleDateString())
    : sales;

  const totalRevenue = filteredSales.reduce((acc, sale) => acc + (sale.finalAmount || 0), 0);
  const totalDiscount = filteredSales.reduce((acc, sale) => acc + (sale.discount || 0), 0);

  const methodLabels = {
    'CASH': 'Efectivo',
    'CARD': 'Tarjeta',
    'TRANSFER': 'Transferencia',
    'CREDIT': 'Crédito'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-2 m-0"><FileText /> Reportes e Historial</h2>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Download size={18} /> Exportar / Imprimir
        </button>
      </div>

      {/* Filter */}
      <div className="glass-panel p-6 mb-4">
        <div className="flex items-center gap-4">
          <Filter size={20} style={{ color: 'var(--text-secondary)' }} />
          <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Filtrar por fecha:</label>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ maxWidth: '200px' }} />
          {filterDate && (
            <button className="btn" style={{ background: 'var(--text-secondary)', color: 'white', padding: '0.4rem 0.75rem' }} onClick={() => setFilterDate('')}>
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="glass-panel p-6">
          <h3 style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Ventas Totales</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>Q{totalRevenue.toFixed(2)}</div>
        </div>
        <div className="glass-panel p-6">
          <h3 style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Transacciones</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{filteredSales.length}</div>
        </div>
        <div className="glass-panel p-6">
          <h3 style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Descuentos Otorgados</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning-color)' }}>Q{totalDiscount.toFixed(2)}</div>
        </div>
      </div>

      <div className="glass-panel p-6 table-container">
        <h3 className="mb-4">Historial de Ventas Detallado</h3>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando historial...</p>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger-color)' }}>
            <p>Error: {error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID Venta</th>
                <th>Fecha y Hora</th>
                <th>Artículos</th>
                <th>Subtotal</th>
                <th>Descuento</th>
                <th>Total</th>
                <th>Método</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(sale => (
                <tr key={sale.id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {sale.id?.slice(-6).toUpperCase()}
                  </td>
                  <td>{new Date(sale.createdAt).toLocaleString()}</td>
                  <td>
                    {sale.items?.map(i => (
                      <div key={i.id} style={{ fontSize: '0.85rem' }}>
                        {i.quantity}x {i.product?.name || 'Producto'}
                      </div>
                    ))}
                  </td>
                  <td>Q{sale.totalAmount?.toFixed(2)}</td>
                  <td style={{ color: sale.discount > 0 ? 'var(--warning-color)' : 'inherit' }}>
                    {sale.discount > 0 ? `-Q${sale.discount.toFixed(2)}` : '-'}
                  </td>
                  <td style={{ fontWeight: 'bold' }}>Q{sale.finalAmount?.toFixed(2)}</td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      backgroundColor: 'rgba(0, 117, 255, 0.15)',
                      color: 'var(--primary-color)'
                    }}>
                      {methodLabels[sale.paymentMethod] || sale.paymentMethod}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr><td colSpan="7" style={{textAlign:'center', padding: '2rem'}}>
                  {filterDate ? 'No hay ventas para esta fecha' : 'No hay ventas registradas'}
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
