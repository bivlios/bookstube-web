export default function FeedbackFloat({ lang, t }) {
  const links = [
    { type: 'feedback', icon: '💬', label: t('feedbackPage.quickFeedback') },
    { type: 'book', icon: '📚', label: t('feedbackPage.quickBookRequest') },
    { type: 'other', icon: '✉️', label: t('feedbackPage.quickWriteUs') },
  ];

  return (
    <aside className="feedback-float" aria-label={t('feedbackPage.quickActions')}>
      {links.map(({ type, icon, label }) => (
        <a className="feedback-float-link" href={`/${lang}/feedback?type=${type}`} key={type}>
          <span className="feedback-float-icon" aria-hidden="true">{icon}</span>
          <span className="feedback-float-label">{label}</span>
        </a>
      ))}
    </aside>
  );
}
