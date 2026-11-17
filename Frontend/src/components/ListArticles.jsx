import { useEffect, useState } from 'react';
import api from '../api';
import ElementsArticle from './ElementsArticle';

function ListArticles() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    api.get('/articles')
      .then((response) => setArticles(response.data))
      .catch((error) => console.log(error));
  }, []);

  const deleteProd = (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet article ?')) {
      return;
    }
    api.delete('/articles/' + id)
      .then(() => {
        console.log('Suppression effectuée !');
        setArticles((prevArticles) =>
          prevArticles.filter((article) => article._id !== id)
        );
      })
      .catch((error) => {
        console.log(error);
        alert('Erreur ! Suppression non effectuée');
      });
  };

  return (
    <div className="container my-3">
      <h2>Liste des articles</h2>
      <ElementsArticle articles={articles} deleteProd={deleteProd} />
    </div>
  );
}

export default ListArticles;
