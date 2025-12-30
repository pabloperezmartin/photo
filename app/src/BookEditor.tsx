
import React, { useState } from 'react';
import { View, TextInput, Text, Button } from 'react-native';

type Book = {
  id?: string;
  isbn13: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedYear?: number;
  language?: string;
  topics: string[];
  tags: string[];
  description?: string;
  coverUrl?: string;
};

export function BookEditor({ initial, onSave }: { initial: Book, onSave: (b: Book) => void }) {
  const [book, setBook] = useState<Book>(initial);
  return (
    <View style={{ padding: 12 }}>
      <Text>ISBN-13</Text>
      <TextInput value={book.isbn13} editable={false} style={{ borderWidth:1, marginBottom:8, padding:6 }} />

      <Text>Título</Text>
      <TextInput value={book.title} onChangeText={t => setBook({ ...book, title: t })} style={{ borderWidth:1, marginBottom:8, padding:6 }} />

      <Text>Autores (separados por ';')</Text>
      <TextInput
        value={book.authors.join('; ')}
        onChangeText={t => setBook({ ...book, authors: t.split(';').map(s=>s.trim()).filter(Boolean) })}
        style={{ borderWidth:1, marginBottom:8, padding:6 }}
      />

      <Text>Editorial</Text>
      <TextInput value={book.publisher ?? ''} onChangeText={t => setBook({ ...book, publisher: t })} style={{ borderWidth:1, marginBottom:8, padding:6 }} />

      <Text>Año</Text>
      <TextInput value={String(book.publishedYear ?? '')} keyboardType="numeric" onChangeText={t => setBook({ ...book, publishedYear: Number(t) || undefined })} style={{ borderWidth:1, marginBottom:8, padding:6 }} />

      <Text>Temáticas (keys separadas por ';': documental; street; landscape; portrait; nude)</Text>
      <TextInput
        value={book.topics.join('; ')}
        onChangeText={t => setBook({ ...book, topics: t.split(';').map(s=>s.trim()).filter(Boolean) })}
        style={{ borderWidth:1, marginBottom:8, padding:6 }}
      />

      <Text>Tags (separadas por ';')</Text>
      <TextInput
        value={book.tags.join('; ')}
        onChangeText={t => setBook({ ...book, tags: t.split(';').map(s=>s.trim()).filter(Boolean) })}
        style={{ borderWidth:1, marginBottom:8, padding:6 }}
      />

      <Button title="Guardar" onPress={() => onSave(book)} />
    </View>
  );
}
