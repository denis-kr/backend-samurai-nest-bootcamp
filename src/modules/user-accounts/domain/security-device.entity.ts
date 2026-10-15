import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'security_devices' })
export class SecurityDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  lastActiveDate: string;

  @Column({ type: 'varchar', unique: true })
  deviceId: string;
}
