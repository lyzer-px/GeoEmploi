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
            <div className="admin-dashboard">

              <div className="admin-chart">
                <div className="admin-chart-circle">
                  <span>text</span>
                </div>
              </div>

              <div className="admin-users">
                <div className="admin-user">
                  <div className="admin-user-avatar">◯</div>
                  <div className="admin-user-info">
                    <strong>Utilisateur 1</strong>
                    <span>user1@email.com</span>
                  </div>
                </div>

                <div className="admin-user">
                  <div className="admin-user-avatar">◯</div>
                  <div className="admin-user-info">
                    <strong>Utilisateur 2</strong>
                    <span>user2@email.com</span>
                  </div>
                </div>

                <div className="admin-user">
                  <div className="admin-user-avatar">◯</div>
                  <div className="admin-user-info">
                    <strong>Utilisateur 3</strong>
                    <span>user3@email.com</span>
                  </div>
                </div>

                <div className="admin-user">
                  <div className="admin-user-avatar">◯</div>
                  <div className="admin-user-info">
                    <strong>Utilisateur 4</strong>
                    <span>user4@email.com</span>
                  </div>
                </div>

                <div className="admin-user">
                  <div className="admin-user-avatar">◯</div>
                  <div className="admin-user-info">
                    <strong>Utilisateur 5</strong>
                    <span>user5@email.com</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Admin;