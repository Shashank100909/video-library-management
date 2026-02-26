import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    CreateDateColumn,
  } from 'typeorm';
  import { User } from '../users/user.entity';
  import { Video } from '../videos/video.entity';
  import { RelationId } from 'typeorm';
  
  export enum BorrowStatus {
    BORROWED = 'BORROWED',
    RETURNED = 'RETURNED',
  }
  
  @Entity()
  export class Borrow {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User)
    user: User;
    
    @RelationId((borrow: Borrow) => borrow.user)
    userId: number;
    
    @ManyToOne(() => Video)
    video: Video;
    
    @RelationId((borrow: Borrow) => borrow.video)
    videoId: number;
  
    @CreateDateColumn()
    borrowedAt: Date;
  
    @Column({ type: 'timestamp', nullable: true })
    returnedAt: Date;
  
    @Column({
      type: 'enum',
      enum: BorrowStatus,
      default: BorrowStatus.BORROWED,
    })
    status: BorrowStatus;
  }