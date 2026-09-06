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

type Permission = {
  id: number;
  name: string;
};

type Role = {
  id: number;
  name: string;
  description: string;
  is_self_assignable: boolean;
  permissions: Permission[];
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
        selected ? "admin-user selected" : "admin-user"
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
        <span className="admin-edit-icon">✎</span>
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
  const API_BACKEND_URL = import.meta.env.VITE_API_BACKEND_URL;

  const apiUrl = import.meta.env.VITE_API_BACKEND_URL;

  const [category, setCategory] =
    useState<Category>("users");

  const [users, setUsers] = useState<User[]>([]);

  const [jobOffers, setJobOffers] =
    useState<JobOffer[]>([]);

  const [permissions, setPermissions] =
    useState<Permission[]>([]);

  const [roles, setRoles] =
    useState<Role[]>([]);

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [selectedJobOffer, setSelectedJobOffer] =
    useState<JobOffer | null>(null);

  const [selectedAdminRole, setSelectedAdminRole] =
    useState<Role | null>(null);

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

  const [changingRole, setChangingRole] =
    useState(false);

  const [selectedRole, setSelectedRole] =
    useState("user");

  const [managingRoles, setManagingRoles] =
    useState(false);

  const [editingRole, setEditingRole] =
    useState(false);

  const [roleName, setRoleName] =
    useState("");

  const [roleDescription, setRoleDescription] =
    useState("");

  const [roleSelfAssignable, setRoleSelfAssignable] =
    useState(false);

  const [rolePermissions, setRolePermissions] =
    useState<string[]>([]);

  const getToken = () =>
    localStorage.getItem("access_token");

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getToken();

        const authHeaders: HeadersInit = {
          ...(token
            ? {
              Authorization:
                `Bearer ${token}`,
            }
            : {}),
        };

        const [
          usersResponse,
          offersResponse,
          permissionsResponse,
          rolesResponse,
        ] = await Promise.all([
          fetch(`${apiUrl}/users/`),

          fetch(`${apiUrl}/offers/`),

          fetch(
            `${apiUrl}/permissions/`,
            {
              headers: authHeaders,
            }
          ),

          fetch(
            `${apiUrl}/roles/`,
            {
              headers: authHeaders,
            }
          ),
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

        if (!permissionsResponse.ok) {
          throw new Error(
            `Permissions HTTP ${permissionsResponse.status}`
          );
        }

        if (!rolesResponse.ok) {
          throw new Error(
            `Roles HTTP ${rolesResponse.status}`
          );
        }

        const usersData: User[] =
          await usersResponse.json();

        const offersData: JobOffer[] =
          await offersResponse.json();

        const permissionsData: Permission[] =
          await permissionsResponse.json();

        const rolesData: Role[] =
          await rolesResponse.json();

        setUsers(usersData);
        setJobOffers(offersData);
        setPermissions(permissionsData);
        setRoles(rolesData);
      } catch (error) {
        console.error(
          "Erreur lors du chargement :",
          error
        );
      }
    };

    loadData();
  }, [apiUrl]);

  const filteredUsers = users.filter(
    (user) => {
      const query = normalize(search);

      return (
        normalize(user.first_name).includes(query) ||
        normalize(user.last_name).includes(query) ||
        normalize(user.email).includes(query)
      );
    }
  );

  const filteredOffers = jobOffers.filter(
    (offer) => {
      const query = normalize(search);

      return (
        normalize(offer.name).includes(query) ||
        normalize(offer.description).includes(query) ||
        normalize(offer.adress).includes(query)
      );
    }
  );

  const loadPermissions = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        `${apiUrl}/permissions/`,
        {
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
          `Permissions HTTP ${response.status}`
        );
      }

      const data: Permission[] =
        await response.json();

      setPermissions(data);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des permissions :",
        error
      );
    }
  };

  const loadRoles = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        `${apiUrl}/roles/`,
        {
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
          `Roles HTTP ${response.status}`
        );
      }

      const data: Role[] =
        await response.json();

      setRoles(data);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des rôles :",
        error
      );
    }
  };

  const openRoleManagement = async () => {
    setManagingRoles(true);
    setEditingRole(false);
    setSelectedAdminRole(null);

    setSelectedUser(null);
    setSelectedJobOffer(null);
    setChangingRole(false);
    setSearch("");

    await Promise.all([
      loadPermissions(),
      loadRoles(),
    ]);
  };

  const changeCategory = (
    newCategory: Category
  ) => {
    setCategory(newCategory);
    setManagingRoles(false);
    setEditingRole(false);
    setSelectedAdminRole(null);

    setSelectedUser(null);
    setSelectedJobOffer(null);

    setSearch("");
    setChangingRole(false);
  };

  const selectUser = (user: User) => {
    if (selectedUser?.id === user.id) {
      setSelectedUser(null);
      setChangingRole(false);
      return;
    }

    setSelectedUser(user);
    setSelectedJobOffer(null);
    setChangingRole(false);
  };

  const selectOffer = (offer: JobOffer) => {
    if (selectedJobOffer?.id === offer.id) {
      setSelectedJobOffer(null);
      return;
    }

    setSelectedJobOffer(offer);
    setSelectedUser(null);
  };

  const startUserEdit = () => {
    if (!selectedUser) return;

    setEditUser({
      ...selectedUser,
    });

    setEditJobOffer(null);
    setEditing(true);
  };

  const startOfferEdit = () => {
    if (!selectedJobOffer) return;

    setEditJobOffer({
      ...selectedJobOffer,
    });

    setEditUser(null);
    setEditing(true);
  };

  const startRoleChange = () => {
    if (!selectedUser) return;

    setSelectedRole(
      "user"
    );

    setChangingRole(true);
  };

  const cancelEdit = () => {
    setEditUser(null);
    setEditJobOffer(null);
    setEditing(false);
  };

  const saveUser = async () => {
    if (!editUser) return;

    try {
      setSaving(true);

      const token = getToken();

      const response = await fetch(
        `${apiUrl}/users/${editUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            ...(token
              ? {
                Authorization:
                  `Bearer ${token}`,
              }
              : {}),
          },
          body: JSON.stringify({
            first_name:
              editUser.first_name,
            last_name:
              editUser.last_name,
            email:
              editUser.email,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${await response.text()}`
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

      setSelectedUser(updatedUser);

      cancelEdit();
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement de l'utilisateur :",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  const saveOffer = async () => {
    if (!editJobOffer) return;

    try {
      setSaving(true);

      const token = getToken();

      const response = await fetch(
        `${apiUrl}/offers/${editJobOffer.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
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
            adress:
              editJobOffer.adress,
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
          `HTTP ${response.status}: ${await response.text()}`
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
        "Erreur lors de l'enregistrement de l'offre :",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  const saveRole = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);

      const token = getToken();

      const response = await fetch(
        `${apiUrl}/users/`
        + `${selectedUser.id}/roles`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            ...(token
              ? {
                Authorization:
                  `Bearer ${token}`,
              }
              : {}),
          },
          body: JSON.stringify({
            roles: [selectedRole],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${await response.text()}`
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

      setSelectedUser(updatedUser);
      setChangingRole(false);
    } catch (error) {
      console.error(
        "Erreur lors du changement de rôle :",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      const token = getToken();

      const response = await fetch(
        `${apiUrl}/users/${selectedUser.id}`,
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
        "Erreur lors de la suppression de l'utilisateur :",
        error
      );
    }
  };

  const deleteOffer = async () => {
    if (!selectedJobOffer) return;

    try {
      const token = getToken();

      const response = await fetch(
        `${apiUrl}/offers/`
        + `${selectedJobOffer.id}`,
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
            offer.id !==
            selectedJobOffer.id
        )
      );

      setSelectedJobOffer(null);
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de l'offre :",
        error
      );
    }
  };

  const selectAdminRole = (role: Role) => {
    if (
      selectedAdminRole?.id === role.id
    ) {
      setSelectedAdminRole(null);
      return;
    }

    setSelectedAdminRole(role);
    setEditingRole(false);
  };

  const startRoleCreation = () => {
    setSelectedAdminRole(null);

    setRoleName("");
    setRoleDescription("");
    setRoleSelfAssignable(false);
    setRolePermissions([]);

    setEditingRole(true);
  };

  const startRoleEdit = () => {
    if (!selectedAdminRole) return;

    setRoleName(
      selectedAdminRole.name
    );

    setRoleDescription(
      selectedAdminRole.description
    );

    setRoleSelfAssignable(
      selectedAdminRole.is_self_assignable
    );

    setRolePermissions(
      (selectedAdminRole.permissions ?? []).map(
        (permission) =>
          permission.name
      )
    );

    setEditingRole(true);
  };

  const cancelRoleEdit = () => {
    setSelectedAdminRole(null);
    setEditingRole(false);

    setRoleName("");
    setRoleDescription("");
    setRoleSelfAssignable(false);
    setRolePermissions([]);
  };

  const toggleRolePermission = (
    permissionName: string
  ) => {
    setRolePermissions(
      (currentPermissions) =>
        currentPermissions.includes(
          permissionName
        )
          ? currentPermissions.filter(
            (permission) =>
              permission !==
              permissionName
          )
          : [
            ...currentPermissions,
            permissionName,
          ]
    );
  };

  const saveAdminRole = async () => {
    if (!roleName.trim()) return;

    try {
      setSaving(true);

      const token = getToken();

      const body = {
        name: roleName.trim(),
        description:
          roleDescription.trim(),
        permissions:
          rolePermissions,
        is_self_assignable:
          roleSelfAssignable,
      };

      const url = selectedAdminRole
        ? `${apiUrl}/roles/${selectedAdminRole.id}`
        : `${apiUrl}/roles/`;

      const response = await fetch(
        url,
        {
          method: selectedAdminRole
            ? "PATCH"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
            ...(token
              ? {
                Authorization:
                  `Bearer ${token}`,
              }
              : {}),
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${await response.text()}`
        );
      }

      await loadRoles();

      cancelRoleEdit();
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement du rôle :",
        error
      );
    } finally {
      setSaving(false);
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
                        value={
                          editUser.email
                        }
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
                        value={
                          editJobOffer.name
                        }
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
                        category === "users" &&
                          !managingRoles
                          ? "admin-category-button active"
                          : "admin-category-button"
                      }
                      onClick={() =>
                        changeCategory(
                          "users"
                        )
                      }
                    >
                      Utilisateurs
                    </button>

                    <button
                      type="button"
                      className={
                        category === "offers" &&
                          !managingRoles
                          ? "admin-category-button active"
                          : "admin-category-button"
                      }
                      onClick={() =>
                        changeCategory(
                          "offers"
                        )
                      }
                    >
                      Offres d'emploi
                    </button>

                    <button
                      type="button"
                      className={
                        managingRoles
                          ? "admin-category-button active"
                          : "admin-category-button"
                      }
                      onClick={
                        openRoleManagement
                      }
                    >
                      Rôles et permissions
                    </button>
                  </div>

                  {!managingRoles && (
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

                        <span>
                          Offres
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {managingRoles ? (
                  <div className="admin-users-container">
                    {!editingRole ? (
                      <>
                        <div className="admin-users">
                          {roles.map(
                            (role) => (
                              <div
                                key={
                                  role.id
                                }
                                className={
                                  selectedAdminRole?.id ===
                                    role.id
                                    ? "admin-user selected"
                                    : "admin-user"
                                }
                                onClick={() =>
                                  selectAdminRole(
                                    role
                                  )
                                }
                              >
                                <div className="admin-avatar">
                                  {role.name
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>

                                <div className="admin-user-info">
                                  <strong>
                                    {
                                      role.name
                                    }
                                  </strong>

                                  <span>
                                    {
                                      role.description
                                    }
                                  </span>
                                </div>

                                {selectedAdminRole?.id ===
                                  role.id && (
                                    <div className="admin-action-bubble">
                                      <button
                                        type="button"
                                        onClick={(
                                          event
                                        ) => {
                                          event.stopPropagation();
                                          startRoleEdit();
                                        }}
                                      >
                                        Modifier le rôle
                                      </button>
                                    </div>
                                  )}
                              </div>
                            )
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={
                            startRoleCreation
                          }
                        >
                          Créer un rôle
                        </button>
                      </>
                    ) : (
                      <div className="admin-edit">
                        <div className="admin-edit-header">
                          <span className="admin-edit-icon">
                            ✎
                          </span>

                          <h2>
                            {selectedAdminRole
                              ? `Modifier ${selectedAdminRole.name}`
                              : "Créer un rôle"}
                          </h2>
                        </div>

                        <hr />

                        <h3>
                          Édition
                        </h3>

                        <EditField label="Nom du rôle">
                          <input
                            type="text"
                            value={
                              roleName
                            }
                            onChange={(event) =>
                              setRoleName(
                                event.target
                                  .value
                              )
                            }
                          />
                        </EditField>

                        <EditField label="Description">
                          <textarea
                            value={
                              roleDescription
                            }
                            onChange={(event) =>
                              setRoleDescription(
                                event.target
                                  .value
                              )
                            }
                          />
                        </EditField>

                        <EditField label="Auto-attribuable">
                          <input
                            type="checkbox"
                            checked={
                              roleSelfAssignable
                            }
                            onChange={(
                              event
                            ) =>
                              setRoleSelfAssignable(
                                event.target
                                  .checked
                              )
                            }
                          />
                        </EditField>

                        <h3>
                          Permissions
                        </h3>

                        <div className="admin-role-permissions-editor">
                          {permissions.map(
                            (
                              permission
                            ) => (
                              <label
                                key={
                                  permission.id
                                }
                                className="admin-permission-option"
                              >
                                <input
                                  type="checkbox"
                                  checked={rolePermissions.includes(
                                    permission.name
                                  )}
                                  onChange={() =>
                                    toggleRolePermission(
                                      permission.name
                                    )
                                  }
                                />

                                <span>
                                  {
                                    permission.name
                                  }
                                </span>
                              </label>
                            )
                          )}
                        </div>

                        <div className="admin-edit-actions">
                          <button
                            type="button"
                            onClick={
                              cancelRoleEdit
                            }
                            disabled={
                              saving
                            }
                          >
                            Annuler
                          </button>

                          <button
                            type="button"
                            onClick={
                              saveAdminRole
                            }
                            disabled={
                              saving ||
                              !roleName.trim()
                            }
                          >
                            {saving
                              ? "Enregistrement..."
                              : "Enregistrer"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
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
                        setSearch(
                          event.target
                            .value
                        )
                      }
                    />

                    <div className="admin-users">
                      {category === "users" &&
                        filteredUsers.map(
                          (user) => (
                            <AdminListItem
                              key={user.id}
                              title={
                                `${user.first_name} `
                                + `${user.last_name}`
                              }
                              subtitle={
                                user.email
                              }
                              avatar={
                                user.first_name.charAt(
                                  0
                                ) +
                                user.last_name.charAt(
                                  0
                                )
                              }
                              selected={
                                selectedUser?.id ===
                                user.id
                              }
                              onClick={() =>
                                selectUser(
                                  user
                                )
                              }
                            >
                              <div className="admin-action-bubble">
                                {!changingRole ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(
                                        event
                                      ) => {
                                        event.stopPropagation();
                                        startUserEdit();
                                      }}
                                    >
                                      Modifier
                                      l'utilisateur
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(
                                        event
                                      ) => {
                                        event.stopPropagation();
                                        deleteUser();
                                      }}
                                    >
                                      Supprimer
                                      l'utilisateur
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(
                                        event
                                      ) => {
                                        event.stopPropagation();
                                        startRoleChange();
                                      }}
                                    >
                                      Changer le rôle
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <select
                                      value={
                                        selectedRole
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        setSelectedRole(
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      onClick={(
                                        event
                                      ) =>
                                        event.stopPropagation()
                                      }
                                    >
                                      {roles.map(
                                        (
                                          role
                                        ) => (
                                          <option
                                            key={
                                              role.id
                                            }
                                            value={
                                              role.name
                                            }
                                          >
                                            {
                                              role.name
                                            }
                                          </option>
                                        )
                                      )}
                                    </select>

                                    <button
                                      type="button"
                                      onClick={(
                                        event
                                      ) => {
                                        event.stopPropagation();
                                        saveRole();
                                      }}
                                      disabled={
                                        saving
                                      }
                                    >
                                      {saving
                                        ? "Enregistrement..."
                                        : "Enregistrer"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(
                                        event
                                      ) => {
                                        event.stopPropagation();
                                        setChangingRole(
                                          false
                                        );
                                      }}
                                    >
                                      Annuler
                                    </button>
                                  </>
                                )}
                              </div>
                            </AdminListItem>
                          )
                        )}

                      {category === "offers" &&
                        filteredOffers.map(
                          (offer) => (
                            <AdminListItem
                              key={offer.id}
                              title={
                                offer.name
                              }
                              subtitle={
                                offer.adress
                              }
                              avatar={
                                offer.name.charAt(
                                  0
                                )
                              }
                              selected={
                                selectedJobOffer?.id ===
                                offer.id
                              }
                              onClick={() =>
                                selectOffer(
                                  offer
                                )
                              }
                            >
                              <div className="admin-action-bubble">
                                <button
                                  type="button"
                                  onClick={(
                                    event
                                  ) => {
                                    event.stopPropagation();
                                    startOfferEdit();
                                  }}
                                >
                                  Modifier
                                  l'offre
                                </button>

                                <button
                                  type="button"
                                  onClick={(
                                    event
                                  ) => {
                                    event.stopPropagation();
                                    deleteOffer();
                                  }}
                                >
                                  Supprimer
                                  l'offre
                                </button>
                              </div>
                            </AdminListItem>
                          )
                        )}
                    </div>
                  </div>
                )}
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