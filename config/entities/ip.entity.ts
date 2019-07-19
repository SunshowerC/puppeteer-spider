import { Entity, Column } from "typeorm";
import { BaseEntity } from "./base";

export enum AvaliableEnum {
  False = 0,
  True = 1
}

@Entity({
  name: 'ip_tab'
})
export class IpEntity extends BaseEntity {
  constructor(partial?: Partial<IpEntity>) {
    super()
    partial && Object.assign(this, partial)
  }


  @Column({
    type: 'varchar',
    length: 50,
    unique: true
  })
  addr: string

  @Column({
    type: 'tinyint',
    default: AvaliableEnum.True
  })
  avaliable: number
} 


