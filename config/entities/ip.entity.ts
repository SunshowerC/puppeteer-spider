import { Entity, Column } from "typeorm";
import { BaseEntity } from "./base";


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


  // ip 所在地区
  @Column({
    type: 'varchar',
    default: ''
  })
  origin: string

  // 已下载了的资源 id， 逗号切分 
  @Column({
    type: 'varchar',
    default: ''
  })
  downloaded: string

  // 这个 ip 是在哪爬到的
  @Column({
    type: 'varchar',
    default: ''
  })
  from: string
} 


