
import { Header } from "@codegouvfr/react-dsfr/Header";

function MyHeader() {
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
                onClick: function noRefCheck(){}
            },
            iconId: 'ri-account-box-line',
            text: 'Se connecter'
            // buttonProps: {
            //     onClick: () => {
            //         setIsLoggedIn(true);
            //     }
            // }
            }
        ]}
        navigation={[{ text: "Accueil", linkProps: {href: "/",}, },
            { text: "Nos offres", linkProps: { href: "/offres",}, },
            { text: "À propos", linkProps: { href: "/a-propos",}, },
        ]}
        />
    );
}

export default MyHeader;