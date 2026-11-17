import { useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router';

function Signup() {
  const navigate = useNavigate();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    api.post('/auth/register', { nom, email, password })
      .then(() => navigate('/login'))
      .catch((err) => {
        setError(err.response?.data?.message || 'Inscription impossible');
      });
  };

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <h2 className="mb-3">Inscription</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="nom" className="form-label">Nom</label>
              <input
                id="nom"
                type="text"
                className="form-control"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirm" className="form-label">Confirmer le mot de passe</label>
              <input
                id="confirm"
                type="password"
                className="form-control"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-success w-100">
              Créer mon compte
            </button>
          </form>

          <p className="mt-3 text-center">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;