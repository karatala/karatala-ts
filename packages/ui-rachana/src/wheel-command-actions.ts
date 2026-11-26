export interface WheelCommandActions {
  readonly closeLabel: string;
  readonly helpLabel: string;
  readonly favoriteLabel: string;
  readonly favorite: boolean;
  toggleFavorite: () => void;
  closeHelp: () => void;
}
