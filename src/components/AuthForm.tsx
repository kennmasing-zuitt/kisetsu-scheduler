"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginMutation, useRegisterMutation } from "@/store/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";

type Mode = "login" | "register";

/** Shared Register/Login form; `mode` switches fields, mutation and copy. */
export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [login, loginState] = useLoginMutation();
  const [register, registerState] = useRegisterMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLogin = mode === "login";
  const { isLoading, error } = isLogin ? loginState : registerState;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const payload = isLogin
        ? await login({ email, password }).unwrap()
        : await register({ name, email, password }).unwrap();
      dispatch(setCredentials(payload));
      const next = searchParams.get("next");
      router.replace(next && next.startsWith("/") ? next : "/");
    } catch {
      /* error is shown from mutation state */
    }
  }

  return (
    <form className="card auth-card" onSubmit={onSubmit}>
      <h1>{isLogin ? "Welcome back" : "Create an account"}</h1>
      <p className="muted">
        {isLogin ? "Log in to continue." : "Register to start using the app."}
      </p>

      {!isLogin && (
        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        </label>
      )}
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </label>
      <label className="field">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={isLogin ? undefined : 8}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
      </label>

      {error && <p className="alert">{(error as GraphqlError).message}</p>}

      <button className="btn btn--primary btn--block" disabled={isLoading}>
        {isLoading ? "Please wait…" : isLogin ? "Log in" : "Register"}
      </button>

      <p className="muted center">
        {isLogin ? (
          <>
            No account yet? <Link href="/register">Register</Link>
          </>
        ) : (
          <>
            Already registered? <Link href="/login">Log in</Link>
          </>
        )}
      </p>
    </form>
  );
}
