export default function NotFound() {
  return (
    <main style={{ textAlign: 'center', padding: '80px 16px' }}>
      <h1 style={{ fontSize: 28 }}>404</h1>
      <p style={{ color: '#4a4d75' }}>This book could not be found.</p>
      <a className="btn btn-primary" href="/" style={{ marginTop: 16 }}>
        Back to the library
      </a>
    </main>
  );
}
