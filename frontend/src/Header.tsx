import { Header } from "@codegouvfr/react-dsfr/Header";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ROUTES } from "./routes";

type CurrentUser = { first_name: string; last_name: string; roles: string[] };
const API = import.meta.env.VITE_API_BACKEND_URL;

function MyHeader() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setCurrentUser(null);
      return;
    }

    fetch(`${API}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })
      .then(async (response) => {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setCurrentUser(null);
          return;
        }

        if (!response.ok) {
          throw new Error(`GET /me HTTP ${response.status}`);
        }

        const user = await response.json();

        // Le backend renvoie roles comme un tableau d'objets, ex :
        // roles: [{ name: "employer" }]
        // On extrait le champ `name` de chaque rôle.
        const roles: string[] = Array.isArray(user.roles)
          ? user.roles.map((r: any) => r?.name).filter(Boolean)
          : [];

        setCurrentUser({
          first_name: user.first_name,
          last_name: user.last_name,
          roles,
        });
      })
      .catch((error) => {
        console.error(
          "Erreur lors du chargement de l'utilisateur :",
          error,
        );
      });
  }, []);

  const isAdmin = currentUser?.roles.includes("admin") ?? false;
  const isEmployer = currentUser?.roles.includes("employer") ?? false;

  let roleLabel = "Chercheur d'emploi";
  if (isAdmin) {
    roleLabel = "Administrateur";
  } else if (isEmployer) {
    roleLabel = "Employeur";
  }

  return (
    <Header
      brandTop={
        <>
          Ministère <br />
          du Job et <br />
          Bonheur
        </>
      }
      homeLinkProps={{
        href: "/",
        title: "Accueil - GeoEmploi",
      }}
      serviceTitle="GeoEmploi"
      id="fr-header-header-with-quick-access-items"
      quickAccessItems={
        !currentUser
          ? [
              {
                buttonProps: {
                  onClick: () => navigate(ROUTES.LOGIN),
                },
                iconId: "ri-account-box-line" as const,
                text: "Se connecter",
              },
            ]
          : [
              {
                buttonProps: {
                  onClick: () =>
                    navigate(isEmployer ? ROUTES.EMPLOYER : ROUTES.PROFILE),
                },
                iconId: "ri-user-line" as const,
                text: `${currentUser.first_name} ${currentUser.last_name} · ${roleLabel}`,
              },

              ...(isAdmin
                ? [
                    {
                      buttonProps: {
                        onClick: () => navigate(ROUTES.ADMIN),
                      },
                      iconId: "ri-dashboard-line" as const,
                      text: "Panel admin",
                    },
                  ]
                : []),

              {
                buttonProps: {
                  onClick: () => {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = "/";
                  },
                  className: "geoemploi-logout",
                },
                iconId: "ri-logout-box-line" as const,
                text: "Se déconnecter",
              },
            ]
      }
      navigation={[
        {
          text: "Accueil",
          linkProps: {
            href: "/",
          },
        },
        {
          text: "À propos",
          linkProps: {
            href: "/a-propos",
          },
        },
        {
          text: "Transparence",
          linkProps: {
            href: "/transparence",
          },
        },
      ]}
    />
  );
}
export default MyHeader;