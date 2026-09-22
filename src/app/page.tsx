const navItems = ["図鑑", "バトル", "天気予報"];

export default function Home() {
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

        <form className="titleForm">
          <label htmlFor="irritation">どんな人にイラッとした？</label>
          <textarea
            id="irritation"
            name="irritation"
            placeholder="例：電車で暴れてる人"
            rows={3}
          />
          <button type="button">器を選んでもらう</button>
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
