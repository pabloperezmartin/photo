
import { Module } from '@nestjs/common';
import { BooksModule } from './books/books.module';
import { IngestModule } from './ingest/ingest.module';
import { ExportsModule } from './exports/exports.module';

@Module({
  imports: [BooksModule, IngestModule, ExportsModule],
})
export class AppModule {}
