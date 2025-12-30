
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { API_BASE } from './src/config';
import { BookEditor } from './src/BookEditor';

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

export default function App(){
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [last, setLast] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => { (async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  })(); }, []);

  async function syncQueued(){
    const queueJson = await AsyncStorage.getItem('queue');
    const queue = queueJson ? JSON.parse(queueJson) : [];
    const remain = [];
    for (const item of queue){
      try {
        const r = await fetch(API_BASE + '/ingest/isbn', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ isbn13: item.isbn13 }) });
        const data = await r.json();
        setLast(data);
      } catch(e){
        remain.push(item);
      }
    }
    await AsyncStorage.setItem('queue', JSON.stringify(remain));
  }

  async function syncOps(){
    const opsJson = await AsyncStorage.getItem('ops');
    const ops = opsJson ? JSON.parse(opsJson) : [];
    const remain = [];
    for (const op of ops){
      try {
        const url = op.type === 'update' && op.payload.id
          ? `${API_BASE}/books/${op.payload.id}`
          : `${API_BASE}/books`;
        const method = op.type === 'update' ? 'PUT' : 'POST';
        const r = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(op.payload) });
        await r.json();
      } catch (e) {
        remain.push(op);
      }
    }
    await AsyncStorage.setItem('ops', JSON.stringify(remain));
  }

  if (hasPermission === null) return <Text>Solicitando permiso de cámara...</Text>;
  if (hasPermission === false) return <Text>Permiso denegado</Text>;

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={async ({ data, type }) => {
          if (scanned) return;
          setScanned(true);
          const isbn13 = normalizeEanToIsbn13(data);
          if (isbn13) {
            // Intento en línea -> ingest y abrir editor
            try {
              const r = await fetch(API_BASE + '/ingest/isbn', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ isbn13 }) });
              const data = await r.json();
              setLast(data);
              setShowEditor(true);
            } catch(e) {
              // offline: guardar en cola
              const q = await AsyncStorage.getItem('queue');
              const arr = q ? JSON.parse(q) : [];
              arr.push({ isbn13, ts: Date.now() });
              await AsyncStorage.setItem('queue', JSON.stringify(arr));
            }
          }
        }}
        style={{ width: '100%', height: 320 }}
      />

      <Button title="Sincronizar escaneos" onPress={() => { setScanned(false); syncQueued(); }} />
      <Button title="Sincronizar ediciones" onPress={() => { syncOps(); }} />

      { showEditor && last && (
        <BookEditor
          initial={{
            id: last.id,
            isbn13: last.isbn13,
            title: last.title || '',
            subtitle: last.subtitle,
            authors: last.authors || [],
            publisher: last.publisher,
            publishedYear: last.publishedYear,
            language: last.language,
            topics: last.topics || [],
            tags: last.tags || [],
            description: last.description,
            coverUrl: last.coverUrl
          }}
          onSave={async (b) => {
            try {
              const url = b.id ? `${API_BASE}/books/${b.id}` : `${API_BASE}/books`;
              const method = b.id ? 'PUT' : 'POST';
              const resp = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(b)
              });
              const saved = await resp.json();
              setLast(saved);
              setShowEditor(false);
            } catch (e) {
              const opsJson = await AsyncStorage.getItem('ops');
              const ops = opsJson ? JSON.parse(opsJson) : [];
              ops.push({ type: b.id ? 'update' : 'create', payload: b, ts: Date.now() });
              await AsyncStorage.setItem('ops', JSON.stringify(ops));
              setShowEditor(false);
            }
          }}
        />
      )}

      { last && (<Text style={{ marginTop: 12 }}>Último: {last.title}</Text>) }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 12 }
});
