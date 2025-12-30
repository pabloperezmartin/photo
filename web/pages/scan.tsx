
import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

function normalizeEanToIsbn13(ean: string){
  const s = (ean||'').replace(/[^0-9]/g,'');
  if (s.length !== 13) return null;
  if (!s.startsWith('978') && !s.startsWith('979')) return null;
  const digits = s.split('').map(Number);
  const sum = digits.slice(0,12).reduce((acc,d,i)=> acc + d * (i%2?3:1), 0);
  const check = (10 - (sum % 10)) % 10;
  if (check !== digits[12]) return null;
  return s;
}

export default function ScanPage(){
  const videoRef = useRef<HTMLVideoElement>(null);
  const [result, setResult] = useState<any>(null);
  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    async function start(){
      const devices = await reader.listVideoInputDevices();
      const deviceId = devices[0]?.deviceId;
      reader.decodeFromVideoDevice(deviceId, videoRef.current!, async (res, err) => {
        if (res) {
          const ean = res.getText();
          const isbn13 = normalizeEanToIsbn13(ean);
          if (isbn13){
            const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
            const r = await fetch(base + '/ingest/isbn', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ isbn13 }) });
            const data = await r.json();
            setResult(data);
          }
        }
      });
    }
    start();
    return () => reader.reset();
  }, []);

  return (
    <main style={{ padding: 12 }}>
      <h2>Escanear ISBN</h2>
      <video ref={videoRef} style={{ width: '100%', maxWidth: 480 }} />
      { result && (
        <pre style={{ background:'#f5f5f5', padding:12, marginTop:12 }}>{JSON.stringify(result, null, 2)}</pre>
      )}
    </main>
  );
}
