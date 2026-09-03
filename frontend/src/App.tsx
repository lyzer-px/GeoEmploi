import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import { ROUTES } from './routes';

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>ChomageGO</h1>

      <button onClick={() => navigate(ROUTES.LOGIN)}>
        Aller vers la page de connexion
      </button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
