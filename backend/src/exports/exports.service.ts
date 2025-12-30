
import { Injectable } from '@nestjs/common';
import { Parser } from 'json2csv';
import { BooksService } from '../books/books.service';

@Injectable()
export class ExportsService {
  constructor(private readonly books: BooksService) {}

  async generateCsv(): Promise<Buffer> {
    const rows = await this.books.list({});
    const flattened = rows.map((r:any) => ({
      isbn13: r.isbn13,
      title: r.title,
      subtitle: r.subtitle || '',
      authors: Array.isArray(r.authors) ? r.authors.join('; ') : r.authors || '',
      publisher: r.publisher || '',
      publishedYear: r.publishedYear || '',
      language: r.language || '',
      topics: Array.isArray(r.topics) ? r.topics.join('; ') : '',
      tags: Array.isArray(r.tags) ? r.tags.join('; ') : '',
      description: r.description || '',
      coverUrl: r.coverUrl || ''
    }));
    const parser = new Parser({ fields: [
      'isbn13','title','subtitle','authors','publisher','publishedYear','language','topics','tags','description','coverUrl'
    ]});
    const csv = parser.parse(flattened);
    return Buffer.from(csv, 'utf-8');
  }
}
