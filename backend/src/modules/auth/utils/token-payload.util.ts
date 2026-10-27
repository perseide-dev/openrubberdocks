export const buildTokenPayload = (data: { uuid: string; refreshToken: string }) => ({
    userUUID: data.uuid,
    refreshToken: data.refreshToken,
});

export const buildGenerateTokenPayload = (data: { uuid: string; rubberHandle: string }) => ({
    userUUID: data.uuid,
    rubberHandle: data.rubberHandle,
});