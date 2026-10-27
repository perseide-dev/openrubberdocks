import { User } from "@moduleUsers/entities/user.entity";

export interface RefreshTokenPayload extends User {
    refreshToken: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
