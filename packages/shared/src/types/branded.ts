import { z } from 'zod'

export function branded<B extends z.ZodTypeAny, R>(
  baseParser: B,
  Brand: (b: z.infer<B>) => R,
): z.ZodTypeAny {
  return baseParser
    .refine((a: z.infer<B>) => {
      try {
        Brand(a)
        return true
      } catch {
        return false
      }
    })
    .transform(Brand)
}

export function stringAs<T>(Brand: (s: string) => T): z.ZodTypeAny {
  return branded(z.string(), Brand)
}

export function numberAs<T>(Brand: (n: number) => T): z.ZodTypeAny {
  return branded(z.number(), Brand)
}