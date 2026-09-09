import Button from "@codegouvfr/react-dsfr/Button";
import type { Applicant, Offer } from "../types/offer.types";

interface ApplicantsPanelProps {
  offer: Offer | null;
  applicants: Applicant[];
}

const API_BACKEND_URL = import.meta.env.VITE_API_BACKEND_URL;

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function openApplicationFile(
  applicationId: number,
  type: "resume" | "cover_letter"
) {
  try {
    const response = await fetch(
      `${API_BACKEND_URL}/applications/${applicationId}/${type}`,
      {
        headers: authHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        type === "resume"
          ? "Impossible de récupérer le CV."
          : "Impossible de récupérer la lettre de motivation."
      );
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    console.error("Erreur lors de la récupération du fichier :", error);
  }
}

export function ApplicantsPanel({ offer, applicants }: ApplicantsPanelProps) {
  if (!offer) {
    return (
      <p className="fr-text--sm applicants-placeholder">
        Sélectionnez une offre pour voir les candidatures reçues.
      </p>
    );
  }

  const list = Array.isArray(applicants) ? applicants : [];

  return (
    <div>
      <h2 className="fr-h5">{offer.name}</h2>
      <p className="fr-text--sm">{offer.description}</p>

      <h3 className="fr-h6 fr-mt-3w">
        Candidatures ({list.length})
      </h3>

      {list.length === 0 && (
        <p className="fr-text--sm">
          Aucune candidature pour le moment.
        </p>
      )}

      <ul className="fr-raw-list">
        {list.map((applicant) => (
          <li key={applicant.id} className="applicant-item">
            <p className="fr-mb-0 applicant-name">
              {applicant.first_name} {applicant.last_name}
            </p>

            <p className="fr-text--sm fr-mb-1w">
              {applicant.email}
            </p>

            <div className="fr-btns-group fr-btns-group--sm">
              <Button
                priority="secondary"
                onClick={() =>
                  void openApplicationFile(applicant.id, "resume")
                }
              >
                CV
              </Button>

              <Button
                priority="secondary"
                onClick={() =>
                  void openApplicationFile(applicant.id, "cover_letter")
                }
              >
                Lettre de motivation
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}