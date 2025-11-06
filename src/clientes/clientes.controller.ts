import { Controller, Get, Query } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Cliente } from './entities/cliente.entity';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @ApiOperation({ summary: 'Buscar clientes por nombre o apellido' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Término de búsqueda para nombre o apellido',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes que coinciden con el término de búsqueda',
  })
  @Get()
  searchClientes(
    @Query('search') search?: string,
  ): Promise<{ clientes: Cliente[]; total: number }> {
    return this.clientesService.searchClientes(search);
  }
}
