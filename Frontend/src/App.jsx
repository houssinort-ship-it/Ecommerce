import { Navigate, Routes, Route } from 'react-router';
import ListArticles from './components/ListArticles';
import AddArticle from './components/AddArticle';
import EditArticle from './components/EditArticle';
import Login from './components/Login';
import Signup from './components/Signup';
import Menu from './Menu';
import { useAuth } from './context/AuthContext';

// Pages réservées aux utilisateurs connectés (le backend vérifie aussi le token)
function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <>
      <Menu />
      <Routes>
        <Route path="/" element={<ListArticles />} />
        <Route path="/articles" element={<ListArticles />} />
        <Route
          path="/addArticle"
          element={
            <RequireAuth>
              <AddArticle />
            </RequireAuth>
          }
        />
        <Route
          path="/editArticle/:id"
          element={
            <RequireAuth>
              <EditArticle />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<h2 className="container my-3">Page introuvable</h2>} />
      </Routes>
    </>
  );
}

export default App;
