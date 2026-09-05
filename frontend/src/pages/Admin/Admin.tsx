import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import MyHeader from "../../Header";
import Footer from "../../Footer";
import "./Admin.css";

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

type Category = "users" | "offers";

type ListItemProps = {
  title: string;
  subtitle: string;
  avatar: string;
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
};

function AdminListItem({
  title,
  subtitle,
  avatar,
  selected,
  onClick,
  children,
}: ListItemProps) {
  return (
    <div
      className={
        selected
          ? "admin-user selected"
          : "admin-user"
      }
      onClick={onClick}
    >
      <div className="admin-avatar">{avatar}</div>

      <div className="admin-user-info">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>

      {selected && children}
    </div>
  );
}

type EditFieldProps = {
  label: string;
  children: ReactNode;
};

function EditField({
  label,
  children,
}: EditFieldProps) {
  return (
    <label>
      {label}
      {children}
    </label>
  );
}

type EditLayoutProps = {
  title: string;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  children: ReactNode;
};

function EditLayout({
  title,
  onCancel,
  onSave,
  saving,
  children,
}: EditLayoutProps) {
  return (
    <div className="admin-edit">
      <div className="admin-edit-header">
        <span className="admin-edit-icon">
          ✎
        </span>

        <h2>{title}</h2>
      </div>

      <hr />

      <h3>Édition</h3>

      {children}

      <div className="admin-edit-actions">
        <button
          type="button"
          onClick={onCancel}
        >
          Annuler
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
        >
          {saving
            ? "Enregistrement..."
            : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

function Admin() {
  const apiUrl = import.meta.env.VITE_API_BACKEND_URL;

  const [category, setCategory] =
    useState<Category>("users");

  const [users, setUsers] = useState<User[]>([]);
  const [jobOffers, setJobOffers] =
    useState<JobOffer[]>([]);

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [selectedJobOffer, setSelectedJobOffer] =
    useState<JobOffer | null>(null);

  const [editUser, setEditUser] =
    useState<User | null>(null);

  const [editJobOffer, setEditJobOffer] =
    useState<JobOffer | null>(null);

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const getToken = () =>
    localStorage.getItem("access_token");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersResponse, offersResponse] =
          await Promise.all([
            fetch(`${apiUrl}/api/v1/users/`),
            fetch(`${apiUrl}/api/v1/offers/`),
          ]);

        if (!usersResponse.ok) {
          throw new Error(
            `Users HTTP ${usersResponse.status}`
          );
        }

        if (!offersResponse.ok) {
          throw new Error(
            `Offers HTTP ${offersResponse.status}`
          );
        }

        const usersData: User[] =
          await usersResponse.json();

        const offersData: JobOffer[] =
          await offersResponse.json();

        setUsers(usersData);
        setJobOffers(offersData);
      } catch (error) {
        console.error(
          "Erreur lors du chargement :",
          error
        );
      }
    };

    loadData();
  }, [apiUrl]);

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filteredUsers = users.filter(
    (user) => {
      const query = normalize(search);

      return (
        normalize(user.first_name).includes(
          query
        ) ||
        normalize(user.last_name).includes(
          query
        ) ||
        normalize(user.email).includes(
          query
        )
      );
    }
  );

  const filteredOffers = jobOffers.filter(
    (offer) => {
      const query = normalize(search);

      return (
        normalize(offer.name).includes(query) ||
        normalize(offer.description).includes(
          query
        ) ||
        normalize(offer.adress).includes(query)
      );
    }
  );

  const changeCategory = (
    newCategory: Category
  ) => {
    setCategory(newCategory);
    setSelectedUser(null);
    setSelectedJobOffer(null);
    setSearch("");
  };

  const selectUser = (user: User) => {
    setSelectedUser(
      selectedUser?.id === user.id
        ? null
        : user
    );
    setSelectedJobOffer(null);
  };

  const selectOffer = (offer: JobOffer) => {
    setSelectedJobOffer(
      selectedJobOffer?.id === offer.id
        ? null
        : offer
    );
    setSelectedUser(null);
  };

  const startUserEdit = () => {
    if (!selectedUser) {
      return;
    }

    setEditUser({ ...selectedUser });
    setEditJobOffer(null);
    setEditing(true);
  };

  const startOfferEdit = () => {
    if (!selectedJobOffer) {
      return;
    }

    setEditJobOffer({
      ...selectedJobOffer,
    });

    setEditUser(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditUser(null);
    setEditJobOffer(null);
    setEditing(false);
  };

  const saveUser = async () => {
    if (!editUser) {
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      const response = await fetch(
        `${apiUrl}/api/v1/users/${editUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            first_name: editUser.first_name,
            last_name: editUser.last_name,
            email: editUser.email,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${
            await response.text()
          }`
        );
      }

      const updatedUser: User =
        await response.json();

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === updatedUser.id
            ? updatedUser
            : user
        )
      );

      cancelEdit();
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement "
          + "de l'utilisateur :",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  const saveOffer = async () => {
    if (!editJobOffer) {
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      const response = await fetch(
        `${apiUrl}/api/v1/offers/${editJobOffer.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            name: editJobOffer.name,
            description:
              editJobOffer.description,
            start_date:
              editJobOffer.start_date,
            end_date:
              editJobOffer.end_date,
            contract_type:
              editJobOffer.contract_type,
            adress: editJobOffer.adress,
            geocoding_source:
              editJobOffer.geocoding_source,
            geocoding_score:
              editJobOffer.geocoding_score,
            latitude:
              editJobOffer.latitude,
            longitude:
              editJobOffer.longitude,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${
            await response.text()
          }`
        );
      }

      setJobOffers((currentOffers) =>
        currentOffers.map((offer) =>
          offer.id === editJobOffer.id
            ? {
                ...offer,
                ...editJobOffer,
              }
            : offer
        )
      );

      cancelEdit();
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement "
          + "de l'offre :",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      const token = getToken();

      const response = await fetch(
        `${apiUrl}/api/v1/users/${selectedUser.id}`,
        {
          method: "DELETE",
          headers: {
            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) =>
            user.id !== selectedUser.id
        )
      );

      setSelectedUser(null);
    } catch (error) {
      console.error(
        "Erreur lors de la suppression "
          + "de l'utilisateur :",
        error
      );
    }
  };

  const deleteOffer = async () => {
    if (!selectedJobOffer) {
      return;
    }

    try {
      const token = getToken();

      const response = await fetch(
        `${apiUrl}/api/v1/offers/${selectedJobOffer.id}`,
        {
          method: "DELETE",
          headers: {
            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      setJobOffers((currentOffers) =>
        currentOffers.filter(
          (offer) =>
            offer.id !== selectedJobOffer.id
        )
      );

      setSelectedJobOffer(null);
    } catch (error) {
      console.error(
        "Erreur lors de la suppression "
          + "de l'offre :",
        error
      );
    }
  };

  return (
    <>
      <MyHeader />

      <main className="admin-page">
        <div className="admin-content">
          <div className="admin-kicker">
            Administration
          </div>

          <h1>
            Panneau d’administration
          </h1>

          <section className="admin-box">
            {editing ? (
              <>
                {editUser && (
                  <EditLayout
                    title={
                      `${editUser.first_name} `
                      + `${editUser.last_name}`
                    }
                    onCancel={cancelEdit}
                    onSave={saveUser}
                    saving={saving}
                  >
                    <EditField label="Prénom">
                      <input
                        type="text"
                        value={
                          editUser.first_name
                        }
                        onChange={(event) =>
                          setEditUser({
                            ...editUser,
                            first_name:
                              event.target.value,
                          })
                        }
                      />
                    </EditField>

                    <EditField label="Nom">
                      <input
                        type="text"
                        value={
                          editUser.last_name
                        }
                        onChange={(event) =>
                          setEditUser({
                            ...editUser,
                            last_name:
                              event.target.value,
                          })
                        }
                      />
                    </EditField>

                    <EditField label="Email">
                      <input
                        type="email"
                        value={editUser.email}
                        onChange={(event) =>
                          setEditUser({
                            ...editUser,
                            email:
                              event.target.value,
                          })
                        }
                      />
                    </EditField>
                  </EditLayout>
                )}

                {editJobOffer && (
                  <EditLayout
                    title={editJobOffer.name}
                    onCancel={cancelEdit}
                    onSave={saveOffer}
                    saving={saving}
                  >
                    <EditField
                      label="Nom de l'offre"
                    >
                      <input
                        type="text"
                        value={editJobOffer.name}
                        onChange={(event) =>
                          setEditJobOffer({
                            ...editJobOffer,
                            name:
                              event.target.value,
                          })
                        }
                      />
                    </EditField>

                    <EditField
                      label="Description"
                    >
                      <textarea
                        value={
                          editJobOffer.description
                        }
                        onChange={(event) =>
                          setEditJobOffer({
                            ...editJobOffer,
                            description:
                              event.target.value,
                          })
                        }
                      />
                    </EditField>

                    <EditField
                      label="Date de début"
                    >
                      <input
                        type="date"
                        value={
                          editJobOffer.start_date
                        }
                        onChange={(event) =>
                          setEditJobOffer({
                            ...editJobOffer,
                            start_date:
                              event.target.value,
                          })
                        }
                      />
                    </EditField>

                    <EditField
                      label="Date de fin"
                    >
                      <input
                        type="date"
                        value={
                          editJobOffer.end_date ||
                          ""
                        }
                        onChange={(event) =>
                          setEditJobOffer({
                            ...editJobOffer,
                            end_date:
                              event.target.value ||
                              null,
                          })
                        }
                      />
                    </EditField>

                    <EditField
                      label="Type de contrat"
                    >
                      <select
                        value={
                          editJobOffer.contract_type
                        }
                        onChange={(event) =>
                          setEditJobOffer({
                            ...editJobOffer,
                            contract_type:
                              event.target.value,
                          })
                        }
                      >
                        <option value="part-time">
                          Temps partiel
                        </option>

                        <option value="full-time">
                          Temps plein
                        </option>

                        <option value="internship">
                          Stage
                        </option>

                        <option value="volunteer">
                          Bénévolat
                        </option>
                      </select>
                    </EditField>

                    <EditField label="Adresse">
                      <input
                        type="text"
                        value={
                          editJobOffer.adress
                        }
                        onChange={(event) =>
                          setEditJobOffer({
                            ...editJobOffer,
                            adress:
                              event.target.value,
                          })
                        }
                      />
                    </EditField>
                  </EditLayout>
                )}
              </>
            ) : (
              <div className="admin-dashboard">
                <div className="admin-selector">
                  <h2 className="admin-selector-title">
                    Gestion
                  </h2>

                  <div className="admin-category-buttons">
                    <button
                      type="button"
                      className={
                        category === "users"
                          ? "admin-category-button active"
                          : "admin-category-button"
                      }
                      onClick={() =>
                        changeCategory("users")
                      }
                    >
                      Utilisateurs
                    </button>

                    <button
                      type="button"
                      className={
                        category === "offers"
                          ? "admin-category-button active"
                          : "admin-category-button"
                      }
                      onClick={() =>
                        changeCategory("offers")
                      }
                    >
                      Offres d'emploi
                    </button>
                  </div>

                  <div className="admin-stats">
                    <div className="admin-stat">
                      <strong>
                        {users.length}
                      </strong>
                      <span>
                        Utilisateurs
                      </span>
                    </div>

                    <div className="admin-stat">
                      <strong>
                        {jobOffers.length}
                      </strong>
                      <span>Offres</span>
                    </div>
                  </div>
                </div>

                <div className="admin-users-container">
                  <input
                    type="search"
                    className="admin-search"
                    placeholder={
                      category === "users"
                        ? "Rechercher un utilisateur..."
                        : "Rechercher une offre..."
                    }
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                  />

                  <div className="admin-users">
                    {category === "users" &&
                      filteredUsers.map((user) => (
                        <AdminListItem
                          key={user.id}
                          title={
                            `${user.first_name} `
                            + `${user.last_name}`
                          }
                          subtitle={user.email}
                          avatar={
                            user.first_name.charAt(0)
                            + user.last_name.charAt(0)
                          }
                          selected={
                            selectedUser?.id ===
                            user.id
                          }
                          onClick={() =>
                            selectUser(user)
                          }
                        >
                          <div className="admin-action-bubble">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                startUserEdit();
                              }}
                            >
                              Modifier l'utilisateur
                            </button>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                deleteUser();
                              }}
                            >
                              Supprimer l'utilisateur
                            </button>

                            <button
                              type="button"
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                            >
                              Changer le rôle
                            </button>
                          </div>
                        </AdminListItem>
                      ))}

                    {category === "offers" &&
                      filteredOffers.map((offer) => (
                        <AdminListItem
                          key={offer.id}
                          title={offer.name}
                          subtitle={offer.adress}
                          avatar={offer.name.charAt(0)}
                          selected={
                            selectedJobOffer?.id ===
                            offer.id
                          }
                          onClick={() =>
                            selectOffer(offer)
                          }
                        >
                          <div className="admin-action-bubble">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                startOfferEdit();
                              }}
                            >
                              Modifier l'offre
                            </button>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                deleteOffer();
                              }}
                            >
                              Supprimer l'offre
                            </button>
                          </div>
                        </AdminListItem>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Admin;