
import { Injectable } from '@nestjs/common';

// Placeholder en memoria (sustituir con Prisma)
const mem: any[] = [];

@Injectable()
export class BooksService {
  list(q: any) { return mem; }
  get(id: string) { return mem.find(b => b.id === id); }
  create(dto: any) {
    const id = (Math.random()*1e9).toFixed(0);
    const book = { id, ...dto };
    mem.push(book);
    return book;
  }
  update(id: string, dto: any) {
    const i = mem.findIndex(b => b.id === id);
    if (i>=0) mem[i] = { ...mem[i], ...dto };
    return mem[i];
  }
  remove(id: string) {
    const i = mem.findIndex(b => b.id === id);
    if (i>=0) mem.splice(i,1);
    return { ok: true };
  }
}
