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
        const stored = localStorage.getItem("current_user");
        if (!stored) return;

        try {
            setCurrentUser(JSON.parse(stored));
        } catch {
            setCurrentUser(null);
        }
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
                                : currentUser.roles.includes("employer")
                                    ? "Gestion des offres"
                                    : `Bonjour ${currentUser.first_name} ${currentUser.last_name}`,
                        },
                        {
                            buttonProps: {
                                onClick: () => {
                                    localStorage.removeItem("access_token");
                                    localStorage.removeItem("refresh_token");
                                    localStorage.removeItem("current_user");
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