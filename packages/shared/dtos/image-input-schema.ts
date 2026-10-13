import { z } from 'zod';

import { urlSchema } from './url-schema';

const dataUriPattern = /^data:image\/(png|jpe?g|gif|webp|avif);base64,[A-Za-z0-9+/=]+$/;

export const imageDataUriSchema = z.string().regex(dataUriPattern, 'Invalid image data URI');

/** An image delivered either as an external http(s) URL or a base64 data URI. */
export const imageInputSchema = z.union([imageDataUriSchema, urlSchema]);
export const optionalImageInputSchema = imageInputSchema.optional();

export type ImageDataUriType = z.infer<typeof imageDataUriSchema>;
export type ImageInputType = z.infer<typeof imageInputSchema>;
export type OptionalImageInputType = z.infer<typeof optionalImageInputSchema>;
