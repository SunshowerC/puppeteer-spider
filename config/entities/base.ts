import {
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  ValueTransformer
} from 'typeorm'

export const timestampTransfomer: ValueTransformer = {
  to: (value: number) => (value ? Math.floor(value / 1000) : 0),
  from: (value: number) => {
    const now = Date.now()
    return value * 1000 > now ? value : value * 1000
  }
}

export class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    unsigned: true,
    type: 'int',
    default: 0,
    transformer: timestampTransfomer
  })
  createtimestamp: number

  @Column({
    unsigned: true,
    type: 'int',
    default: 0,
    transformer: timestampTransfomer
  })
  updatetimestamp: number

  @BeforeInsert()
  private initTimestamp() {
    const now = Date.now()
    this.createtimestamp = now
    this.updatetimestamp = now
  }

  @BeforeUpdate()
  private updateTimestamp() {
    const now = Date.now()
    this.updatetimestamp = now
  }
}
