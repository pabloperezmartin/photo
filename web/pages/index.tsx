
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Catálogo de Fotografía</h1>
      <p>PWA con escaneo y gestión básica.</p>
      <ul>
        <li><Link href="/scan">Escanear ISBN</Link></li>
        <li><Link href="/dashboard">Dashboard (MVP)</Link></li>
      </ul>
    </main>
  );
}
