
import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { normalizeEanToIsbn13, normalizeIsbnInput } from '../src/utils/isbn';

export default function ScanPage(){
  const videoRef = useRef<HTMLVideoElement>(null);
  const [result, setResult] = useState<any>(null);
  const [manualIsbn, setManualIsbn] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    async function start(){
      const devices = await reader.listVideoInputDevices();
      const deviceId = devices[0]?.deviceId;
      reader.decodeFromVideoDevice(deviceId, videoRef.current!, async (res: { getBarcodeFormat: () => any; getText: () => any; }, _err: any) => {
        if (res) {
          console.log('Formato:', res.getBarcodeFormat?.(), 'Valor:', res.getText?.());
          const ean = res.getText();
          const isbn13 = normalizeEanToIsbn13(ean);
          if (isbn13){
            const base = process.env.NEXT_PUBLIC_API_BASE || 'http://192.168.1.39:4000';
            const r = await fetch(base + '/ingest/isbn', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ isbn13 }) });
            const data = await r.json();
            setResult(data);
            setErr(null);
          } else {
            setErr('Código inválido. Prueba otra vez o introduce el ISBN manualmente.');
          }
        }
      });
    }
    start();
    return () => {
      reader.reset();
    };
  }, []);

  async function submitManual(){
    const normalized = normalizeIsbnInput(manualIsbn);
    if (!normalized) {
      setErr('ISBN inválido. Introduce un ISBN-13 válido o un ISBN-10 convertible.');
      return;
    }
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://192.168.1.39:4000';
    const r = await fetch(base + '/ingest/isbn', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ isbn13: normalized })
    });
    const data = await r.json();
    setResult(data);
    setErr(null);
  }

  return (
    <main style={{ padding: 12 }}>
      <h2>Escanear ISBN</h2>
      <video ref={videoRef} style={{ width: '100%', maxWidth: 480 }} />
      { err && <p style={{ color:'crimson' }}>{err}</p> }

      <div style={{ marginTop: 16, padding: 12, border:'1px solid #ddd', borderRadius: 6 }}>
        <h3>Introducir ISBN manualmente</h3>
        <input
          value={manualIsbn}
          onChange={(e: { target: { value: any; }; }) => setManualIsbn(e.target.value)}
          placeholder="ISBN-13 o ISBN-10"
          style={{ padding:8, width:'100%', maxWidth: 320 }}
        />
        <div style={{ height: 8 }} />
        <button onClick={submitManual}>Aceptar</button>
      </div>

      { result && (
        <>
          <h3 style={{ marginTop: 16 }}>Resultado</h3>
          <pre style={{ background:'#f5f5f5', padding:12 }}>{JSON.stringify(result, null, 2)}</pre>
        </>
      )}
    </main>
  );
}
