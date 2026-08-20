import { User } from "@moduleUsers/entities/user.entity";

export interface RefreshTokenPayload extends User {
    refreshToken: string
}