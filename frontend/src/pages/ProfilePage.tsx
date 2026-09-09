import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import MyHeader from "../Header";
import Footer from "../Footer";
import { ROUTES } from "../routes";
import "./ProfilePage.css";

// Types
type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

type Skill = {
  skill: {
    id: number;
    name: string;
    description?: string | null;
  };
  level: number;
};

type Experience = {
  id: number;
  name: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
};

type EmployerOut = {
  first_name: string;
  last_name: string;
};

type OfferOut = {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date?: string | null;
  contract_type: string;
  latitude: number;
  longitude: number;
  adress: string;
  employer: EmployerOut;
};

type ApplicationOut = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  created_at: string;
  resume_original_filename: string;
};

type MyApplicationOut = {
  application: ApplicationOut;
  offer: OfferOut;
};

const API = import.meta.env.VITE_API_BACKEND_URL;

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };
}

function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [applications, setApplications] = useState<MyApplicationOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("3");
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);

  const [experience, setExperience] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const [editingExperienceId, setEditingExperienceId] =
    useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  async function loadProfile() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate(ROUTES.LOGIN);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [
        userResponse,
        skillsResponse,
        experiencesResponse,
        applicationsResponse,
      ] = await Promise.all([
        fetch(`${API}/users/me`, {
          headers: authHeaders(),
        }),
        fetch(`${API}/skills/me`, {
          headers: authHeaders(),
        }),
        fetch(`${API}/experiences/me`, {
          headers: authHeaders(),
        }),
        fetch(`${API}/applications/me`, {
          headers: authHeaders(),
        }),
      ]);

      if (
        [
          userResponse,
          skillsResponse,
          experiencesResponse,
          applicationsResponse,
        ].some((response) => response.status === 401)
      ) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate(ROUTES.LOGIN);
        return;
      }

      if (
        ![
          userResponse,
          skillsResponse,
          experiencesResponse,
          applicationsResponse,
        ].every((response) => response.ok)
      ) {
        throw new Error("Impossible de charger votre profil.");
      }

      const userData = await userResponse.json();

      setUser(userData);
      setRoles(Array.isArray(userData.roles) ? userData.roles : []);
      setSkills(await skillsResponse.json());
      setExperiences(await experiencesResponse.json());
      setApplications(await applicationsResponse.json());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  function flash(message: string) {
    setSuccess(message);
    window.setTimeout(() => setSuccess(null), 3000);
  }

  async function exportMyData() {
    try {
      setError(null);

      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API}/users/me/export`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate(ROUTES.LOGIN);
        return;
      }

      if (!response.ok) {
        throw new Error("Impossible d'exporter vos données.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "mes-donnees.json";

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      flash("Vos données ont été exportées.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'export des données."
      );
    }
  }

  async function deleteAccount() {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      return;
    }
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API}/users/me`, {
        method: "DELETE",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate(ROUTES.LOGIN);
        return;
      }

      if (!response.ok) {
        throw new Error("Impossible de supprimer votre compte.");
      }

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate(ROUTES.HOME);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression du compte."
      );
    }
  }

  async function downloadDocument(
    applicationId: number,
    documentType: "resume" | "cover_letter"
  ) {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API}/applications/${applicationId}/${documentType}`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      if (!response.ok) {
        throw new Error("Impossible de récupérer le document.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;

      const disposition = response.headers.get("content-disposition");

      let filename = `${documentType}_${applicationId}.pdf`;

      if (disposition && disposition.includes("filename=")) {
        filename = disposition
          .split("filename=")[1]
          .replace(/["']/g, "");
      }

      a.download = filename;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du téléchargement."
      );
    }
  }

  async function submitSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!skillName.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      const response =
        editingSkillId === null
          ? await fetch(`${API}/skills/me`, {
              method: "POST",
              headers: authHeaders(),
              body: JSON.stringify({
                name: skillName.trim(),
                level: Number(skillLevel),
              }),
            })
          : await fetch(`${API}/skills/${editingSkillId}/me`, {
              method: "PATCH",
              headers: authHeaders(),
              body: JSON.stringify({
                level: Number(skillLevel),
              }),
            });

      if (!response.ok) {
        throw new Error(
          (
            await response.json().catch(() => null)
          )?.detail ?? "Impossible d'enregistrer la compétence."
        );
      }

      const wasEditing = editingSkillId !== null;

      setSkillName("");
      setSkillLevel("3");
      setEditingSkillId(null);

      await loadProfile();

      flash(
        wasEditing
          ? "Compétence modifiée."
          : "Compétence ajoutée."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function editSkill(item: Skill) {
    setEditingSkillId(item.skill.id);
    setSkillName(item.skill.name);
    setSkillLevel(String(item.level));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteSkill(id: number) {
    if (
      !window.confirm(
        "Supprimer cette compétence de votre profil ?"
      )
    ) {
      return;
    }

    setError(null);

    const response = await fetch(`${API}/skills/${id}/me`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!response.ok) {
      setError("Impossible de supprimer la compétence.");
      return;
    }

    setSkills((current) =>
      current.filter((item) => item.skill.id !== id)
    );

    if (editingSkillId === id) {
      setEditingSkillId(null);
      setSkillName("");
    }

    flash("Compétence supprimée.");
  }

  async function submitExperience(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!experience.name.trim() || !experience.start_date) {
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      name: experience.name.trim(),
      description: experience.description.trim() || null,
      start_date: experience.start_date,
      end_date: experience.end_date || null,
    };

    try {
      const response =
        editingExperienceId === null
          ? await fetch(`${API}/experiences/me`, {
              method: "POST",
              headers: authHeaders(),
              body: JSON.stringify(payload),
            })
          : await fetch(
              `${API}/experiences/${editingExperienceId}/me`,
              {
                method: "PATCH",
                headers: authHeaders(),
                body: JSON.stringify(payload),
              }
            );

      if (!response.ok) {
        throw new Error(
          (
            await response.json().catch(() => null)
          )?.detail ?? "Impossible d'enregistrer l'expérience."
        );
      }

      const wasEditing = editingExperienceId !== null;

      setExperience({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
      });

      setEditingExperienceId(null);

      await loadProfile();

      flash(
        wasEditing
          ? "Expérience modifiée."
          : "Expérience ajoutée."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function editExperience(item: Experience) {
    setEditingExperienceId(item.id);

    setExperience({
      name: item.name,
      description: item.description ?? "",
      start_date: item.start_date,
      end_date: item.end_date ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteExperience(id: number) {
    if (!window.confirm("Supprimer cette expérience ?")) {
      return;
    }

    setError(null);

    const response = await fetch(
      `${API}/experiences/${id}/me`,
      {
        method: "DELETE",
        headers: authHeaders(),
      }
    );

    if (!response.ok) {
      setError("Impossible de supprimer l'expérience.");
      return;
    }

    setExperiences((current) =>
      current.filter((item) => item.id !== id)
    );

    if (editingExperienceId === id) {
      setEditingExperienceId(null);

      setExperience({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
      });
    }

    flash("Expérience supprimée.");
  }

  const roleLabel = roles.includes("employer")
    ? "Employeur"
    : "Chercheur d'emploi";

  return (
    <div className="app-layout">
      <MyHeader />

      <main className="profile-page">
        <div className="profile-container">
          <p className="fr-badge fr-badge--blue-ecume">
            {roleLabel}
          </p>

          <h1>Mon profil</h1>

          {loading && (
            <p>Chargement de votre profil…</p>
          )}

          {error && (
            <div
              className="fr-alert fr-alert--error"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div
              className="fr-alert fr-alert--success"
              role="status"
            >
              <p>{success}</p>
            </div>
          )}

          {!loading && user && (
            <>
              <section
                className="profile-account fr-card"
                aria-labelledby="account-title"
              >
                <h2 id="account-title">
                  Informations du compte
                </h2>

                <p>
                  <strong>
                    {user.first_name} {user.last_name}
                  </strong>
                </p>

                <p>{user.email}</p>

                <div className="profile-actions">
                  <Button
                    priority="secondary"
                    nativeButtonProps={{
                      type: "button",
                      onClick: () => {
                        void exportMyData();
                      },
                    }}
                  >
                    Exporter mes données
                  </Button>

                  <Button
                    priority="secondary"
                    nativeButtonProps={{
                      type: "button",
                      onClick: () => {
                        void deleteAccount();
                      },
                    }}
                  >
                    Supprimer mon compte
                  </Button>
                </div>
              </section>

              <section
                className="profile-section"
                aria-labelledby="applications-title"
              >
                <h2 id="applications-title">
                  Mes candidatures
                </h2>

                {applications.length === 0 ? (
                  <p>
                    Vous n'avez envoyé aucune candidature
                    pour le moment.
                  </p>
                ) : (
                  <div className="profile-experiences">
                    {applications.map(
                      ({ application, offer }) => (
                        <article
                          key={application.id}
                          className="profile-experience fr-card"
                        >
                          <div>
                            <h3>{offer.name}</h3>

                            <p>
                              <strong>Lieu :</strong>{" "}
                              {offer.adress}
                            </p>

                            <p>
                              <strong>
                                Type de contrat :
                              </strong>{" "}
                              {offer.contract_type}
                            </p>

                     <p>
  <strong>Statut :</strong>{" "}
  <span
    className={`fr-badge fr-badge--sm application-status-badge application-status-badge--${application.status}`}
  >
    {application.status === "accepted"
      ? "Acceptée"
      : application.status === "rejected"
        ? "Refusée"
        : "En attente"}
  </span>
</p>

                            <p>
                              <small>
                                Candidature envoyée le :{" "}
                                {new Date(
                                  application.created_at
                                ).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </small>
                            </p>
                          </div>

                          <div className="profile-actions">
                            <Button
                              priority="secondary"
                              size="small"
                              nativeButtonProps={{
                                type: "button",
                                onClick: () =>
                                  void downloadDocument(
                                    application.id,
                                    "resume"
                                  ),
                              }}
                            >
                              Télécharger CV
                            </Button>

                            <Button
                              priority="secondary"
                              size="small"
                              nativeButtonProps={{
                                type: "button",
                                onClick: () =>
                                  void downloadDocument(
                                    application.id,
                                    "cover_letter"
                                  ),
                              }}
                            >
                              Télécharger LM
                            </Button>
                          </div>
                        </article>
                      )
                    )}
                  </div>
                )}
              </section>

              <section
                className="profile-section"
                aria-labelledby="skills-title"
              >
                <div className="profile-section-heading">
                  <h2 id="skills-title">
                    Compétences
                  </h2>
                </div>

                <form
                  onSubmit={submitSkill}
                  className="profile-form"
                >
                  <Input
                    label={
                      editingSkillId === null
                        ? "Ajouter une compétence"
                        : "Compétence"
                    }
                    nativeInputProps={{
                      value: skillName,
                      onChange: (e) =>
                        setSkillName(e.target.value),
                      placeholder: "Ex. Python",
                      required: true,
                    }}
                  />

                  <Select
                    label="Niveau"
                    nativeSelectProps={{
                      value: skillLevel,
                      onChange: (e) =>
                        setSkillLevel(e.target.value),
                    }}
                  >
                    <option value="1">
                      1 — Débutant
                    </option>
                    <option value="2">
                      2 — Élémentaire
                    </option>
                    <option value="3">
                      3 — Intermédiaire
                    </option>
                    <option value="4">
                      4 — Avancé
                    </option>
                    <option value="5">
                      5 — Expert
                    </option>
                  </Select>

                  <div className="profile-actions">
                    <Button
                      nativeButtonProps={{
                        type: "submit",
                        disabled: isSaving,
                      }}
                    >
                      {editingSkillId === null
                        ? "Ajouter"
                        : "Enregistrer"}
                    </Button>

                    {editingSkillId !== null && (
                      <Button
                        priority="secondary"
                        nativeButtonProps={{
                          type: "button",
                          onClick: () => {
                            setEditingSkillId(null);
                            setSkillName("");
                            setSkillLevel("3");
                          },
                        }}
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
                </form>

                {skills.length === 0 ? (
                  <p>Aucune compétence renseignée.</p>
                ) : (
                  <ul className="profile-list">
                    {skills.map((item) => (
                      <li
                        key={item.skill.id}
                        className="profile-list-item"
                      >
                        <div>
                          <strong>
                            {item.skill.name}
                          </strong>

                          <span>
                            Niveau {item.level}/5
                          </span>
                        </div>

                        <div className="profile-actions">
                          <Button
                            priority="secondary"
                            size="small"
                            nativeButtonProps={{
                              type: "button",
                              onClick: () =>
                                editSkill(item),
                            }}
                          >
                            Modifier
                          </Button>

                          <Button
                            priority="secondary"
                            size="small"
                            nativeButtonProps={{
                              type: "button",
                              onClick: () =>
                                void deleteSkill(
                                  item.skill.id
                                ),
                            }}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section
                className="profile-section"
                aria-labelledby="experiences-title"
              >
                <h2 id="experiences-title">
                  Expériences
                </h2>

                <form
                  onSubmit={submitExperience}
                  className="profile-form"
                >
                  <Input
                    label="Intitulé du poste"
                    nativeInputProps={{
                      value: experience.name,
                      onChange: (e) =>
                        setExperience({
                          ...experience,
                          name: e.target.value,
                        }),
                      required: true,
                      placeholder:
                        "Ex. Développeur backend",
                    }}
                  />

                  <div className="profile-form-grid">
                    <Input
                      label="Date de début"
                      nativeInputProps={{
                        type: "date",
                        value: experience.start_date,
                        onChange: (e) =>
                          setExperience({
                            ...experience,
                            start_date: e.target.value,
                          }),
                        required: true,
                      }}
                    />

                    <Input
                      label="Date de fin"
                      hintText="Laissez vide si le poste est toujours en cours."
                      nativeInputProps={{
                        type: "date",
                        value: experience.end_date,
                        onChange: (e) =>
                          setExperience({
                            ...experience,
                            end_date: e.target.value,
                          }),
                      }}
                    />
                  </div>

                  <div className="fr-input-group">
                    <label
                      className="fr-label"
                      htmlFor="experience-description"
                    >
                      Description
                    </label>

                    <textarea
                      id="experience-description"
                      className="fr-input"
                      value={experience.description}
                      onChange={(e) =>
                        setExperience({
                          ...experience,
                          description: e.target.value,
                        })
                      }
                      rows={5}
                      placeholder="Décrivez vos missions et réalisations."
                    />
                  </div>

                  <div className="profile-actions">
                    <Button
                      nativeButtonProps={{
                        type: "submit",
                        disabled: isSaving,
                      }}
                    >
                      {editingExperienceId === null
                        ? "Ajouter l'expérience"
                        : "Enregistrer"}
                    </Button>

                    {editingExperienceId !== null && (
                      <Button
                        priority="secondary"
                        nativeButtonProps={{
                          type: "button",
                          onClick: () => {
                            setEditingExperienceId(null);
                            setExperience({
                              name: "",
                              description: "",
                              start_date: "",
                              end_date: "",
                            });
                          },
                        }}
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
                </form>

                {experiences.length === 0 ? (
                  <p>Aucune expérience renseignée.</p>
                ) : (
                  <div className="profile-experiences">
                    {experiences.map((item) => (
                      <article
                        key={item.id}
                        className="profile-experience fr-card"
                      >
                        <div>
                          <h3>{item.name}</h3>

                          <p>
                            {item.start_date} —{" "}
                            {item.end_date ??
                              "Aujourd'hui"}
                          </p>

                          {item.description && (
                            <p>{item.description}</p>
                          )}
                        </div>

                        <div className="profile-actions">
                          <Button
                            priority="secondary"
                            size="small"
                            nativeButtonProps={{
                              type: "button",
                              onClick: () =>
                                editExperience(item),
                            }}
                          >
                            Modifier
                          </Button>

                          <Button
                            priority="secondary"
                            size="small"
                            nativeButtonProps={{
                              type: "button",
                              onClick: () =>
                                void deleteExperience(
                                  item.id
                                ),
                            }}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ProfilePage;