// Short "why parents should use BooksTube" section with three value cards.
export default function ParentValue({ t }) {
  const cards = [
    ['🆓', t('bookstubeHome.parentCard1')],
    ['🎓', t('bookstubeHome.parentCard2')],
    ['🧒', t('bookstubeHome.parentCard3')],
  ];
  return (
    <section className="parent-value">
      <h2>{t('bookstubeHome.parentTitle')}</h2>
      <p>{t('bookstubeHome.parentText')}</p>
      <div className="value-cards">
        {cards.map(([emoji, label]) => (
          <div className="value-card" key={label}>
            <span className="value-emoji" aria-hidden="true">{emoji}</span>
            <span className="value-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
