import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router';

function EditArticle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [reference, setReference] = useState('');
  const [designation, setDesignation] = useState('');
  const [marque, setMarque] = useState('');
  const [prix, setPrix] = useState('');
  const [qtestock, setQtestock] = useState('');
  const [imageart, setImageart] = useState('');
  const [scategorieID, setScategorieID] = useState('');
  const [scategories, setScategories] = useState([]);

  useEffect(() => {
    // 1. les sous-catégories pour la liste déroulante
    api.get('/scategories')
      .then((res) => setScategories(res.data))
      .catch((error) => console.log(error));

    // 2. l'article à modifier, pour pré-remplir le formulaire
    api.get('/articles/' + id)
      .then((res) => {
        setReference(res.data.reference ?? '');
        setDesignation(res.data.designation ?? '');
        setMarque(res.data.marque ?? '');
        setPrix(res.data.prix ?? '');
        setQtestock(res.data.qtestock ?? '');
        setImageart(res.data.imageart ?? '');
        // scategorieID est un identifiant, ou un objet si le backend fait un populate
        setScategorieID(res.data.scategorieID?._id ?? res.data.scategorieID ?? '');
      })
      .catch((error) => console.log(error));
  }, [id]);

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

    api.put('/articles/' + id, newProduct)
      .then((res) => {
        console.log(res.data);
        navigate('/articles');
      })
      .catch((error) => {
        console.log(error);
        alert('Erreur ! Modification non effectuée');
      });
  };

  return (
    <div className="container my-3">
      <h2>Modification d'un produit</h2>
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

export default EditArticle;
