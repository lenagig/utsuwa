"use client";

import { FormEvent, useState } from "react";

const navItems = ["図鑑", "バトル", "天気予報"];

type TitleScreenProps = {
  onSelectVessel: (inputText: string) => void;
};

export function TitleScreen({ onSelectVessel }: TitleScreenProps) {
  const [inputText, setInputText] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSelectVessel(inputText);
  }

  return (
    <main className="titlePage">
      <section className="titlePanel" aria-labelledby="title-heading">
        <div className="brand">
          <h1 id="title-heading">器</h1>
        </div>

        <p className="intro">
          あなたがイラッとした人の行動を入力してください。
          AIがその行動から、その人にふさわしい器を選びます。
        </p>

        <form className="titleForm" onSubmit={handleSubmit}>
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

      <nav className="titleNav" aria-label="メインメニュー">
        {navItems.map((item) => (
          <button key={item} type="button">
            {item}
          </button>
        ))}
      </nav>
    </main>
  );
}
