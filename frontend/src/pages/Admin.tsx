import { useEffect, useState } from "react";
import MyHeader from "../Header";
import Footer from "../Footer";

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

type JobOffer = {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  contract_type: string;
  adress: string;
  geocoding_source: string;
  geocoding_score: number;
  latitude: number;
  longitude: number;
  employer_id: number;
  created_at: string;
  updated_at: string;
};

type SelectedType = "users" | "job-offers";

function Admin() {
  const [selectedType, setSelectedType] =
    useState<SelectedType>("users");

  const [users, setUsers] = useState<User[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [selectedJobOffer, setSelectedJobOffer] =
    useState<JobOffer | null>(null);

  const [actionTop, setActionTop] = useState(0);

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [loadingJobOffers, setLoadingJobOffers] =
    useState(true);

  const [usersError, setUsersError] =
    useState<string | null>(null);

  const [jobOffersError, setJobOffersError] =
    useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setUsersError(null);

        const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/api/v1/users/`);

        if (!response.ok) {
          throw new Error(
            `Erreur HTTP ${response.status}`
          );
        }

        const data: User[] = await response.json();

        setUsers(data);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des utilisateurs :",
          error
        );

        setUsersError(
          "Impossible de charger les utilisateurs."
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchJobOffers = async () => {
      try {
        setLoadingJobOffers(true);
        setJobOffersError(null);

        const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/api/v1/offers/`);

        if (!response.ok) {
          throw new Error(
            `Erreur HTTP ${response.status}`
          );
        }

        const data: JobOffer[] = await response.json();

        setJobOffers(data);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des offres :",
          error
        );

        setJobOffersError(
          "Impossible de charger les offres d'emploi."
        );
      } finally {
        setLoadingJobOffers(false);
      }
    };

    fetchJobOffers();
  }, []);

  const handleTypeChange = (type: SelectedType) => {
    setSelectedType(type);
    setSelectedUser(null);
    setSelectedJobOffer(null);
  };

  const handleUserClick = (
    user: User,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (selectedUser?.id === user.id) {
      setSelectedUser(null);
      return;
    }

    setSelectedUser(user);
    setSelectedJobOffer(null);

    const element = event.currentTarget;

    setActionTop(
      element.offsetTop +
      element.offsetHeight / 2
    );
  };

  const handleJobOfferClick = (
    offer: JobOffer,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (selectedJobOffer?.id === offer.id) {
      setSelectedJobOffer(null);
      return;
    }

    setSelectedJobOffer(offer);
    setSelectedUser(null);

    const element = event.currentTarget;

    setActionTop(
      element.offsetTop +
      element.offsetHeight / 2
    );
  };

  return (
    <div className="app-layout">
      <MyHeader />

      <main className="admin-page">
        <div className="admin-content">
          <p className="admin-kicker">
            Administration
          </p>

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
                    onClick={() =>
                      handleTypeChange("users")
                    }
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
                    onClick={() =>
                      handleTypeChange("job-offers")
                    }
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

                        <strong>
                          {loadingUsers
                            ? "..."
                            : users.length}
                        </strong>
                      </div>

                      <div className="admin-stat">
                        <span>Administrateurs</span>

                        <strong>
                          -
                        </strong>
                      </div>

                      <div className="admin-stat">
                        <span>Actifs</span>

                        <strong>
                          -
                        </strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="admin-stat">
                        <span>Offres</span>

                        <strong>
                          {loadingJobOffers
                            ? "..."
                            : jobOffers.length}
                        </strong>
                      </div>

                      <div className="admin-stat">
                        <span>Offres actives</span>

                        <strong>
                          -
                        </strong>
                      </div>

                      <div className="admin-stat">
                        <span>Publiées ce mois</span>

                        <strong>
                          -
                        </strong>
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

                  {/* USERS */}

                  {selectedType === "users" && (
                    <>
                      {loadingUsers && (
                        <div className="admin-user">
                          <div className="admin-user-info">
                            <span>
                              Chargement des utilisateurs...
                            </span>
                          </div>
                        </div>
                      )}

                      {!loadingUsers &&
                        usersError && (
                          <div className="admin-user">
                            <div className="admin-user-info">
                              <strong>
                                Erreur
                              </strong>

                              <span>
                                {usersError}
                              </span>
                            </div>
                          </div>
                        )}

                      {!loadingUsers &&
                        !usersError &&
                        users.length === 0 && (
                          <div className="admin-user">
                            <div className="admin-user-info">
                              <span>
                                Aucun utilisateur trouvé.
                              </span>
                            </div>
                          </div>
                        )}

                      {!loadingUsers &&
                        !usersError &&
                        users.map((user) => (
                          <div
                            key={user.id}
                            className={`admin-user ${selectedUser?.id ===
                                user.id
                                ? "selected"
                                : ""
                              }`}
                            onClick={(event) =>
                              handleUserClick(
                                user,
                                event
                              )
                            }
                          >
                            <div className="admin-user-avatar">
                              ◯
                            </div>

                            <div className="admin-user-info">
                              <strong>
                                {user.first_name}{" "}
                                {user.last_name}
                              </strong>

                              <span>
                                {user.email}
                              </span>
                            </div>
                          </div>
                        ))}
                    </>
                  )}

                  {/* JOB OFFERS */}

                  {selectedType === "job-offers" && (
                    <>
                      {loadingJobOffers && (
                        <div className="admin-user">
                          <div className="admin-user-info">
                            <span>
                              Chargement des offres...
                            </span>
                          </div>
                        </div>
                      )}

                      {!loadingJobOffers &&
                        jobOffersError && (
                          <div className="admin-user">
                            <div className="admin-user-info">
                              <strong>
                                Erreur
                              </strong>

                              <span>
                                {jobOffersError}
                              </span>
                            </div>
                          </div>
                        )}

                      {!loadingJobOffers &&
                        !jobOffersError &&
                        jobOffers.length === 0 && (
                          <div className="admin-user">
                            <div className="admin-user-info">
                              <span>
                                Aucune offre trouvée.
                              </span>
                            </div>
                          </div>
                        )}

                      {!loadingJobOffers &&
                        !jobOffersError &&
                        jobOffers.map((offer) => (
                          <div
                            key={offer.id}
                            className={`admin-user ${selectedJobOffer?.id === offer.id
                                ? "selected"
                                : ""
                              }`}
                            onClick={(event) =>
                              handleJobOfferClick(offer, event)
                            }
                          >
                            <div className="admin-user-avatar">
                              💼
                            </div>

                            <div className="admin-user-info">
                              <strong>
                                {offer.name}
                              </strong>

                              <span>
                                {offer.adress} · {offer.contract_type}
                              </span>
                            </div>
                          </div>
                        ))}
                    </>
                  )}
                </div>

                {/* =========================
                    ACTIONS BUBBLE
                    ========================= */}

                {selectedType === "users" &&
                  selectedUser && (
                    <div
                      className="admin-actions"
                      style={{
                        top: `${actionTop}px`,
                      }}
                    >
                      <button type="button">
                        Changer le rôle
                      </button>

                      <button type="button">
                        Supprimer l'utilisateur
                      </button>

                      <button type="button">
                        Modifier l'utilisateur
                      </button>
                    </div>
                  )}

                {selectedType === "job-offers" &&
                  selectedJobOffer && (
                    <div
                      className="admin-actions"
                      style={{
                        top: `${actionTop}px`,
                      }}
                    >
                      <button type="button">
                        Supprimer l'offre
                      </button>

                      <button type="button">
                        Modifier l'offre
                      </button>
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