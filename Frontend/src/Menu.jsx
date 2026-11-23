import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from './context/AuthContext';

function Menu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-dark border-bottom border-body" data-bs-theme="dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Site</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/articles">Liste des articles</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/marques">Marques</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/addArticle">Ajout articles</NavLink>
            </li>
          </ul>

          <ul className="navbar-nav mb-2 mb-lg-0 align-items-lg-center">
            {user ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text me-lg-3">Bonjour, {user.nom}</span>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    onClick={handleLogout}
                  >
                    Déconnexion
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">Connexion</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/signup">Inscription</NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Menu;