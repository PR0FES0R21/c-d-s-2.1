// ===========================================================================
// File: src/types/auth.ts (UPDATED - Cookie-based Auth Response Types)
// Deskripsi: Definisi tipe untuk response autentikasi berbasis cookie
// ===========================================================================

export interface TwitterOAuthInitiateResponse {
    redirect_url: string;
}

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