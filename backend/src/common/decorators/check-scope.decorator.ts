import { SetMetadata } from '@nestjs/common';

export const SCOPE_KEY = 'scope';
export const CheckScope = (paramName: string) => SetMetadata(SCOPE_KEY, paramName);
