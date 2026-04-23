import { UserRole } from "./InventoryAlpha.UserRole"
export function New(UserId, Name, Role, Badge)
export default interface UserCommand {
  UserId:string;
  Name:string;
  Role:UserRole;
  Badge:string;
}
