import { useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    api.post('/auth/login', { email, password })
      .then((res) => {
        login(res.data.token, res.data.user);
        navigate('/articles');
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Connexion impossible');
      });
  };

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <h2 className="mb-3">Connexion</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Se connecter
            </button>
          </form>

          <p className="mt-3 text-center">
            Pas encore de compte ? <Link to="/signup">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
