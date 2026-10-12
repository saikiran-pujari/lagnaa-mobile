import { z } from 'zod';

import { envelope } from './common';

export const PresignedUploadResponse = envelope(
  z.looseObject({
    uploadUrl: z.string(),
    fileKey: z.string().optional(),
    objectKey: z.string().optional(),
    expiresIn: z.number().optional(),
  }),
);
export const PresignedViewResponse = envelope(
  z.looseObject({ viewUrl: z.string(), expiresIn: z.number().optional() }),
);
export const UploadStatusResponse = envelope(
  z.looseObject({
    configured: z.boolean().optional(),
    maxFileSizeBytes: z.number().optional(),
    allowedContentTypes: z.array(z.string()).optional(),
  }),
);
export const FcmTokenResponse = envelope(
  z.looseObject({ registered: z.boolean().optional(), removed: z.boolean().optional() }),
);
