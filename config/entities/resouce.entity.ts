import { Entity, Column } from "typeorm";
import { BaseEntity } from "./base";



@Entity({
  name: 'resource_tab'
})
export class ResourceEntity extends BaseEntity {
  constructor(partial?: Partial<ResourceEntity>) {
    super()
    partial && Object.assign(this, partial)
  }

  // 资源链接
  @Column({
    type: 'varchar',
    length: 200,
    unique: true
  })
  link: string

  @Column({
    type: 'int',
  })
  visit: number

  @Column({
    type: 'int'
  })
  download: number
} 


