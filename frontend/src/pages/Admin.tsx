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
  const apiUrl = import.meta.env.VITE_API_BACKEND_URL;

  const [selectedType, setSelectedType] = useState<SelectedType>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedJobOffer, setSelectedJobOffer] = useState<JobOffer | null>(null);

  const [editUser, setEditUser] = useState<User | null>(null);
  const [editJobOffer, setEditJobOffer] = useState<JobOffer | null>(null);

  const [actionTop, setActionTop] = useState(0);
  const [editing, setEditing] = useState(false);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingJobOffers, setLoadingJobOffers] = useState(true);

  const [usersError, setUsersError] = useState<string | null>(null);
  const [jobOffersError, setJobOffersError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/v1/users/`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: User[] = await response.json();
        setUsers(data);
      } catch (error) {
        console.error(error);
        setUsersError("Impossible de charger les utilisateurs.");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [apiUrl]);

  useEffect(() => {
    const fetchJobOffers = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/v1/offers/`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: JobOffer[] = await response.json();
        setJobOffers(data);
      } catch (error) {
        console.error(error);
        setJobOffersError("Impossible de charger les offres d'emploi.");
      } finally {
        setLoadingJobOffers(false);
      }
    };

    fetchJobOffers();
  }, [apiUrl]);

  const handleTypeChange = (type: SelectedType) => {
    setSelectedType(type);
    setSelectedUser(null);
    setSelectedJobOffer(null);
    setEditing(false);
    setEditUser(null);
    setEditJobOffer(null);
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
    setActionTop(event.currentTarget.offsetTop + event.currentTarget.offsetHeight / 2);
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
    setActionTop(event.currentTarget.offsetTop + event.currentTarget.offsetHeight / 2);
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
      setSelectedUser(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);
    }
  };

  const handleDeleteJobOffer = async (offerId: number) => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/offers/${offerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setJobOffers((currentOffers) =>
        currentOffers.filter((offer) => offer.id !== offerId)
      );
      setSelectedJobOffer(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'offre :", error);
    }
  };

  const handleEditUser = () => {
    if (!selectedUser) {
      return;
    }

    setEditUser({ ...selectedUser });
    setEditJobOffer(null);
    setEditing(true);
  };

  const handleEditJobOffer = () => {
    if (!selectedJobOffer) {
      return;
    }

    setEditJobOffer({ ...selectedJobOffer });
    setEditUser(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditUser(null);
    setEditJobOffer(null);
  };

  return (
    <div className="app-layout">
      <MyHeader />

      <main className="admin-page">
        <div className="admin-content">
          <p className="admin-kicker">Administration</p>
          <h1>Panneau d’administration</h1>

          <div className="admin-box">
            {editing ? (
              <>
                {editUser && selectedType === "users" && (
                  <div className="admin-edit">
                    <div className="admin-edit-header">
                      <span className="admin-edit-icon">✎</span>
                      <h2>
                        {editUser.first_name} {editUser.last_name}
                      </h2>
                    </div>

                    <hr />

                    <h3>Édition</h3>

                    <label>
                      Prénom
                      <input
                        type="text"
                        value={editUser.first_name}
                        onChange={(event) =>
                          setEditUser({
                            ...editUser,
                            first_name: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      Nom
                      <input
                        type="text"
                        value={editUser.last_name}
                        onChange={(event) =>
                          setEditUser({
                            ...editUser,
                            last_name: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      Email
                      <input
                        type="email"
                        value={editUser.email}
                        onChange={(event) =>
                          setEditUser({
                            ...editUser,
                            email: event.target.value,
                          })
                        }
                      />
                    </label>

                    <div className="admin-edit-actions">
                      <button type="button" onClick={cancelEditing}>
                        Annuler
                      </button>

                      <button type="button">Enregistrer</button>
                    </div>
                  </div>
                )}

                {editJobOffer && selectedType === "job-offers" && (
                  <div className="admin-edit">
                    <div className="admin-edit-header">
                      <span className="admin-edit-icon">✎</span>
                      <h2>{editJobOffer.name}</h2>
                    </div>

                    <hr />

                    <h3>Édition</h3>

                    <label>
                      Nom
                      <input
                        type="text"
                        value={editJobOffer.name}
                        onChange={(event) =>
                          setEditJobOffer({
                            ...editJobOffer,
                            name: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      Description
                      <textarea
                        value={editJobOffer.description}
                        onChange={(event) =>
                          setEditJobOffer({
                            ...editJobOffer,
                            description: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      Adresse
                      <input
                        type="text"
                        value={editJobOffer.adress}
                        onChange={(event) =>
                          setEditJobOffer({
                            ...editJobOffer,
                            adress: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      Type de contrat
                      <select
                        value={editJobOffer.contract_type}
                        onChange={(event) =>
                          setEditJobOffer({
                            ...editJobOffer,
                            contract_type: event.target.value,
                          })
                        }
                      >
                        <option value="part-time">Temps partiel</option>
                        <option value="full-time">Temps plein</option>
                        <option value="internship">Stage</option>
                        <option value="volunteer">Bénévolat</option>
                      </select>
                    </label>

                    <label>
                      Date de début
                      <input
                        type="date"
                        value={editJobOffer.start_date}
                        onChange={(event) =>
                          setEditJobOffer({
                            ...editJobOffer,
                            start_date: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      Date de fin
                      <input
                        type="date"
                        value={editJobOffer.end_date ?? ""}
                        onChange={(event) =>
                          setEditJobOffer({
                            ...editJobOffer,
                            end_date: event.target.value || null,
                          })
                        }
                      />
                    </label>

                    <div className="admin-edit-actions">
                      <button type="button" onClick={cancelEditing}>
                        Annuler
                      </button>

                      <button type="button">Enregistrer</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="admin-dashboard">
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

                  <div className="admin-stats">
                    <h2>Statistiques</h2>

                    {selectedType === "users" ? (
                      <>
                        <div className="admin-stat">
                          <span>Utilisateurs</span>
                          <strong>
                            {loadingUsers ? "..." : users.length}
                          </strong>
                        </div>

                        <div className="admin-stat">
                          <span>Administrateurs</span>
                          <strong>-</strong>
                        </div>

                        <div className="admin-stat">
                          <span>Actifs</span>
                          <strong>-</strong>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="admin-stat">
                          <span>Offres</span>
                          <strong>
                            {loadingJobOffers ? "..." : jobOffers.length}
                          </strong>
                        </div>

                        <div className="admin-stat">
                          <span>Offres actives</span>
                          <strong>-</strong>
                        </div>

                        <div className="admin-stat">
                          <span>Publiées ce mois</span>
                          <strong>-</strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>

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
                    {selectedType === "users" && (
                      <>
                        {loadingUsers && (
                          <div className="admin-user">
                            <div className="admin-user-info">
                              <span>Chargement des utilisateurs...</span>
                            </div>
                          </div>
                        )}

                        {!loadingUsers && usersError && (
                          <div className="admin-user">
                            <div className="admin-user-info">
                              <strong>Erreur</strong>
                              <span>{usersError}</span>
                            </div>
                          </div>
                        )}

                        {!loadingUsers &&
                          !usersError &&
                          users.length === 0 && (
                            <div className="admin-user">
                              <div className="admin-user-info">
                                <span>Aucun utilisateur trouvé.</span>
                              </div>
                            </div>
                          )}

                        {!loadingUsers &&
                          !usersError &&
                          users.map((user) => (
                            <div
                              key={user.id}
                              className={`admin-user ${
                                selectedUser?.id === user.id
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={(event) =>
                                handleUserClick(user, event)
                              }
                            >
                              <div className="admin-user-avatar">◯</div>

                              <div className="admin-user-info">
                                <strong>
                                  {user.first_name} {user.last_name}
                                </strong>
                                <span>{user.email}</span>
                              </div>
                            </div>
                          ))}
                      </>
                    )}

                    {selectedType === "job-offers" && (
                      <>
                        {loadingJobOffers && (
                          <div className="admin-user">
                            <div className="admin-user-info">
                              <span>Chargement des offres...</span>
                            </div>
                          </div>
                        )}

                        {!loadingJobOffers && jobOffersError && (
                          <div className="admin-user">
                            <div className="admin-user-info">
                              <strong>Erreur</strong>
                              <span>{jobOffersError}</span>
                            </div>
                          </div>
                        )}

                        {!loadingJobOffers &&
                          !jobOffersError &&
                          jobOffers.length === 0 && (
                            <div className="admin-user">
                              <div className="admin-user-info">
                                <span>Aucune offre trouvée.</span>
                              </div>
                            </div>
                          )}

                        {!loadingJobOffers &&
                          !jobOffersError &&
                          jobOffers.map((offer) => (
                            <div
                              key={offer.id}
                              className={`admin-user ${
                                selectedJobOffer?.id === offer.id
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={(event) =>
                                handleJobOfferClick(offer, event)
                              }
                            >
                              <div className="admin-user-avatar">💼</div>

                              <div className="admin-user-info">
                                <strong>{offer.name}</strong>

                                <span>
                                  {offer.adress} · {offer.contract_type}
                                </span>
                              </div>
                            </div>
                          ))}
                      </>
                    )}
                  </div>

                  {selectedType === "users" && selectedUser && (
                    <div
                      className="admin-actions"
                      style={{ top: `${actionTop}px` }}
                    >
                      <button type="button">
                        Changer le rôle
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(selectedUser.id)}
                      >
                        Supprimer l'utilisateur
                      </button>

                      <button
                        type="button"
                        onClick={handleEditUser}
                      >
                        Modifier l'utilisateur
                      </button>
                    </div>
                  )}

                  {selectedType === "job-offers" && selectedJobOffer && (
                    <div
                      className="admin-actions"
                      style={{ top: `${actionTop}px` }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteJobOffer(selectedJobOffer.id)
                        }
                      >
                        Supprimer l'offre
                      </button>

                      <button
                        type="button"
                        onClick={handleEditJobOffer}
                      >
                        Modifier l'offre
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Admin;