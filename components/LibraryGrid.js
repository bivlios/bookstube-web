import BookCard from './BookCard';

export default function LibraryGrid({ books, lang, t }) {
  return (
    <div className="grid">
      {books.map((b) => (
        <BookCard key={b.bookId} book={b} lang={lang} t={t} />
      ))}
    </div>
  );
}
