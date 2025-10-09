import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import logo from '../../assets/logoOriginal.png';
import logoIcon from '../../assets/logoicone.svg';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    {
      path: '/',
      title: 'Relatório de Produtividade',
      icon: '👥'
    },
    {
      path: '/relatorio-novos-cadastros',
      title: 'Relatório Novos Cadastros',
      icon: '📊'
    }
  ];

  return (
    <div className={`sidebar bg-blue-600 text-white shadow-lg transition-all duration-300 flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} ${isMobile && !isCollapsed ? 'mobile-open' : ''}`}>
      {/* Header */}
      <div className="sidebar-header p-4 border-b border-blue-500">
        <div className="flex items-center justify-between">
          <div className={`logo-container ${isCollapsed ? 'justify-center' : ''} flex items-center`}>
            {isCollapsed ? (
              <img src={logoIcon} alt="Logo" className="w-8 h-8" />
            ) : (
              <img src={logo} alt="Logo" className="w-32" />
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="toggle-btn p-2 rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav flex-1 p-2">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-item flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  location.pathname === item.path 
                    ? 'bg-blue-800 shadow-md' 
                    : ''
                }`}
                title={isCollapsed ? item.title : undefined}
                onClick={() => isMobile && setIsCollapsed(true)}
              >
                <span className="icon text-xl flex-shrink-0 w-6 flex justify-center">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="nav-text ml-3 text-sm font-medium transition-transform duration-200">
                    {item.title}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="sidebar-footer p-4 border-t border-blue-500">
          <div className="text-xs text-blue-200 text-center">
            Dashboard Controladoria
            <br />
            <span className="text-blue-300">v1.0.0</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
