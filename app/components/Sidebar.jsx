'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, ShoppingCart, CreditCard, WalletCards, FileText, Settings } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pos', label: 'Punto de Venta', icon: ShoppingCart },
    { href: '/products', label: 'Inventario', icon: Store },
    { href: '/credits', label: 'Créditos', icon: CreditCard },
    { href: '/finance', label: 'Caja y Finanzas', icon: WalletCards },
    { href: '/reports', label: 'Reportes', icon: FileText },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-logo">
        <Store size={24} />
        <span>Regalito de Dios</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon-container">
                <Icon size={18} />
              </div>
              <span style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
