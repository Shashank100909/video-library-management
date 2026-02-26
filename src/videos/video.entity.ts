import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity()
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  totalCopies: number;

  @Column()
  availableCopies: number;

  @DeleteDateColumn()
  deletedAt: Date;
}