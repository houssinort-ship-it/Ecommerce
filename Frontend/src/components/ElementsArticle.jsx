import { Link } from 'react-router';

function ElementsArticle({ articles, deleteProd }) {
  return (
    <div className="row">
      {articles.map((article) => (
        <div key={article._id} className="col-sm-6 col-md-4 mb-4">
          <div className="card h-100" style={{ width: '18rem' }}>
            <img
              src={article.imageart}
              className="card-img-top"
              alt={article.designation}
            />
            <div className="card-body">
              <h5 className="card-title">{article.designation}</h5>
              <p className="card-text">{article.marque}</p>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">{article.prix} TND</li>
            </ul>
            <div className="card-body">
              <Link to={`/editArticle/${article._id}`} className="btn btn-primary me-2">
                Modifier
              </Link>
              <button
                type="button"
                onClick={() => deleteProd(article._id)}
                className="btn btn-danger"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ElementsArticle;
