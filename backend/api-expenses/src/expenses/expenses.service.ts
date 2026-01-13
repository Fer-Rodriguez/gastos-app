import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { IsNull } from 'typeorm';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly repo: Repository<Expense>,
  ) {}

  create(dto: CreateExpenseDto) {
    const expense = this.repo.create(dto);
    return this.repo.save(expense);
  }

  findAll() {
    return this.repo.find({
      where: { deletedAt: IsNull() },
      order: { date: 'DESC' },
    });
  }

  async findOne(id: number) {
    return this.repo.findOne({
      where: { id },
    });
  }

  async update(id: number, dto: UpdateExpenseDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.repo.softDelete(id);
  }

  async findAllPaginated(page = 1, limit = 10) {
    return this.repo.findAndCount({
      where: { deletedAt: IsNull() },
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findFiltered(category?: string) {
    return this.repo.find({
      where: {
        deletedAt: IsNull(),
        ...(category && { category }),
      },
    });
  }
}
