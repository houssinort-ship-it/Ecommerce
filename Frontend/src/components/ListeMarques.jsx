import { useEffect, useState } from "react";
import { callTool } from "../services/mcpService";

// Liste des marques, récupérée via le serveur MCP (tool "list_marques")
function ListeMarques() {
  const [marques, setMarques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    callTool("list_marques")
      .then((data) => setMarques(Array.isArray(data) ? data : []))
      .catch((err) => setErreur(err.message || "Impossible de charger les marques"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="container my-3">Chargement des marques…</p>;
  if (erreur) {
    return (
      <div className="container my-3">
        <div className="alert alert-danger mb-0">{erreur}</div>
      </div>
    );
  }

  return (
    <div className="container my-3">
      <h2 className="mb-3">Liste des marques</h2>
      {marques.length === 0 ? (
        <p className="text-muted">Aucune marque enregistrée.</p>
      ) : (
        <ul className="list-group">
          {marques.map((m) => (
            <li className="list-group-item" key={m}>
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListeMarques;
