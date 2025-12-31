
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BooksModule } from './books/books.module';
import { IngestModule } from './ingest/ingest.module';
import { ExportsModule } from './exports/exports.module';

@Module({
  imports: [BooksModule, IngestModule, ExportsModule],
  controllers: [AppController],
})
export class AppModule {}
