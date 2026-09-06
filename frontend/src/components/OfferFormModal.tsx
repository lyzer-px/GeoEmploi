import { useEffect, useState } from "react";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import type { ContractType, Offer, OfferFormValues } from "../types/offer.types";
import { CONTRACT_TYPE_LABELS } from "../types/offer.types";

export const offerFormModal = createModal({
  id: "offer-form-modal",
  isOpenedByDefault: false,
});

const emptyValues: OfferFormValues = {
  name: "",
  description: "",
  start_date: "",
  end_date: "",
  contract_type: "full-time",
  adress: "",
};

interface OfferFormModalProps {
  offerToEdit: Offer | null;
  onSubmit: (values: OfferFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function OfferFormModal({ offerToEdit, onSubmit, isSubmitting = false }: OfferFormModalProps) {
  const [values, setValues] = useState<OfferFormValues>(emptyValues);

  useEffect(() => {
    if (offerToEdit) {
      setValues({
        name: offerToEdit.name,
        description: offerToEdit.description,
        start_date: offerToEdit.start_date,
        end_date: offerToEdit.end_date ?? "",
        contract_type: offerToEdit.contract_type,
        adress: offerToEdit.adress ?? "",
      });
    } else {
      setValues(emptyValues);
    }
  }, [offerToEdit]);

  const handleChange = <K extends keyof OfferFormValues>(key: K, value: OfferFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    await onSubmit(values);
    offerFormModal.close();
  };

  return (
    <offerFormModal.Component
      title={offerToEdit ? "Modifier l'offre" : "Créer une offre"}
      buttons={[
        { children: "Annuler", priority: "secondary" },
        {
          children: offerToEdit ? "Enregistrer" : "Publier l'offre",
          onClick: handleSubmit,
          doClosesModal: false,
          disabled: isSubmitting,
        },
      ]}
    >
      <Input
        label="Intitulé du poste"
        nativeInputProps={{
          value: values.name,
          onChange: (e) => handleChange("name", e.target.value),
        }}
      />
      <Input
        label="Description"
        textArea
        nativeTextAreaProps={{
          value: values.description,
          onChange: (e) => handleChange("description", e.target.value),
          rows: 4,
        }}
      />
      <Select
        label="Type de contrat"
        nativeSelectProps={{
          value: values.contract_type,
          onChange: (e) => handleChange("contract_type", e.target.value as ContractType),
        }}
      >
        {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Input
        label="Date de début"
        nativeInputProps={{
          type: "date",
          value: values.start_date,
          onChange: (e) => handleChange("start_date", e.target.value),
        }}
      />
      <Input
        label="Date de fin (optionnelle)"
        nativeInputProps={{
          type: "date",
          value: values.end_date,
          onChange: (e) => handleChange("end_date", e.target.value),
        }}
      />
      <Input
        label="Adresse du poste"
        hintText="Utilisée pour géolocaliser l'offre sur la carte."
        nativeInputProps={{
          value: values.adress,
          onChange: (e) => handleChange("adress", e.target.value),
        }}
      />
    </offerFormModal.Component>
  );
}