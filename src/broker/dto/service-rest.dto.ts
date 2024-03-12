import { VertexPointerRestDto } from './vertex-pointer-rest.dto';

// Shared DTO: Copy in back-end and front-end should be identical
export class ServiceRestDto extends VertexPointerRestDto {
  id!: string;
  description?: string;
  name!: string;
  title?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vaultConfig?: any;
}
