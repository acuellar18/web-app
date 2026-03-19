'use client';

import { useState, useEffect } from 'react';
import { WalletCards, TrendingDown, TrendingUp, Lock, Unlock, Plus } from 'lucide-react';

export default function FinancePage() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseData, setExpenseData] = useState({ description: '', amount: '', category: 'OTHER' });
  
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [incomeData, setIncomeData] = useState({ description: '', amount: '', source: 'OTHER' });
  
  const [registerForm, setRegisterForm] = useState({ openingAmount: '', actualTotal: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [incRes, expRes, cashRes] = await Promise.all([
        fetch('/api/income').then(r => r.ok ? r.json() : []),
        fetch('/api/expenses').then(r => r.ok ? r.json() : []),
        fetch('/api/cash').then(r => r.ok ? r.json() : [])
      ]);
      setIncomes(Array.isArray(incRes) ? incRes : []);
      setExpenses(Array.isArray(expRes) ? expRes : []);
      setRegisters(Array.isArray(cashRes) ? cashRes : []);
    } catch (err) {
      console.error('Error loading finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openRegister = registers.find(r => r.status === 'OPEN');

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      if (!res.ok) throw new Error('Error al guardar gasto');
      alert('✅ Gasto registrado');
      setShowExpenseForm(false);
      setExpenseData({ description: '', amount: '', category: 'OTHER' });
      fetchData();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomeData)
      });
      if (!res.ok) throw new Error('Error al guardar ingreso');
      alert('✅ Ingreso registrado');
      setShowIncomeForm(false);
      setIncomeData({ description: '', amount: '', source: 'OTHER' });
      fetchData();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  const handleOpenRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'OPEN', openingAmount: registerForm.openingAmount })
      });
      if (!res.ok) throw new Error('Error al abrir caja');
      alert('✅ Caja abierta correctamente');
      setRegisterForm({ openingAmount: '', actualTotal: '' });
      fetchData();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  const handleCloseRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLOSE', actualTotal: registerForm.actualTotal })
      });
      if (!res.ok) throw new Error('Error al cerrar caja');
      alert('✅ Caja cerrada correctamente');
      setRegisterForm({ openingAmount: '', actualTotal: '' });
      fetchData();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalIncomes = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Cargando datos financieros...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 m-0"><WalletCards /> Caja y Finanzas</h2>

      {/* Cash Register Panel */}
      <div className="glass-panel p-6 mb-4">
        <h3 className="mb-4">Control de Caja (Sencillo)</h3>
        {openRegister ? (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div className="flex gap-4 items-center justify-between" style={{ flexWrap: 'wrap' }}>
              <div>
                <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--success-color)' }}><Unlock size={20} /> <span style={{fontWeight: 'bold'}}>CAJA ABIERTA</span></div>
                <div style={{ marginBottom: '0.5rem' }}>Apertura: <strong>Q{openRegister.openingAmount?.toFixed(2)}</strong></div>
                <div>Esperado en Caja: <strong>Q{(openRegister.expectedTotal || openRegister.openingAmount)?.toFixed(2)}</strong> <span style={{fontSize:'0.8rem', color: 'var(--text-secondary)'}}>(Sencillo + Ventas en Efectivo)</span></div>
              </div>
              
              <form onSubmit={handleCloseRegister} className="flex gap-2 items-end" style={{ flexWrap: 'wrap' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{marginBottom: '0.2rem'}}>Efectivo Real en Caja (Q)</label>
                  <input required type="number" step="0.01" min="0" value={registerForm.actualTotal} onChange={e => setRegisterForm({...registerForm, actualTotal: e.target.value})} placeholder="Contar efectivo..." />
                </div>
                <button type="submit" className="btn btn-primary"><Lock size={18} /> Cerrar Caja</button>
              </form>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              No hay caja abierta. Ingresa el monto inicial (sencillo) para abrir una nueva sesión de caja.
            </p>
            <form onSubmit={handleOpenRegister} className="flex gap-4 items-end">
               <div className="form-group" style={{ marginBottom: 0, flex: 1, maxWidth: '300px' }}>
                 <label className="form-label">Monto de Apertura (Q)</label>
                 <input required type="number" step="0.01" min="0" value={registerForm.openingAmount} onChange={e => setRegisterForm({...registerForm, openingAmount: e.target.value})} placeholder="Ej: 200.00" />
               </div>
               <button type="submit" className="btn btn-success"><Unlock size={18} /> Abrir Caja</button>
            </form>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="glass-panel p-6" style={{ borderLeft: '4px solid var(--danger-color)' }}>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>Total Gastos</p>
          <h3 style={{ margin: '0.25rem 0 0 0', color: 'var(--danger-color)', fontSize: '1.5rem' }}>Q{totalExpenses.toFixed(2)}</h3>
        </div>
        <div className="glass-panel p-6" style={{ borderLeft: '4px solid var(--success-color)' }}>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>Total Ingresos Extra</p>
          <h3 style={{ margin: '0.25rem 0 0 0', color: 'var(--success-color)', fontSize: '1.5rem' }}>Q{totalIncomes.toFixed(2)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Expenses */}
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="m-0 flex items-center gap-2" style={{ color: 'var(--danger-color)' }}><TrendingDown /> Gastos</h3>
            <button className="btn" style={{backgroundColor: 'var(--danger-color)', color: 'white', padding: '0.3rem 0.75rem'}} onClick={() => setShowExpenseForm(!showExpenseForm)}>
              <Plus size={16} /> Gasto
            </button>
          </div>
          
          {showExpenseForm && (
            <form onSubmit={handleExpenseSubmit} className="mb-4 p-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)' }}>
              <div className="form-group">
                <input required placeholder="Descripción del gasto" value={expenseData.description} onChange={e => setExpenseData({...expenseData, description: e.target.value})} />
              </div>
              <div className="flex gap-2">
                <input required type="number" step="0.01" min="0.01" placeholder="Monto (Q)" value={expenseData.amount} onChange={e => setExpenseData({...expenseData, amount: e.target.value})} />
                <select value={expenseData.category} onChange={e => setExpenseData({...expenseData, category: e.target.value})}>
                  <option value="INVENTORY">Inventario</option>
                  <option value="BILLS">Servicios Básicos</option>
                  <option value="SALARY">Salarios</option>
                  <option value="OTHER">Otro</option>
                </select>
                <button type="submit" className="btn btn-danger">Guardar</button>
              </div>
            </form>
          )}
          
          <div className="table-container" style={{maxHeight: '350px', overflowY: 'auto'}}>
            <table>
              <tbody>
                {expenses.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)' }}>No hay gastos registrados</td></tr>
                )}
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(e.date).toLocaleDateString()}</td>
                    <td>{e.description} <span style={{fontSize:'0.7rem', color:'var(--text-secondary)'}}>({e.category === 'INVENTORY' ? 'Inventario' : e.category === 'BILLS' ? 'Servicios' : e.category === 'SALARY' ? 'Salarios' : 'Otro'})</span></td>
                    <td style={{fontWeight: 'bold', textAlign: 'right', color: 'var(--danger-color)'}}>Q{e.amount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Incomes */}
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="m-0 flex items-center gap-2" style={{ color: 'var(--success-color)' }}><TrendingUp /> Ingresos Extra</h3>
            <button className="btn" style={{backgroundColor: 'var(--success-color)', color: 'white', padding: '0.3rem 0.75rem'}} onClick={() => setShowIncomeForm(!showIncomeForm)}>
              <Plus size={16} /> Ingreso
            </button>
          </div>

          {showIncomeForm && (
            <form onSubmit={handleIncomeSubmit} className="mb-4 p-4" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)' }}>
              <div className="form-group">
                <input required placeholder="Descripción del ingreso" value={incomeData.description} onChange={e => setIncomeData({...incomeData, description: e.target.value})} />
              </div>
              <div className="flex gap-2">
                <input required type="number" step="0.01" min="0.01" placeholder="Monto (Q)" value={incomeData.amount} onChange={e => setIncomeData({...incomeData, amount: e.target.value})} />
                <button type="submit" className="btn btn-success">Guardar</button>
              </div>
            </form>
          )}

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>Abonos de créditos y otros ingresos se muestran aquí.</p>
           
          <div className="table-container" style={{maxHeight: '350px', overflowY: 'auto'}}>
            <table>
              <tbody>
                {incomes.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)' }}>No hay ingresos registrados</td></tr>
                )}
                {incomes.map(i => (
                  <tr key={i.id}>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(i.date).toLocaleDateString()}</td>
                    <td>{i.description}</td>
                    <td style={{fontWeight: 'bold', textAlign: 'right', color: 'var(--success-color)'}}>Q{i.amount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cash Register History */}
      {registers.length > 0 && (
        <div className="glass-panel p-6 mt-4">
          <h3 className="mb-4">Historial de Caja</h3>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Apertura</th>
                <th>Esperado</th>
                <th>Real</th>
                <th>Diferencia</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {registers.map(r => {
                const diff = r.status === 'CLOSED' && r.actualTotal != null && r.expectedTotal != null
                  ? (r.actualTotal - r.expectedTotal) : null;
                return (
                  <tr key={r.id}>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td>Q{r.openingAmount?.toFixed(2)}</td>
                    <td>Q{(r.expectedTotal || r.openingAmount)?.toFixed(2)}</td>
                    <td>{r.actualTotal != null ? `Q${r.actualTotal.toFixed(2)}` : '-'}</td>
                    <td style={{ color: diff != null ? (diff >= 0 ? 'var(--success-color)' : 'var(--danger-color)') : 'inherit', fontWeight: diff != null ? 'bold' : 'normal' }}>
                      {diff != null ? `${diff >= 0 ? '+' : ''}Q${diff.toFixed(2)}` : '-'}
                    </td>
                    <td>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', backgroundColor: r.status === 'OPEN' ? 'var(--success-color)' : 'var(--text-secondary)', color: 'white' }}>
                        {r.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
