/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_URL_VIEW_OFFICEJURADO: string;
    readonly VITE_URL_DOWNLOAD_OFFICEJURADO: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}