'use client';

import { useEffect, useState } from 'react';
import { DollarSign, FileText, Activity, Package, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar datos');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.2)', borderTop: '3px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
        <p>Cargando dashboard...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ color: 'var(--danger-color)', textAlign: 'center', marginTop: '2rem' }}>
      <AlertTriangle size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
      <h3>Error al cargar el dashboard</h3>
      <p>{error}</p>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>Reintentar</button>
    </div>
  );

  return (
    <div style={{ color: 'white' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'white' }}>Resumen General</h2>
      
      {/* Top Cards */}
      <div className="grid grid-cols-4 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="m-0" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ventas Hoy</p>
              <h3 className="m-0 mt-1" style={{ fontSize: '1.5rem', color: 'white' }}>Q {data?.salesToday?.total?.toFixed(2) || '0.00'}</h3>
            </div>
            <div className="nav-icon-container" style={{ width: '45px', height: '45px', background: 'var(--success-color)', color: 'white', borderRadius: '12px' }}>
              <DollarSign size={24} />
            </div>
          </div>
          <p className="m-0" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {data?.salesToday?.count || 0} transacciones hoy
          </p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="m-0" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Ventas</p>
              <h3 className="m-0 mt-1" style={{ fontSize: '1.5rem', color: 'white' }}>Q {data?.totalMetrics?.totalVentas}</h3>
            </div>
            <div className="nav-icon-container" style={{ width: '45px', height: '45px', background: 'var(--primary-color)', color: 'white', borderRadius: '12px' }}>
              <FileText size={24} />
            </div>
          </div>
          <p className="m-0" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {data?.totalMetrics?.facturas} facturas totales
          </p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="m-0" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Promedio por Venta</p>
              <h3 className="m-0 mt-1" style={{ fontSize: '1.5rem', color: 'white' }}>Q {data?.totalMetrics?.promedioFactura}</h3>
            </div>
            <div className="nav-icon-container" style={{ width: '45px', height: '45px', background: '#4318FF', color: 'white', borderRadius: '12px' }}>
              <Activity size={24} />
            </div>
          </div>
          <p className="m-0" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Total Gastos: Q {data?.totalMetrics?.totalGastado}
          </p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="m-0" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Productos</p>
              <h3 className="m-0 mt-1" style={{ fontSize: '1.5rem', color: 'white' }}>{data?.totalMetrics?.totalProductos || 0}</h3>
            </div>
            <div className="nav-icon-container" style={{ width: '45px', height: '45px', background: '#02D4E3', color: 'white', borderRadius: '12px' }}>
              <Package size={24} />
            </div>
          </div>
          <p className="m-0" style={{ fontSize: '0.8rem', color: data?.totalCreditsActive > 0 ? 'var(--warning-color)' : 'var(--text-secondary)' }}>
            Créditos activos: Q {(data?.totalCreditsActive || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {data?.lowStockProducts?.length > 0 && (
        <div className="glass-panel p-6 mb-4" style={{ borderLeft: '4px solid var(--warning-color)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--warning-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} /> Productos con Bajo Stock
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {data.lowStockProducts.map(p => (
              <div key={p.id} style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: 'var(--radius-md)', 
                background: 'rgba(245, 198, 67, 0.1)',
                border: '1px solid rgba(245, 198, 67, 0.3)',
                fontSize: '0.9rem'
              }}>
                <strong>{p.name}</strong>
                <span style={{ color: 'var(--danger-color)', marginLeft: '0.5rem', fontWeight: 'bold' }}>
                  Stock: {p.stock} / Min: {p.minStock}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-2 mt-4" style={{ gap: '1.5rem', gridTemplateColumns: 'minmax(300px, 2fr) minmax(250px, 1fr)' }}>
        <div className="glass-panel p-6" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: 0, color: 'white' }}>Evolución de Gastos</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Por mes</p>
          <div style={{ flex: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.chartData?.area} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0075FF" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#0075FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#A0AEC0" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis stroke="#A0AEC0" tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111C44', border: 'none', borderRadius: '8px', color: 'white' }} 
                  itemStyle={{ color: 'white' }}
                  formatter={(value) => [`Q ${value}`, 'Gastos']}
                />
                <Area type="monotone" dataKey="val" stroke="#0075FF" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="glass-panel p-6" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: 0, color: 'white', marginBottom: '1.5rem' }}>Gastos por Categoría</h3>
          <div style={{ flex: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.chartData?.bar} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#A0AEC0" tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#111C44', border: 'none', borderRadius: '8px', color: 'white' }}
                  formatter={(value) => [`Q ${value}`, 'Total']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={10}>
                  {data?.chartData?.bar?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      {data?.recentSales?.length > 0 && (
        <div className="glass-panel p-6 mt-4">
          <h3 style={{ margin: '0 0 1rem 0', color: 'white' }}>Ventas Recientes</h3>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Artículos</th>
                <th>Total</th>
                <th>Método</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSales.map(sale => (
                <tr key={sale.id}>
                  <td>{new Date(sale.createdAt).toLocaleString()}</td>
                  <td>
                    {sale.items?.map(i => (
                      <div key={i.id} style={{ fontSize: '0.85rem' }}>
                        {i.quantity}x {i.product?.name || 'Producto'}
                      </div>
                    ))}
                  </td>
                  <td style={{ fontWeight: 'bold' }}>Q{sale.finalAmount?.toFixed(2)}</td>
                  <td>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', backgroundColor: 'rgba(0, 117, 255, 0.15)', color: 'var(--primary-color)' }}>
                      {sale.paymentMethod === 'CASH' ? 'Efectivo' : sale.paymentMethod === 'CARD' ? 'Tarjeta' : sale.paymentMethod === 'TRANSFER' ? 'Transferencia' : sale.paymentMethod}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
