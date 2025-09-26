export interface Espace {
  id: number;
  name: string;
  surface?: number;
  description?: string;
  capacity?: number;
  status: boolean;
  validation: boolean;
  pricePerHour?: number;
  images?: string[];
  location?: string;
  entitiesId?: number;
  typeEspacesId?: number;
}

export type CreateEspaceDto = Omit<Espace, 'id'>;
export type UpdateEspaceDto = Partial<CreateEspaceDto>;
