
import { Footer as DsfrFooter } from "@codegouvfr/react-dsfr/Footer";

function Footer() {
  return (
    <DsfrFooter
      classes={{
        content: "my-footer-content",
        contentList: "my-footer-content-list",
        contentLink: "my-footer-content-link",
      }}
      accessibility="non compliant"
      bottomItems={[{text: "Plan du site", linkProps: { href: "#", }, },
        { text: "Mentions légales", linkProps: { href: "#", }, },
        { text: "Données personnelles", linkProps: { href: "#", }, },
        { text: "Gestion des cookies", linkProps: { href: "#", }, },
      ]}
    />
  );
}

export default Footer;