import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "./routes";

type CurrentUser = {
  first_name: string;
  last_name: string;
  roles: string[];
};

const API = import.meta.env.VITE_API_BACKEND_URL;

function MyHeader() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setCurrentUser(null);
        return;
      }

      try {
        const response = await fetch(`${API}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setCurrentUser(null);
          return;
        }

        if (!response.ok) {
          throw new Error(`GET /users/me HTTP ${response.status}`);
        }

        const user = await response.json();

        const roles: string[] = Array.isArray(user.roles)
          ? user.roles
              .map((role: any) =>
                typeof role === "string" ? role : role?.name
              )
              .filter(Boolean)
          : [];

        setCurrentUser({
          first_name: user.first_name,
          last_name: user.last_name,
          roles,
        });
      } catch (error) {
        console.error(
          "Erreur lors du chargement de l'utilisateur :",
          error
        );
      }
    };

    void loadCurrentUser();

    const handleAuthChange = () => {
      void loadCurrentUser();
    };

    window.addEventListener("geoemploi-auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener(
        "geoemploi-auth-changed",
        handleAuthChange
      );
    };
  }, []);

  const isAdmin = currentUser?.roles.includes("admin") ?? false;
  const isEmployer = currentUser?.roles.includes("employer") ?? false;

  const roleLabel = isAdmin
    ? "Administrateur"
    : isEmployer
      ? "Employeur"
      : "Chercheur d'emploi";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("current_user");
    window.dispatchEvent(new Event("geoemploi-auth-changed"));
    navigate(ROUTES.HOME);
  };

  return (
    <header className="geoemploi-header">
      <div className="geoemploi-header-main">
        <div className="geoemploi-header-container">
          <a
            className="geoemploi-header-home"
            href="/"
            aria-label="Accueil - GéoEmploi"
          >
            <img
              className="geoemploi-header-logo"
              src="/images/Geo_emploie_header.png"
              alt="GéoEmploi — Les opportunités près de vous"
            />
          </a>

          <div className="geoemploi-header-actions">
            {!currentUser ? (
              <button
                type="button"
                className="geoemploi-header-login"
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                <span aria-hidden="true">◉</span>
                Se connecter
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="geoemploi-header-user"
                  onClick={() =>
                    navigate(
                      isEmployer ? ROUTES.EMPLOYER : ROUTES.PROFILE
                    )
                  }
                >
                  {currentUser.first_name} {currentUser.last_name} ·{" "}
                  {roleLabel}
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    className="geoemploi-header-action"
                    onClick={() => navigate(ROUTES.ADMIN)}
                  >
                    Panel admin
                  </button>
                )}

                <button
                  type="button"
                  className="geoemploi-header-action"
                  onClick={handleLogout}
                >
                  Se déconnecter
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <nav
        className="geoemploi-header-nav"
        aria-label="Navigation principale"
      >
        <div className="geoemploi-header-container">
          <a href="/">Accueil</a>
          <a href="/a-propos">À propos</a>
          <a href="/transparence">Transparence</a>
        </div>
      </nav>
    </header>
  );
}

export default MyHeader;