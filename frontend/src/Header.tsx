import { Header } from "@codegouvfr/react-dsfr/Header";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "./routes";

function MyHeader() {
    const navigate = useNavigate();

    return (
        <Header
        brandTop={<> Ministère <br /> du Job et <br /> Bonheur </>}
        homeLinkProps={{
            href: "/",
            title: "Accueil - GeoEmploi",
        }}
        serviceTitle="GeoEmploi"
        id="fr-header-header-with-quick-access-items"
        quickAccessItems={[
            {
            buttonProps: {
                onClick: () => navigate(ROUTES.LOGIN),
            },
            iconId: 'ri-account-box-line',
            text: 'Se connecter'
            }
        ]}
        navigation={[{ text: "Accueil", linkProps: {href: ROUTES.HOME,}, },
            { text: "À propos", linkProps: { href: ROUTES.ABOUT,}, },
        ]}
        />
    );
}

export default MyHeader;