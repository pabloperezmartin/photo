
import { Module } from '@nestjs/common';
import { ExportsController } from './exports.controller';
import { ExportsService } from './exports.service';
import { BooksService } from '../books/books.service';

@Module({ controllers: [ExportsController], providers: [ExportsService, BooksService] })
export class ExportsModule {}
