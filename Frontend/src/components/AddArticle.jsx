import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router';

function AddArticle() {
  const navigate = useNavigate();
  const [reference, setReference] = useState('');
  const [designation, setDesignation] = useState('');
  const [marque, setMarque] = useState('');
  const [prix, setPrix] = useState('');
  const [qtestock, setQtestock] = useState('');
  const [imageart, setImageart] = useState('');
  const [scategorieID, setScategorieID] = useState('');
  const [scategories, setScategories] = useState([]);

  // Charger les sous-catégories pour la liste déroulante
  useEffect(() => {
    api.get('/scategories')
      .then((res) => setScategories(res.data))
      .catch((error) => console.log(error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      reference,
      designation,
      marque,
      prix: Number(prix),
      qtestock: Number(qtestock),
      imageart,
      scategorieID,
    };

    // Ajout dans la base (MongoDB génère le _id automatiquement)
    api.post('/articles', newProduct)
      .then((res) => {
        console.log(res.data);
        navigate('/articles');
      })
      .catch((error) => {
        console.log(error);
        alert('Erreur ! Insertion non effectuée');
      });
  };

  return (
    <div className="container my-3">
      <h2>Ajout d'un produit</h2>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Référence"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Désignation"
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Marque"
              type="text"
              value={marque}
              onChange={(e) => setMarque(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Prix"
              type="number" step="0.01"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Quantité"
              type="number"
              value={qtestock}
              onChange={(e) => setQtestock(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <select
              className="form-select"
              value={scategorieID}
              onChange={(e) => setScategorieID(e.target.value)}
              required
            >
              <option value="">-- Sous-catégorie --</option>
              {scategories.map((scat) => (
                <option key={scat._id} value={scat._id}>{scat.nomscategorie}</option>
              ))}
            </select>
          </div>
          <div className="col-12">
            <input
              className="form-control"
              placeholder="Image (URL)"
              type="text"
              value={imageart}
              onChange={(e) => setImageart(e.target.value)}
              required
            />
          </div>
          <div className="col-12">
            {imageart ? <img src={imageart} alt="Aperçu" width="70" /> : null}
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-success">Valider</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddArticle;
