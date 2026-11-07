import { z } from "zod";

const safeStringCompare = (a: string, b: string): boolean => {
  const encodedA = new TextEncoder().encode(a);
  const encodedB = new TextEncoder().encode(b);

  if (encodedA.length !== encodedB.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < encodedA.length; index += 1) {
    mismatch |= encodedA[index] ^ encodedB[index];
  }

  return mismatch === 0;
};

const sanitizeValue = (value: string) =>
  value.replace(/[\u0000-\u001F\u007F]/g, "").trim();

const usernameSchema = z
  .string()
  .transform((value) => sanitizeValue(value))
  .pipe(
    z
      .string()
      .min(3, "Username must be at least 3 characters long.")
      .max(24, "Username must be 24 characters or fewer.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username may only contain letters, numbers, and underscores.",
      ),
  )
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .transform((value) => sanitizeValue(value))
  .pipe(
    z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .max(128, "Password must be 128 characters or fewer.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
        "Password must include uppercase, lowercase, a number, and a symbol.",
      ),
  );

export const signUpSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .superRefine((data, ctx) => {
    if (!safeStringCompare(data.password, data.confirmPassword)) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "Passwords do not match.",
      });
    }
  });

export const loginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
