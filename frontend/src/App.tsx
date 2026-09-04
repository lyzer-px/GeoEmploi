import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import HomePage from './HomePage';
import { ROUTES } from './routes';
import MyHeader from './Header';
import Footer from './Footer';
import './App.css'

function Home() {
  return (
    <div className="app-layout">
      <MyHeader />
      <main className="app-main">
        <HomePage />
      </main>
      <Footer />
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
