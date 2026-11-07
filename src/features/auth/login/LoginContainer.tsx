"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { AuthResult } from "@/app/actions/auth";
import { loginSchema } from "@/lib/validations/auth";
import { LoginScreen } from "./LoginScreen";

type LoginContainerProps = {
  loginAction: (formData: FormData) => Promise<AuthResult>;
  googleLoginAction: () => Promise<AuthResult>;
};

export function LoginContainer({
  loginAction,
  googleLoginAction,
}: LoginContainerProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepVaultOpen, setKeepVaultOpen] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateLoginFields = () => {
    const parsed = loginSchema.safeParse({
      username: identifier,
      password,
    });

    const nextIdentifierError = parsed.success
      ? null
      : (parsed.error.issues.find((issue) => issue.path[0] === "username")
          ?.message ?? null);
    const nextPasswordError = parsed.success
      ? null
      : (parsed.error.issues.find((issue) => issue.path[0] === "password")
          ?.message ?? null);

    setIdentifierError(nextIdentifierError);
    setPasswordError(nextPasswordError);

    if (!parsed.success) {
      toast.error("Please fix the highlighted fields and try again.");
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateLoginFields()) {
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("username", identifier.trim());
    formData.set("password", password);

    try {
      const result = await loginAction(formData);

      if (!result.success) {
        setErrorMessage(result.message);
        toast.error(result.message);
        return;
      }

      router.push("/dashboard?login=success");
    } catch {
      setErrorMessage("Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIdentifierError(null);
    setPasswordError(null);
    setIsSubmitting(true);

    try {
      const result = await googleLoginAction();

      if (!result.success || !result.url) {
        toast.error(result.message);
        return;
      }

      window.location.assign(result.url);
    } catch {
      setErrorMessage("Unable to continue with Google. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginScreen
      identifier={identifier}
      password={password}
      showPassword={showPassword}
      keepVaultOpen={keepVaultOpen}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      identifierError={identifierError}
      passwordError={passwordError}
      onIdentifierChange={(value) => {
        setIdentifier(value);
        if (errorMessage) {
          setErrorMessage(null);
        }
        if (identifierError) {
          setIdentifierError(null);
        }
      }}
      onPasswordChange={(value) => {
        setPassword(value);
        if (errorMessage) {
          setErrorMessage(null);
        }
        if (passwordError) {
          setPasswordError(null);
        }
      }}
      onTogglePassword={() => setShowPassword((currentValue) => !currentValue)}
      onKeepVaultChange={setKeepVaultOpen}
      onSubmit={handleSubmit}
      onGoogleSignIn={handleGoogleSignIn}
    />
  );
}
