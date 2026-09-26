"use client";

import { FormEvent, useState } from "react";
import screen from "@/components/Screen.module.css";
import styles from "@/components/TitleScreen.module.css";

type TitleScreenProps = {
  onOpenAuth: () => void;
  onOpenBattle: () => void;
  onOpenCatalog: () => void;
  onOpenWeather: () => void;
  onSelectVessel: (inputText: string) => void;
  onSignOut: () => void;
  username: string | null;
};

export function TitleScreen({
  onOpenAuth,
  onOpenBattle,
  onOpenCatalog,
  onOpenWeather,
  onSelectVessel,
  onSignOut,
  username,
}: TitleScreenProps) {
  const [inputText, setInputText] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSelectVessel(inputText);
  }

  return (
    <main className={`${screen.titlePage} ${styles.titleScreen}`}>
      <div className={`${screen.screenContent} ${screen.titleScreenContent}`}>
        <div className={styles.accountAction}>
          {username ? (
            <>
              <span>{username}</span>
              <button onClick={onSignOut} type="button">ログアウト</button>
            </>
          ) : (
            <button onClick={onOpenAuth} type="button">ログイン / 新規登録</button>
          )}
        </div>

        <section className={screen.titlePanel} aria-labelledby="title-heading">
          <div className={styles.brand}><h1 id="title-heading">器</h1></div>
          <p className={styles.intro}>
            あなたがイラッとした人の説明を入力してください。<br />
            AIがその人にふさわしい器を図鑑から選びます。
          </p>
          <form className={styles.titleForm} onSubmit={handleSubmit}>
            <label htmlFor="irritation">どんな人にイラッとした？</label>
            <textarea
              id="irritation"
              name="irritation"
              onChange={(event) => setInputText(event.target.value)}
              placeholder="例：電車で暴れてる人"
              rows={3}
              value={inputText}
            />
            <button type="submit">器を選んでもらう</button>
          </form>
        </section>

        <nav className={styles.titleNav} aria-label="メインメニュー">
          <button onClick={onOpenCatalog} type="button">図鑑</button>
          <button onClick={onOpenBattle} type="button">バトル</button>
          <button onClick={onOpenWeather} type="button">天気予報</button>
        </nav>
      </div>
    </main>
  );
}
