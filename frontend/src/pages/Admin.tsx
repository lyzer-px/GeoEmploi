import { useState } from "react";
import MyHeader from "../Header";
import Footer from "../Footer";

type User = {
  id: number;
  name: string;
  email: string;
};

type JobOffer = {
  id: number;
  title: string;
  location: string;
};

function Admin() {
  const [selectedType, setSelectedType] = useState<"users" | "job-offers">(
    "users"
  );

  const [selectedItem, setSelectedItem] = useState<User | JobOffer | null>(
    null
  );

  const [actionTop, setActionTop] = useState(0);

  const users: User[] = [
    {
      id: 1,
      name: "Utilisateur 1",
      email: "user1@email.com",
    },
    {
      id: 2,
      name: "Utilisateur 2",
      email: "user2@email.com",
    },
    {
      id: 3,
      name: "Utilisateur 3",
      email: "user3@email.com",
    },
    {
      id: 4,
      name: "Utilisateur 4",
      email: "user4@email.com",
    },
    {
      id: 5,
      name: "Utilisateur 5",
      email: "user5@email.com",
    },
  ];

  const jobOffers: JobOffer[] = [
    {
      id: 1,
      title: "Développeur Python",
      location: "Paris · CDI",
    },
    {
      id: 2,
      title: "Développeur React",
      location: "Lyon · Stage",
    },
    {
      id: 3,
      title: "Data Analyst",
      location: "Toulouse · CDI",
    },
    {
      id: 4,
      title: "Ingénieur Backend",
      location: "Nantes · CDI",
    },
    {
      id: 5,
      title: "Développeur Full Stack",
      location: "Bordeaux · CDD",
    },
  ];

  const currentItems: User[] | JobOffer[] =
    selectedType === "users" ? users : jobOffers;

  const handleTypeChange = (type: "users" | "job-offers") => {
    setSelectedType(type);
    setSelectedItem(null);
  };

  const handleItemClick = (
    item: User | JobOffer,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const element = event.currentTarget;

    setSelectedItem(item);

    setActionTop(element.offsetTop + element.offsetHeight / 2);
  };

  return (
    <div className="app-layout">
      <MyHeader />

      <main className="admin-page">
        <div className="admin-content">
          <p className="admin-kicker">Administration</p>

          <h1>Panneau d’administration</h1>

          <div className="admin-box">
            <div className="admin-dashboard">

              {/* =========================
                  CATEGORY SELECTOR
                  ========================= */}

              <div className="admin-selector">
                <p className="admin-selector-title">
                  Changer la catégorie
                </p>

                <div className="admin-category-buttons">
                  <button
                    type="button"
                    className={
                      selectedType === "users"
                        ? "admin-category-button active"
                        : "admin-category-button"
                    }
                    onClick={() => handleTypeChange("users")}
                  >
                    Utilisateurs
                  </button>

                  <button
                    type="button"
                    className={
                      selectedType === "job-offers"
                        ? "admin-category-button active"
                        : "admin-category-button"
                    }
                    onClick={() => handleTypeChange("job-offers")}
                  >
                    Offres d'emploi
                  </button>
                </div>

                {/* =========================
                    STATISTICS
                    ========================= */}

                <div className="admin-stats">
                  <h2>Statistiques</h2>

                  {selectedType === "users" ? (
                    <>
                      <div className="admin-stat">
                        <span>Utilisateurs</span>
                        <strong>1 248</strong>
                      </div>

                      <div className="admin-stat">
                        <span>Administrateurs</span>
                        <strong>12</strong>
                      </div>

                      <div className="admin-stat">
                        <span>Actifs</span>
                        <strong>1 164</strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="admin-stat">
                        <span>Offres actives</span>
                        <strong>342</strong>
                      </div>

                      <div className="admin-stat">
                        <span>Offres expirées</span>
                        <strong>28</strong>
                      </div>

                      <div className="admin-stat">
                        <span>Publiées ce mois</span>
                        <strong>51</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* =========================
                  USERS / OFFERS
                  ========================= */}

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
                  {currentItems.map((item) => (
                    <div
                      key={item.id}
                      className={`admin-user ${
                        selectedItem?.id === item.id ? "selected" : ""
                      }`}
                      onClick={(event) => handleItemClick(item, event)}
                    >
                      <div className="admin-user-avatar">
                        {selectedType === "users" ? "◯" : "💼"}
                      </div>

                      <div className="admin-user-info">
                        <strong>
                          {selectedType === "users"
                            ? (item as User).name
                            : (item as JobOffer).title}
                        </strong>

                        <span>
                          {selectedType === "users"
                            ? (item as User).email
                            : (item as JobOffer).location}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* =========================
                    ACTIONS BUBBLE
                    ========================= */}

                {selectedItem && (
                  <div
                    className="admin-actions"
                    style={{
                      top: `${actionTop}px`,
                    }}
                  >
                    {selectedType === "users" ? (
                      <>
                        <button type="button">
                          Changer le rôle
                        </button>

                        <button type="button">
                          Supprimer l'utilisateur
                        </button>

                        <button type="button">
                          Modifier l'utilisateur
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button">
                          Supprimer l'offre
                        </button>

                        <button type="button">
                          Modifier l'offre
                        </button>
                      </>
                    )}
                  </div>
                )}
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