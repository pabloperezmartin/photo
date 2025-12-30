
import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

function normalizeIsbn13(ean: string) {
  const s = (ean||'').replace(/[^0-9]/g,'');
  if (s.length !== 13) return null;
  if (!s.startsWith('978') && !s.startsWith('979')) return null;
  // Checksum EAN-13
  const digits = s.split('').map(Number);
  const sum = digits.slice(0,12).reduce((acc,d,i)=> acc + d * (i%2?3:1), 0);
  const check = (10 - (sum % 10)) % 10;
  if (check !== digits[12]) return null;
  return s;
}

@Injectable()
export class IngestService {
  async byIsbn(ean13: string) {
    const isbn13 = normalizeIsbn13(ean13);
    if (!isbn13) throw new BadRequestException('ISBN-13 inválido');

    // Open Library
    const ol = await axios.get(`https://openlibrary.org/isbn/${isbn13}.json`).then(r=>r.data).catch(()=>null);
    // Google Books
    const gb = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}`).then(r=>r.data).catch(()=>null);

    const merged = this.merge(ol, gb);
    return { isbn13, ...merged };
  }

  merge(ol: any, gb: any) {
    const item = (gb?.items && gb.items[0])?.volumeInfo || {};
    return {
      title: ol?.title || item?.title || '',
      subtitle: item?.subtitle || '',
      authors: ol?.authors?.map((a:any)=>a.name) || item?.authors || [],
      publisher: ol?.publishers?.[0] || item?.publisher || '',
      publishedYear: Number(ol?.publish_date?.match(/\d{4}/)?.[0] || item?.publishedDate?.slice(0,4)) || undefined,
      language: item?.language || 'und',
      description: item?.description || '',
      coverUrl: item?.imageLinks?.thumbnail || undefined,
      topics: [],
      tags: []
    };
  }
}
