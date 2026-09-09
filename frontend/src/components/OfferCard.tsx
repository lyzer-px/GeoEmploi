import Badge from "@codegouvfr/react-dsfr/Badge";
import type { Offer } from "../types/offer.types";
import { CONTRACT_TYPE_LABELS } from "../types/offer.types";

interface OfferCardProps {
  offer: Offer;
  applicantsCount: number;
  isSelected: boolean;
  onClick: () => void;
}

export function OfferCard({ offer, applicantsCount, isSelected, onClick }: OfferCardProps) {
  const className = isSelected ? "offer-card offer-card--selected" : "offer-card";

  return (
    <button type="button" onClick={onClick} className={className}>
      <div className="offer-card-header">
        <p className="fr-text--md fr-mb-1v offer-card-title">{offer.name}</p>
        <Badge severity="info" small>
          {CONTRACT_TYPE_LABELS[offer.contract_type]}
        </Badge>
      </div>
      <p className="fr-text--sm fr-mb-1v offer-card-address">
        {offer.adress ?? "Adresse non renseignée"}
      </p>
      <p className="fr-text--sm fr-mb-0">
        {applicantsCount} candidature{applicantsCount > 1 ? "s" : ""}
      </p>
    </button>
  );
}