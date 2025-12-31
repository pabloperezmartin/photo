import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getInfo() {
    return {
      name: 'Catálogo de Libros API',
      version: '0.1.0',
      status: 'running',
      endpoints: {
        books: '/books',
        ingest: '/ingest/isbn',
        exports: '/exports/csv',
      },
    };
  }

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
