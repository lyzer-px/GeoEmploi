import { Header } from "@codegouvfr/react-dsfr/Header";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ROUTES } from "./routes";

type CurrentUser = {
    first_name: string;
    last_name: string;
    roles: string[];
};

function MyHeader() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            return;
        }

        async function loadCurrentUser() {
            try {
                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                console.log(
                    "ME URL:",
                    `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/me`
                );

                const [userResponse, rolesResponse] = await Promise.all([
                    fetch(
                        `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/me`,
                        {
                            headers,
                            cache: "no-store",
                        }
                    ),
                    fetch(
                        `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/me/roles`,
                        { headers }
                    ),
                ]);

                if (!userResponse.ok || !rolesResponse.ok) {
                    return;
                }

                console.log("USER RESPONSE:", userResponse.status, await userResponse.clone().text());
                console.log("ROLES RESPONSE:", rolesResponse.status, await rolesResponse.clone().text());

                const user = await userResponse.json();
                const roles = await rolesResponse.json();

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
        }

        loadCurrentUser();
    }, []);

    return (
        <Header
            brandTop={
                <>
                    Ministère <br /> du Job et <br /> Bonheur
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
                                onClick: () => navigate("/admin"),
                            },
                            iconId: "ri-dashboard-line" as const,
                            text: currentUser.roles.includes("admin")
                                ? "🛡️ Panel admin"
                                : currentUser.roles.includes("recruiter")
                                    ? "Gestion des offres"
                                    : `Bonjour ${currentUser.first_name} ${currentUser.last_name}`,
                        },
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
                            text: "➜] Se déconnecter",
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
            ]}
        />
    );
}

export default MyHeader;