import type { Applicant, Offer } from "../types/offer.types";

interface ApplicantsPanelProps {
  offer: Offer | null;
  applicants: Applicant[];
}

export function ApplicantsPanel({ offer, applicants }: ApplicantsPanelProps) {
  if (!offer) {
    return (
      <p className="fr-text--sm applicants-placeholder">
        Sélectionnez une offre pour voir les candidatures reçues.
      </p>
    );
  }

  return (
    <div>
      <h2 className="fr-h5">{offer.name}</h2>
      <p className="fr-text--sm">{offer.description}</p>

      <h3 className="fr-h6 fr-mt-3w">Candidatures ({applicants.length})</h3>
      {applicants.length === 0 && <p className="fr-text--sm">Aucune candidature pour le moment.</p>}
      <ul className="fr-raw-list">
        {applicants.map((applicant) => (
          <li key={applicant.id} className="applicant-item">
            <p className="fr-mb-0 applicant-name">
              {applicant.first_name} {applicant.last_name}
            </p>
            <p className="fr-text--sm fr-mb-0">{applicant.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}