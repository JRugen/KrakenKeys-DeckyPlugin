declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare global {
  const SteamClient: {
    User?: {
      GetIPCountry?: () => Promise<string> | string;
    };
  };
}

export {};
