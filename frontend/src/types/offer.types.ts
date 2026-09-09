export type ContractType = "part-time" | "full-time" | "internship" | "volunteer";

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  "part-time": "Temps partiel",
  "full-time": "Temps plein",
  "internship": "Stage",
  "volunteer": "Bénévolat",
};

export interface OfferEmployer {
  first_name: string;
  last_name: string;
}

export interface Offer {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  contract_type: ContractType;
  latitude: number;
  longitude: number;
  adress: string;
  employer: OfferEmployer;
}

export interface OffersPage {
  items: Offer[];
  total: number;
  current_page: string;
  current_page_backwards: string;
  previous_page: string;
  next_page: string;
}

export interface OfferFormValues {
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  contract_type: ContractType;
  adress: string;
}

export interface Applicant {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface CreatorOfferOut {
  offer: Offer;
  first_name: string;
  last_name: string;
  email: string;
  applications: Applicant[];
}