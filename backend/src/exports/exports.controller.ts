
import { Controller, Get, Res } from '@nestjs/common';
import { ExportsService } from './exports.service';

@Controller('exports')
export class ExportsController {
  constructor(private readonly svc: ExportsService) {}

  @Get('csv')
  async csv(@Res() res: any) {
    const buf = await this.svc.generateCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="catalogo.csv"');
    res.send(buf);
  }
}
