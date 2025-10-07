import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from '../../assets/logoOriginal.png';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar bg-blue-600 text-white p-4 shadow-lg">
      <div className="navbar-container max-w-6xl mx-auto flex justify-between items-center">
        <div className="navbar-brand">
          <img src={logo} alt="Logo" width={150} />
        </div>
        
        <div className="navbar-menu flex gap-4">
          <Link
            to="/"
            className={`navbar-link px-4 py-2 rounded transition-colors ${
              location.pathname === '/' 
                ? 'bg-blue-800 text-white' 
                : 'text-blue-100 hover:bg-blue-700 hover:text-white'
            }`}
          >
            Lista de Colaboradores
          </Link>
          
          <Link
            to="/nova-pagina"
            className={`navbar-link px-4 py-2 rounded transition-colors ${
              location.pathname === '/nova-pagina' 
                ? 'bg-blue-800 text-white' 
                : 'text-blue-100 hover:bg-blue-700 hover:text-white'
            }`}
          >
            Relatorio Novos Cadastros
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;