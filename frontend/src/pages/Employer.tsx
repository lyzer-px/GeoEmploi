import { useCallback, useEffect, useState } from "react";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { OfferPanel } from "../components/OfferPanel";
import { ApplicantsPanel } from "../components/ApplicantsPanel";
import { OfferFormModal, offerFormModal } from "../components/OfferFormModal";
import type { Applicant, Offer, OfferFormValues, OffersPage } from "../types/offer.types";
import MyHeader from "../Header";
import Footer from "../Footer";
import "../Employer.css";

const API_BACKEND_URL = import.meta.env.VITE_API_BACKEND_URL;
const OFFERS_BASE = `${API_BACKEND_URL}/offers`;

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function geocodeAddress(address: string) {
  const response = await fetch(
    `https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(address)}`
  );
  if (!response.ok) throw new Error("Impossible de géolocaliser cette adresse");

  const data = (await response.json()) as {
    features: Array<{
      geometry: { coordinates: [number, number] };
      properties: { score: number };
    }>;
  };

  if (data.features.length === 0) {
    throw new Error("Adresse introuvable, essayez d'être plus précis");
  }

  const [best] = data.features;
  const [longitude, latitude] = best.geometry.coordinates;

  return {
    latitude,
    longitude,
    geocoding_source: "geopf",
    geocoding_score: best.properties.score,
  };
}

export default function EmployerPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [applicantsByOffer, setApplicantsByOffer] = useState<Record<number, Applicant[]>>({});
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);

  const [offerToEdit, setOfferToEdit] = useState<Offer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingOffers(true);

    fetch(`${OFFERS_BASE}/`, { headers: authHeaders() })
      .then(async (response) => {
        if (!response.ok) throw new Error("Impossible de récupérer vos offres");
        return (await response.json()) as OffersPage;
      })
      .then((data) => {
        if (!cancelled) setOffers(data.items);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingOffers(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loadApplicants = useCallback(
    async (offerId: number) => {
      if (applicantsByOffer[offerId]) return;
      setIsLoadingApplicants(true);
      try {
        const response = await fetch(`${OFFERS_BASE}/${offerId}/applications`, {
          headers: authHeaders(),
        });
        if (!response.ok) throw new Error("Impossible de récupérer les candidatures");
        const applicants = (await response.json()) as Applicant[];
        setApplicantsByOffer((prev) => ({ ...prev, [offerId]: applicants }));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoadingApplicants(false);
      }
    },
    [applicantsByOffer]
  );

  const handleSelectOffer = (offerId: number) => {
    setSelectedOfferId(offerId);
    void loadApplicants(offerId);
  };

  const applicantsCountByOffer = Object.fromEntries(
    offers.map((o) => [o.id, applicantsByOffer[o.id]?.length ?? 0])
  );

  const selectedOffer = offers.find((o) => o.id === selectedOfferId) ?? null;
  const selectedOfferApplicants = selectedOfferId ? applicantsByOffer[selectedOfferId] ?? [] : [];

  const handleCreateOffer = () => {
    setOfferToEdit(null);
    offerFormModal.open();
  };

  const handleEditOffer = (offer: Offer) => {
    setOfferToEdit(offer);
    offerFormModal.open();
  };

  const handleSubmitOffer = async (values: OfferFormValues) => {
    setIsSubmitting(true);
    setError(null);

    const isEditing = offerToEdit !== null;
    const url = isEditing ? `${OFFERS_BASE}/${offerToEdit!.id}` : `${OFFERS_BASE}/`;

    try {
      const geocoding = await geocodeAddress(values.adress);
      const body = { ...values, ...geocoding };

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(isEditing ? "Impossible de modifier l'offre" : "Impossible de publier l'offre");
      }
      const savedOffer = (await response.json()) as Offer;

      if (isEditing) {
        setOffers((prev) => prev.map((o) => (o.id === savedOffer.id ? savedOffer : o)));
      } else {
        setOffers((prev) => [savedOffer, ...prev]);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOffer = async (offer: Offer) => {
    const confirmed = window.confirm(`Supprimer l'offre "${offer.name}" ? Cette action est irréversible.`);
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(`${OFFERS_BASE}/${offer.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error("Impossible de supprimer l'offre");

      setOffers((prev) => prev.filter((o) => o.id !== offer.id));
      if (selectedOfferId === offer.id) {
        setSelectedOfferId(null);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <MyHeader />
      <div className="fr-container fr-py-4w">
        {error && (
          <Alert
            severity="error"
            title="Une erreur est survenue"
            description={error}
            closable
            onClose={() => setError(null)}
            className="fr-mb-2w"
          />
        )}

        <div className="employer-layout">
          {isLoadingOffers ? (
            <p>Chargement des offres...</p>
          ) : (
            <OfferPanel
              offers={offers}
              applicantsCountByOffer={applicantsCountByOffer}
              selectedOfferId={selectedOfferId}
              onSelectOffer={handleSelectOffer}
              onCreateOffer={handleCreateOffer}
            />
          )}

          <div>
            {selectedOffer && (
              <div className="employer-detail-actions">
                <button type="button" className="fr-link employer-edit-link" onClick={() => handleEditOffer(selectedOffer)}>
                  Modifier cette offre
                </button>
                <button
                  type="button"
                  className="fr-link employer-delete-link"
                  onClick={() => handleDeleteOffer(selectedOffer)}
                  disabled={isDeleting}
                >
                  Supprimer cette offre
                </button>
              </div>
            )}
            {isLoadingApplicants ? (
              <p>Chargement des candidatures...</p>
            ) : (
              <ApplicantsPanel offer={selectedOffer} applicants={selectedOfferApplicants} />
            )}
          </div>
        </div>

        <OfferFormModal offerToEdit={offerToEdit} onSubmit={handleSubmitOffer} isSubmitting={isSubmitting} />
      </div>
      <Footer />
    </div>
  );
}