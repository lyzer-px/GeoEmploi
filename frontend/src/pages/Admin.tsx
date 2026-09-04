import { useState } from "react";
import MyHeader from "../Header";
import Footer from "../Footer";

function Admin() {
  const [selectedType, setSelectedType] = useState("users");

  return (
    <div className="app-layout">
      <MyHeader />

      <main className="admin-page">
        <div className="admin-content">
          <p className="admin-kicker">Administration</p>
          <h1>Panneau d’administration</h1>

          <div className="admin-box">
            <div className="admin-dashboard">

              {/* Sélecteur */}
              <div className="admin-selector">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="users">Utilisateurs</option>
                  <option value="job-offers">Offres d'emploi</option>
                </select>
              </div>

              {/* Liste */}
              <div className="admin-users-container">
                <input
                  type="search"
                  className="admin-user-search"
                  placeholder={
                    selectedType === "users"
                      ? "Rechercher un utilisateur..."
                      : "Rechercher une offre d'emploi..."
                  }
                />

                <div className="admin-users">

                  {/* Utilisateurs */}
                  {selectedType === "users" && (
                    <>
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
                    </>
                  )}

                  {/* Offres d'emploi */}
                  {selectedType === "job-offers" && (
                    <>
                      <div className="admin-user">
                        <div className="admin-user-avatar">💼</div>

                        <div className="admin-user-info">
                          <strong>Développeur Python</strong>
                          <span>Paris · CDI</span>
                        </div>
                      </div>

                      <div className="admin-user">
                        <div className="admin-user-avatar">💼</div>

                        <div className="admin-user-info">
                          <strong>Développeur React</strong>
                          <span>Lyon · Stage</span>
                        </div>
                      </div>

                      <div className="admin-user">
                        <div className="admin-user-avatar">💼</div>

                        <div className="admin-user-info">
                          <strong>Data Analyst</strong>
                          <span>Toulouse · CDI</span>
                        </div>
                      </div>

                      <div className="admin-user">
                        <div className="admin-user-avatar">💼</div>

                        <div className="admin-user-info">
                          <strong>Ingénieur Backend</strong>
                          <span>Nantes · CDI</span>
                        </div>
                      </div>

                      <div className="admin-user">
                        <div className="admin-user-avatar">💼</div>

                        <div className="admin-user-info">
                          <strong>Développeur Full Stack</strong>
                          <span>Bordeaux · CDD</span>
                        </div>
                      </div>
                    </>
                  )}

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