"use client";

import { FormEvent, useState } from "react";
import screen from "@/components/Screen.module.css";
import styles from "@/components/AuthScreen.module.css";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type AuthScreenProps = {
  onBack: () => void;
  onAuthenticated: () => Promise<void>;
};

type Mode = "login" | "signup";

export function AuthScreen({ onBack, onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabaseの環境変数が未設定です。");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      if (mode === "signup") {
        if (!username.trim()) {
          setMessage("ユーザー名を入力してください。");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username.trim(), location: location.trim() } },
        });
        if (error) throw error;
        if (!data.session) {
          setMessage("確認メールを送信しました。メール内のリンクを開いてからログインしてください。");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      await onAuthenticated();
      onBack();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ログインに失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={`${screen.titlePage} ${styles.authPage}`}>
      <section className={`${screen.titlePanel} ${styles.authPanel}`}>
        <p className={styles.eyebrow}>UTSUWA ACCOUNT</p>
        <h1>{mode === "login" ? "ログイン" : "新規登録"}</h1>
        <p className={styles.lead}>図鑑の解放状態を、どの端末でも引き継げます。</p>

        <div className={styles.switcher} role="tablist" aria-label="認証方法">
          <button className={mode === "login" ? styles.active : ""} onClick={() => setMode("login")} type="button">ログイン</button>
          <button className={mode === "signup" ? styles.active : ""} onClick={() => setMode("signup")} type="button">新規登録</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <label htmlFor="username">ユーザー名</label>
              <input id="username" maxLength={32} onChange={(event) => setUsername(event.target.value)} required value={username} />
              <label htmlFor="location">住んでいるところ <span>任意</span></label>
              <input id="location" maxLength={80} onChange={(event) => setLocation(event.target.value)} placeholder="例：東京都" value={location} />
            </>
          )}
          <label htmlFor="email">メールアドレス</label>
          <input id="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          <label htmlFor="password">パスワード</label>
          <input id="password" minLength={6} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          {message && <p className={styles.message} role="status">{message}</p>}
          <button className={screen.primaryAction} disabled={isSubmitting} type="submit">
            {isSubmitting ? "処理中…" : mode === "login" ? "ログインする" : "登録する"}
          </button>
        </form>
        <button className={screen.secondaryAction} onClick={onBack} type="button">戻る</button>
      </section>
    </main>
  );
}
