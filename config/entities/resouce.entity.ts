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

  // 资源名称
  @Column({
    type: 'varchar',
  })
  name: string  

  // 资源链接
  @Column({
    type: 'varchar',
    length: 200,
    unique: true
  })
  link: string

  // 资源来源页
  @Column({
    type: 'varchar',
    length: 200,
  })
  from: string

  // 被下载的次数
  @Column({
    type: 'int'
  })
  download: number

  // 当周被下载的次数
  @Column({
    type: 'int',
    name: `weekly_download`
  })
  weeklyDownload: number
} 

