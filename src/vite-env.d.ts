/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    google?: {
      maps?: {
        DistanceMatrixService: new () => {
          getDistanceMatrix: (
            request: any,
            callback: (response: any, status: any) => void
          ) => void;
        };
        TravelMode: {
          DRIVING: any;
        };
        UnitSystem: {
          METRIC: any;
        };
      };
    };
  }
}

export {};
