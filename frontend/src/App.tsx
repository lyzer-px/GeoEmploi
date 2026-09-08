import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Admin from './pages/Admin/Admin';
import About from './pages/About';
import Transparency from './pages/Transparency';
import ProfilePage from './pages/ProfilePage';
import HomePage from './HomePage';
import { ROUTES } from './routes';
import MyHeader from './Header';
import Footer from './Footer';
import CGU from './pages/CGU';
import './App.css'
import EmployerPage from './pages/Employer';

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
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.ADMIN} element={<Admin />} />
        <Route path={ROUTES.ABOUT} element={<About />} />
        <Route path={ROUTES.TRANSPARENCY} element={<Transparency />} />
        <Route path={ROUTES.CGU} element={<CGU />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.EMPLOYER} element={<EmployerPage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
