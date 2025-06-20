// ===========================================================================
// File: src/types/auth.ts (UPDATED - Modular OAuth Response Types)
// Deskripsi: Definisi tipe untuk response autentikasi berbasis cookie dengan support multi-platform OAuth
// ===========================================================================

export interface OAuthInitiateResponse {
    redirect_url: string;
    platform?: string; // Optional untuk backward compatibility
}

// Legacy type untuk backward compatibility
export interface TwitterOAuthInitiateResponse extends OAuthInitiateResponse {}

// Response type untuk autentikasi yang berhasil
export interface AuthSuccessResponse {
    message: string;
}

// Response type untuk error
export interface AuthErrorResponse {
    detail: string;
}

// Challenge response type
export interface ChallengeResponse {
    messageToSign: string;
    nonce: string;
}

// OAuth Platform types
export type OAuthPlatform = 'x' | 'discord' | 'telegram' | 'github';

export interface OAuthPlatformConfig {
    name: string;
    displayName: string;
    icon: string;
    color: string;
    endpoint: string;
}