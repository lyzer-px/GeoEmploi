import MyHeader from "../Header";
import Footer from "../Footer";

function Admin() {
  return (
    <div className="app-layout">
      <MyHeader />

      <main className="admin-page">
        <div className="admin-content">
          <p className="admin-kicker">Administration</p>
          <h1>Panneau d’administration</h1>

          <div className="admin-box">
            {/* contenu du panneau ici */}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Admin;
