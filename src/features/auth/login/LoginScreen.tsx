"use client";

import {
  ArrowRightOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Button, Input, Typography } from "antd";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { FaBalanceScaleRight } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const { Text, Title } = Typography;

type LoginScreenProps = {
  identifier: string;
  password: string;
  showPassword: boolean;
  keepVaultOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  identifierError?: string | null;
  passwordError?: string | null;
  onIdentifierChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onKeepVaultChange: (checked: boolean) => void;
  onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
  onGoogleSignIn: () => void;
};

const formFieldStyle: CSSProperties = {
  height: 62,
  borderRadius: 14,
  fontSize: 16,
  background: "rgba(230, 235, 240, 0.9)",
  border: "1px solid rgba(130, 145, 164, 0.12)",
  color: "#1d2431",
};

const socialButtons = [
  {
    key: "google",
    label: "Google",
    accent: "#d94b38",
    content: "G",
    icon: <FcGoogle />,
  },
];

export function LoginScreen({
  identifier,
  password,
  showPassword,
  isSubmitting,
  errorMessage,
  identifierError,
  passwordError,
  onIdentifierChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onGoogleSignIn,
}: LoginScreenProps) {
  const loginT = useTranslations("login");
  const globalT = useTranslations("platform");

  return (
    <main className="login-shell flex min-h-screen items-center justify-center ">
      <div className="w-full">
        <section className="login-card border border-[rgba(99,118,142,0.18)] bg-[#f3f5f8] p-4 sm:p-5 lg:p-7">
          <div className="rounded-[26px] bg-[#f4f5f7] px-5 py-4 sm:px-8 sm:py-6">
            <header className="mb-8 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0d233d] shadow-inner shadow-white/20">
                  <FaBalanceScaleRight className="text-xl text-white" />
                </div>
                <span className="text-3xl font-semibold underline tracking-[-0.04em] text-[#1b2433]">
                  {globalT("name")}
                </span>
              </div>
            </header>

            <div className=" flex items-end justify-between gap-4 ">
              <Title
                level={1}
                style={{
                  fontFamily: "kufam",
                  fontWeight: "900",
                  margin: 0,
                }}
              >
                {loginT("welcome")}
              </Title>
            </div>

            <Text
              style={{
                fontSize: 9,
                color: "#4e5d71",
                fontFamily: "kufam",
                lineHeight: 0,
                margin: 0,
                padding: 0,
              }}
            >
              {loginT("subtitle")}
            </Text>

            <form onSubmit={onSubmit} className="mt-8 space-y-7">
              <div className="rounded-[18px] border border-[#d7dfe7] bg-[#eff3f7] px-4 py-4 sm:px-5">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[9px] font-medium text-[#1d2430]">
                      {loginT("identifierLabel")}
                    </label>
                    <div className="flex overflow-hidden rounded-[14px] border border-[#d5dde5] bg-[#e7ebf0]">
                      <Input
                        value={identifier}
                        status={identifierError ? "error" : undefined}
                        onChange={(event) => onIdentifierChange(event.target.value)}
                        placeholder="example@gmail.com"
                        style={formFieldStyle}
                        className="border-0! bg-transparent! rounded-none!"
                      />
                    </div>
                    {identifierError ? (
                      <p className="mt-2 text-[11px] font-medium text-[#9e2d2d]">
                        {identifierError}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="block text-[9px] font-medium text-[#1d2430]">
                        {loginT("passwordLabel")}
                      </label>
                      <Link
                        href="/login"
                        className="login-underline-link underline! font-medium text-[9px]"
                      >
                        {loginT("forgotPassword")}
                      </Link>
                    </div>
                    <Input.Password
                      value={password}
                      status={passwordError ? "error" : undefined}
                      onChange={(event) => onPasswordChange(event.target.value)}
                      placeholder="••••••••••••••••••"
                      visibilityToggle={{
                        visible: showPassword,
                        onVisibleChange: onTogglePassword,
                      }}
                      iconRender={(visible) =>
                        visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                      }
                      prefix={<LockOutlined style={{ color: "#7a8396" }} />}
                      style={{ ...formFieldStyle, paddingInlineStart: 12 }}
                      className="border-0! rounded-[14px]!"
                    />
                    {passwordError ? (
                      <p className="mt-2 text-[11px] font-medium text-[#9e2d2d]">
                        {passwordError}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {errorMessage ? (
                <div className="rounded-xl border border-[#f0c1c1] bg-[#fff1f1] px-4 py-3 text-sm font-medium text-[#9e2d2d]">
                  {errorMessage}
                </div>
              ) : null}

              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                className="h-15! w-full! rounded-[18px]! border-0! text-xs! font-semibold! "
                style={{
                  fontSize: 24,
                  letterSpacing: "-0.04em",
                  fontFamily: "kufam",
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  {isSubmitting ? loginT("authenticating") : loginT("signIn")}
                  {!isSubmitting && <ArrowRightOutlined className="text-xl" />}
                </span>
              </Button>
            </form>

            <div className="mt-10 flex items-center justify-center gap-4 text-sm font-medium uppercase tracking-[0.25em] text-[#6a7587]">
              <div className="h-px flex-1 bg-[#c7ced8]" />
              <span>{loginT("divider")}</span>
              <div className="h-px flex-1 bg-[#c7ced8]" />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3 font-kufam!">
              {socialButtons.map(({ key, icon }) => (
                <Button
                  key={key}
                  className="login-social-button font-kufam!"
                  onClick={onGoogleSignIn}
                  loading={isSubmitting}
                >
                  <span className="flex items-center justify-center gap-3 ">
                    <span>{loginT("google")}</span>
                    {icon}
                  </span>
                </Button>
              ))}
            </div>

            <div className="mt-8 rounded-[18px] border border-[#d7dfe7] bg-[#edf1f4] px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="m-0 text-sm font-semibold tracking-tighter text-[#1d2431]">
                    {loginT("createAccountTitle")}
                  </p>
                  <p className="mt-2 text-xs text-[#536071]">
                    {loginT("createAccountSubtitle")}
                  </p>
                </div>

                <Link
                  href="/signup"
                  className="login-underline-link inline-flex items-center gap-2 text-[1.05rem] font-semibold text-[#1f4f8c]"
                >
                  <span>{loginT("registerAction")}</span>
                  <ArrowRightOutlined />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
