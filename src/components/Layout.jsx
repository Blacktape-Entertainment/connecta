import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <main className="app-main">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
