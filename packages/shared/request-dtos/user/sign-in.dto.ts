import { z } from 'zod';
import { booleanSchema, emailSchema, nameSchema, optionalNameSchema, urlSchema } from '../../dtos';

export const SignInDtoSchema = z.object({
  name: z.object({
    firstName: nameSchema,
    fullName: nameSchema,
    required: booleanSchema.optional(),
    middleName: optionalNameSchema,
    lastName: optionalNameSchema,
  }),
  email: emailSchema,
  image: urlSchema,
});

export type SignInDto = z.infer<typeof SignInDtoSchema>;
