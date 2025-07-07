import { User } from '@auth/domain/entities/user.entity';
/**
 * Interfaz del repositorio de usuarios.
 */
export interface UserRepositoryPort {
  /**
   * Verifica si un usuario existe por su correo electrónico.
   * @param email Email del usuario a buscar.
   * @returns true si el usuario existe, false en caso contrario.
   */
  existsByEmail(email: string): Promise<boolean>;
  /**
   * Verficia si esxiste el usuario con el nombre proporcionado
   * @param username Nombre de Usuario a buscar
   * @return true si el usuario existe, false en caso contrario.
   */
  existsByUsername(username: string): Promise<boolean>;
  /**
   * Verifica si un usuario existe por su login(usuario o email).
   * @param login Login del usuario a buscar.
   * @returns true si el usuario existe, false en caso contrario.
   */
  findByLogin(longin: string): Promise<User | null>;
  /**
   * Busca un usuario por su email.
   * @param email Email del usuario a buscar.
   * @returns Usuario encontrado o null si no existe.
   */
  findById(id: number): Promise<User | null>;
  /**
   * Guarda un usuario nuevo en en el repositorio
   * @param user Usuario a guardar
   * @returns Promesa de void que se resuelve cuando el usuario se guarda correctamente.
   */
  save(user: User): Promise<void>;
}
