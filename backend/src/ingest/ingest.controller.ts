
import { Controller, Post, Body } from '@nestjs/common';
import { IngestService } from './ingest.service';

@Controller('ingest')
export class IngestController {
  constructor(private readonly svc: IngestService) {}

  @Post('isbn')
  ingestIsbn(@Body('isbn13') isbn13: string) { return this.svc.byIsbn(isbn13); }
}
