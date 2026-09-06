import Button from "@codegouvfr/react-dsfr/Button";
import type { Offer } from "../types/offer.types";
import { OfferCard } from "./OfferCard";

interface OfferPanelProps {
  offers: Offer[];
  applicantsCountByOffer: Record<number, number>;
  selectedOfferId: number | null;
  onSelectOffer: (offerId: number) => void;
  onCreateOffer: () => void;
}

export function OfferPanel({
  offers,
  applicantsCountByOffer,
  selectedOfferId,
  onSelectOffer,
  onCreateOffer,
}: OfferPanelProps) {
  return (
    <div className="offer-panel">
      <div className="offer-panel-header">
        <h2 className="fr-h5 fr-mb-0">Mes offres ({offers.length})</h2>
        <Button iconId="fr-icon-add-line" onClick={onCreateOffer} size="small">
          Créer une offre
        </Button>
      </div>

      <div className="offer-panel-list">
        {offers.length === 0 && (
          <p className="fr-text--sm">Vous n'avez pas encore publié d'offre.</p>
        )}
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            applicantsCount={applicantsCountByOffer[offer.id] ?? 0}
            isSelected={offer.id === selectedOfferId}
            onClick={() => onSelectOffer(offer.id)}
          />
        ))}
      </div>
    </div>
  );
}