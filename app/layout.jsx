import './globals.css';
import Sidebar from '@/app/components/Sidebar';

export const metadata = {
  title: 'Tienda Miscelanea Regalito de Dios',
  description: 'Sistema de gestión de inventario y ventas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
