import 'reflect-metadata';
export const META_ROLES = Symbol('roles');

export function Roles(...roles: string[]) {
  return (
    _target: unknown,
    _key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    Reflect.defineMetadata(META_ROLES, roles, descriptor.value);
  };
}
