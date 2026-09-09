function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-content">
        <img
          className="geoemploi-footer-logo"
          src="/images/Geo_emploie_footer.png"
          alt="GéoEmploi - Les opportunités près de vous"
        />

        <p className="app-footer-disclaimer">
          Démonstrateur technique, ne constitue pas un service public en
          exploitation.
        </p>

        <ul className="app-footer-links">
          <li>
            <a href="#">Plan du site</a>
          </li>

          <li>
            <a href="#">Mentions légales</a>
          </li>

          <li>
            <a href="/cgu">Conditions générales d’utilisation</a>
          </li>

          <li>
            <a href="#">Données personnelles</a>
          </li>

          <li>
            <a href="#">Gestion des cookies</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;