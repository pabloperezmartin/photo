
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { API_BASE } from './src/config';
import { BookEditor } from './src/BookEditor';
import { normalizeEanToIsbn13, normalizeIsbnInput } from './src/utils/isbn';

export default function App(){
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [last, setLast] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  // estado para manual
  const [manualVisible, setManualVisible] = useState(false);
  const [manualIsbn, setManualIsbn] = useState('');

  useEffect(() => { (async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
    
    // Verificar conexión con API
    try {
      const response = await fetch(API_BASE + '/health', { 
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true' // Evita la página de advertencia de ngrok
        }
      });
      
      const contentType = response.headers.get('content-type');
      
      // Si ngrok devuelve HTML, significa que está mostrando la página de advertencia
      if (contentType && contentType.includes('text/html')) {
        setApiStatus('error');
        Alert.alert(
          '⚠️ Acción requerida: ngrok',
          `Debes abrir esta URL en el navegador de tu móvil primero:\n\n${API_BASE}\n\n1. Ábrela en Safari/Chrome\n2. Acepta la advertencia de ngrok\n3. Verás el JSON de la API\n4. Vuelve a la app\n\n(Solo necesario la primera vez)`,
          [
            { text: 'Copiar URL', onPress: () => console.log('URL:', API_BASE) },
            { text: 'Entendido' }
          ]
        );
        return;
      }
      
      if (response.ok) {
        setApiStatus('ok');
      } else {
        setApiStatus('error');
      }
    } catch (e) {
      console.error('API no disponible:', e);
      setApiStatus('error');
      
      const isNgrok = API_BASE.includes('ngrok');
      
      Alert.alert(
        'Error de conexión',
        isNgrok 
          ? `No se puede conectar a ngrok.\n\n${API_BASE}\n\n1. Verifica que ngrok esté corriendo: "ngrok http 4000"\n2. Abre la URL en el navegador del móvil primero\n3. Acepta la advertencia de ngrok\n4. Vuelve a la app`
          : `No se puede conectar a la API en:\n${API_BASE}\n\nVerifica que:\n1. Docker esté ejecutándose\n2. Tu móvil esté en la misma red WiFi\n3. La IP local sea correcta`,
        [{ text: 'OK' }]
      );
    }
  })(); }, []);

  async function ingestIsbn(isbn13: string) {
    try {
      console.log('Conectando a:', API_BASE);
      const r = await fetch(API_BASE + '/ingest/isbn', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ isbn13 })
      });
      if (!r.ok) {
        const errorText = await r.text();
        throw new Error(`API error: ${r.status} - ${errorText}`);
      }
      const data = await r.json();
      setLast(data);
      setShowEditor(true);
    } catch(e) {
      console.error('Error al conectar con API:', e);
      // offline o error: encola
      const q = await AsyncStorage.getItem('queue');
      const arr = q ? JSON.parse(q) : [];
      arr.push({ isbn13, ts: Date.now() });
      await AsyncStorage.setItem('queue', JSON.stringify(arr));
      Alert.alert(
        'Guardado offline', 
        `No se pudo conectar a ${API_BASE}\n\nSe sincronizará cuando haya conexión.\n\nError: ${e instanceof Error ? e.message : 'Desconocido'}`
      );
    }
  }

  async function syncQueued(){
    const queueJson = await AsyncStorage.getItem('queue');
    const queue = queueJson ? JSON.parse(queueJson) : [];
    const remain = [];
    for (const item of queue){
      try {
        const r = await fetch(API_BASE + '/ingest/isbn', { 
          method:'POST', 
          headers:{
            'Content-Type':'application/json',
            'ngrok-skip-browser-warning': 'true'
          }, 
          body: JSON.stringify({ isbn13: item.isbn13 }) 
        });
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
        const r = await fetch(url, { 
          method, 
          headers:{
            'Content-Type':'application/json',
            'ngrok-skip-browser-warning': 'true'
          }, 
          body: JSON.stringify(op.payload) 
        });
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
      {/* Indicador de estado de API */}
      <View style={[styles.statusBar, apiStatus === 'ok' ? styles.statusOk : styles.statusError]}>
        <Text style={styles.statusText}>
          API: {apiStatus === 'checking' ? '🔍 Verificando...' : apiStatus === 'ok' ? '✅ Conectado' : '❌ Sin conexión'}
        </Text>
        <Text style={styles.statusUrlText}>{API_BASE}</Text>
      </View>

      <BarCodeScanner
      onBarCodeScanned={async ({ data, type }) => {
        Alert.alert('Escaneado', `type=${type}\ndata=${data}`); // <-- LOG TEMPORAL
        if (scanned) return;
        setScanned(true);

        const isbn13 = normalizeEanToIsbn13(data);
        if (isbn13) {
          await ingestIsbn(isbn13);
        } else {
          Alert.alert('Código inválido', 'Prueba otra vez o usa la entrada manual.');
        }
      }}
      style={{ width: '100%', height: 320 }}
      />

      {/* Botones principales */}
      <Button title="Introducir ISBN manualmente" onPress={() => setManualVisible(true)} />
      <Button title="Sincronizar escaneos" onPress={() => { setScanned(false); syncQueued(); }} />
      <Button title="Sincronizar ediciones" onPress={() => { syncOps(); }} />

      {/* Editor de libro */}
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
                headers: { 
                  'Content-Type': 'application/json',
                  'ngrok-skip-browser-warning': 'true'
                }, 
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
              Alert.alert('Guardado offline', 'Se sincronizará cuando haya conexión.');
            }
          }}
        />
      )}

      {/* Modal de ISBN manual */}
      <Modal visible={manualVisible} animationType="slide" transparent>
        <View style={styles.modal}>
          <View style={styles.card}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Introducir ISBN</Text>
            <TextInput
              placeholder="ISBN-13 o ISBN-10"
              value={manualIsbn}
              onChangeText={setManualIsbn}
              style={{ borderWidth:1, padding:8, marginBottom:12 }}
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
            />
            <Button title="Aceptar" onPress={async () => {
              const normalized = normalizeIsbnInput(manualIsbn);
              if (!normalized) {
                Alert.alert('ISBN inválido', 'Introduce un ISBN-13 válido o un ISBN-10 convertible.');
                return;
              }
              setManualVisible(false);
              setManualIsbn('');
              await ingestIsbn(normalized);
            }} />
            <View style={{ height: 8 }} />
            <Button title="Cancelar" color="#888" onPress={() => { setManualVisible(false); setManualIsbn(''); }} />
          </View>
        </View>
      </Modal>

      { last && (<Text style={{ marginTop: 12 }}>Último: {last.title}</Text>) }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 12 },
  modal: { flex:1, backgroundColor:'rgba(0,0,0,0.4)', alignItems:'center', justifyContent:'center' },
  card: { width:'90%', backgroundColor:'#fff', borderRadius:6, padding:16 },
  statusBar: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
    marginBottom: 10
  },
  statusOk: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1
  },
  statusError: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  statusUrlText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2
  }
});
