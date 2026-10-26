import { SetMetadata } from '@nestjs/common';

export const SKIP_AUDIT_KEY = 'skip_audit';
export const SkipAudit = () => SetMetadata(SKIP_AUDIT_KEY, true);
