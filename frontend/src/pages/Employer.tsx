import { useCallback, useEffect, useState } from "react";

import Alert from "@codegouvfr/react-dsfr/Alert";

import { OfferPanel } from "../components/OfferPanel";
import { ApplicantsPanel } from "../components/ApplicantsPanel";
import {
  OfferFormModal,
  offerFormModal,
} from "../components/OfferFormModal";

import type {
  Applicant,
  ApplicationStatus,
  Offer,
  OfferFormValues,
} from "../types/offer.types";

import MyHeader from "../Header";
import Footer from "../Footer";

import "../Employer.css";

const API_BACKEND_URL =
  import.meta.env.VITE_API_BACKEND_URL;

const OFFERS_BASE =
  `${API_BACKEND_URL}/offers`;

/**
 * Ajoute le token JWT aux requêtes.
 */
function authHeaders(): Record<string, string> {
  const token =
    localStorage.getItem("access_token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

/**
 * Normalise la réponse des offres.
 *
 * Accepte :
 * [
 *   {...},
 *   {...}
 * ]
 *
 * ou :
 *
 * {
 *   items: [...]
 * }
 */
function normalizeOffers(
  data: unknown
): Offer[] {
  if (Array.isArray(data)) {
    return data as Offer[];
  }

  if (
    data &&
    typeof data === "object" &&
    Array.isArray(
      (data as { items?: unknown }).items
    )
  ) {
    return (data as { items: Offer[] })
      .items;
  }

  console.warn(
    "Réponse offres inattendue :",
    data
  );

  return [];
}

/**
 * Normalise la réponse des candidatures.
 *
 * Le backend renvoie actuellement :
 *
 * {
 *   offer: {...},
 *   first_name: "...",
 *   last_name: "...",
 *   email: "...",
 *   applications: [...]
 * }
 */
function normalizeApplicants(
  data: unknown
): Applicant[] {
  if (Array.isArray(data)) {
    return data as Applicant[];
  }

  if (
    data &&
    typeof data === "object" &&
    Array.isArray(
      (data as { applications?: unknown })
        .applications
    )
  ) {
    return (
      data as {
        applications: Applicant[];
      }
    ).applications;
  }

  console.warn(
    "Réponse candidatures inattendue :",
    data
  );

  return [];
}

/**
 * Géocode une adresse.
 */
async function geocodeAddress(
  address: string
) {
  const response = await fetch(
    `https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(
      address
    )}`
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de géolocaliser cette adresse"
    );
  }

  const data =
    (await response.json()) as {
      features: Array<{
        geometry: {
          coordinates: [
            number,
            number
          ];
        };
        properties: {
          score: number;
        };
      }>;
    };

  if (data.features.length === 0) {
    throw new Error(
      "Adresse introuvable"
    );
  }

  const [best] =
    data.features;

  const [
    longitude,
    latitude,
  ] = best.geometry.coordinates;

  return {
    latitude,
    longitude,
    geocoding_source: "geopf",
    geocoding_score:
      best.properties.score,
  };
}

export default function EmployerPage() {
  const [offers, setOffers] =
    useState<Offer[]>([]);

  const [
    isLoadingOffers,
    setIsLoadingOffers,
  ] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    selectedOfferId,
    setSelectedOfferId,
  ] = useState<number | null>(null);

  const [
    applicantsByOffer,
    setApplicantsByOffer,
  ] = useState<
    Record<number, Applicant[]>
  >({});

  const [
    isLoadingApplicants,
    setIsLoadingApplicants,
  ] = useState(false);

  const [
    offerToEdit,
    setOfferToEdit,
  ] = useState<Offer | null>(null);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  /**
   * Récupération des offres de l'employeur.
   */
  useEffect(() => {
    let cancelled = false;

    setIsLoadingOffers(true);

    fetch(`${OFFERS_BASE}/me`, {
      headers: authHeaders(),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            "Impossible de récupérer vos offres"
          );
        }

        return await response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setOffers(
            normalizeOffers(data)
          );
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingOffers(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Récupération des candidatures
   * d'une offre.
   */
  const loadApplicants =
    useCallback(
      async (offerId: number) => {
        if (
          applicantsByOffer[
            offerId
          ]
        ) {
          return;
        }

        setIsLoadingApplicants(
          true
        );

        try {
          const response =
            await fetch(
              `${OFFERS_BASE}/me/${offerId}`,
              {
                headers:
                  authHeaders(),
              }
            );

          if (!response.ok) {
            throw new Error(
              "Impossible de récupérer les candidatures"
            );
          }

          const data =
            await response.json();

          const applicants =
            normalizeApplicants(
              data
            );

          setApplicantsByOffer(
            (prev) => ({
              ...prev,
              [offerId]:
                applicants,
            })
          );
        } catch (err) {
          setError(
            (err as Error)
              .message
          );
        } finally {
          setIsLoadingApplicants(
            false
          );
        }
      },
      [applicantsByOffer]
    );

  /**
   * Sélection d'une offre.
   */
  const handleSelectOffer = (
    offerId: number
  ) => {
    setSelectedOfferId(
      offerId
    );

    void loadApplicants(
      offerId
    );
  };

  /**
   * Nombre de candidatures
   * pour chaque offre.
   */
  const applicantsCountByOffer =
    Object.fromEntries(
      offers.map((offer) => [
        offer.id,
        applicantsByOffer[
          offer.id
        ]?.length ?? 0,
      ])
    );

  const selectedOffer =
    offers.find(
      (offer) =>
        offer.id ===
        selectedOfferId
    ) ?? null;

  const selectedOfferApplicants =
    selectedOfferId !== null
      ? applicantsByOffer[
          selectedOfferId
        ] ?? []
      : [];

  /**
   * Création d'une offre.
   */
  const handleCreateOffer =
    () => {
      setOfferToEdit(null);
      offerFormModal.open();
    };

  /**
   * Modification d'une offre.
   */
  const handleEditOffer = (
    offer: Offer
  ) => {
    setOfferToEdit(offer);
    offerFormModal.open();
  };

  /**
   * Création / modification
   * d'une offre.
   */
  const handleSubmitOffer =
    async (
      values: OfferFormValues
    ) => {
      setIsSubmitting(true);
      setError(null);

      const isEditing =
        offerToEdit !== null;

      const url = isEditing
        ? `${OFFERS_BASE}/${offerToEdit.id}`
        : `${OFFERS_BASE}/`;

      try {
        const geocoding =
          await geocodeAddress(
            values.adress
          );

        const body = {
          ...values,

          // Le formulaire utilise ""
          // mais le backend attend null
          // pour une date optionnelle.
          end_date:
            values.end_date ||
            null,

          ...geocoding,
        };

        const response =
          await fetch(url, {
            method: isEditing
              ? "PATCH"
              : "POST",

            headers: {
              "Content-Type":
                "application/json",
              ...authHeaders(),
            },

            body: JSON.stringify(
              body
            ),
          });

        if (!response.ok) {
          throw new Error(
            isEditing
              ? "Impossible de modifier l'offre"
              : "Impossible de publier l'offre"
          );
        }

        const savedOffer =
          (await response.json()) as Offer;

        if (isEditing) {
          setOffers(
            (prev) =>
              prev.map((offer) =>
                offer.id ===
                savedOffer.id
                  ? savedOffer
                  : offer
              )
          );
        } else {
          setOffers(
            (prev) => [
              savedOffer,
              ...prev,
            ]
          );
        }
      } catch (err) {
        setError(
          (err as Error)
            .message
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  /**
   * Suppression d'une offre.
   */
  const handleDeleteOffer =
    async (
      offer: Offer
    ) => {
      const confirmed =
        window.confirm(
          `Supprimer l'offre "${offer.name}" ? Cette action est irréversible.`
        );

      if (!confirmed) {
        return;
      }

      setIsDeleting(true);
      setError(null);

      try {
        const response =
          await fetch(
            `${OFFERS_BASE}/${offer.id}`,
            {
              method: "DELETE",
              headers:
                authHeaders(),
            }
          );

        if (!response.ok) {
          throw new Error(
            "Impossible de supprimer l'offre"
          );
        }

        setOffers(
          (prev) =>
            prev.filter(
              (item) =>
                item.id !==
                offer.id
            )
        );

        setApplicantsByOffer(
          (prev) => {
            const copy = {
              ...prev,
            };

            delete copy[
              offer.id
            ];

            return copy;
          }
        );

        if (
          selectedOfferId ===
          offer.id
        ) {
          setSelectedOfferId(
            null
          );
        }
      } catch (err) {
        setError(
          (err as Error)
            .message
        );
      } finally {
        setIsDeleting(
          false
        );
      }
    };

  /**
   * Modification du statut
   * d'une candidature.
   */
  const updateApplicationStatus =
    async (
      applicationId: number,
      newStatus: ApplicationStatus
    ) => {
      if (
        selectedOfferId ===
        null
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_BACKEND_URL}/applications/${applicationId}`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
                ...authHeaders(),
              },

              body: JSON.stringify(
                {
                  status:
                    newStatus,
                }
              ),
            }
          );

        if (!response.ok) {
          throw new Error(
            "Impossible de modifier le statut de la candidature"
          );
        }

        const updatedApplication =
          (await response.json()) as Applicant;

        setApplicantsByOffer(
          (prev) => ({
            ...prev,

            [selectedOfferId]:
              (
                prev[
                  selectedOfferId
                ] ?? []
              ).map(
                (applicant) =>
                  applicant.id ===
                  updatedApplication.id
                    ? updatedApplication
                    : applicant
              ),
          })
        );
      } catch (err) {
        setError(
          (err as Error)
            .message
        );
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
            onClose={() =>
              setError(null)
            }
            className="fr-mb-2w"
          />
        )}

        <div className="employer-layout">
          {/* Liste des offres */}
          {isLoadingOffers ? (
            <p>
              Chargement des offres...
            </p>
          ) : (
            <OfferPanel
              offers={offers}
              applicantsCountByOffer={
                applicantsCountByOffer
              }
              selectedOfferId={
                selectedOfferId
              }
              onSelectOffer={
                handleSelectOffer
              }
              onCreateOffer={
                handleCreateOffer
              }
            />
          )}

          {/* Détails + candidatures */}
          <div>
            {selectedOffer && (
              <div className="employer-detail-actions">
                <button
                  type="button"
                  className="fr-link employer-edit-link"
                  onClick={() =>
                    handleEditOffer(
                      selectedOffer
                    )
                  }
                >
                  Modifier cette offre
                </button>

                <button
                  type="button"
                  className="fr-link employer-delete-link"
                  onClick={() =>
                    handleDeleteOffer(
                      selectedOffer
                    )
                  }
                  disabled={
                    isDeleting
                  }
                >
                  Supprimer cette offre
                </button>
              </div>
            )}

            {isLoadingApplicants ? (
              <p>
                Chargement des candidatures...
              </p>
            ) : (
              <ApplicantsPanel
                offer={
                  selectedOffer
                }
                applicants={
                  selectedOfferApplicants
                }
                onUpdateStatus={
                  updateApplicationStatus
                }
              />
            )}
          </div>
        </div>

        <OfferFormModal
          offerToEdit={
            offerToEdit
          }
          onSubmit={
            handleSubmitOffer
          }
          isSubmitting={
            isSubmitting
          }
        />
      </div>

      <Footer />
    </div>
  );
}