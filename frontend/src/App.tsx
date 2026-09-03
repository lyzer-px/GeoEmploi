import './App.css'
import Header from './Header.tsx'
import Footer from './Footer.tsx'
import HomePage from './HomePage.tsx'
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
      <>
        <Header />
        <HomePage />
        <Footer />
      </>
  )
}

export default App;