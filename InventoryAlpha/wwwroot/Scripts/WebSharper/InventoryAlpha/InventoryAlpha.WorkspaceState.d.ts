import AppUser from "./InventoryAlpha.AppUser"
import { FSharpList_T } from "../WebSharper.StdLib/Microsoft.FSharp.Collections.FSharpList`1"
import UserPermissions from "./InventoryAlpha.UserPermissions"
import InventorySnapshot from "./InventoryAlpha.InventorySnapshot"
export function New(CurrentUser, Users, Permissions, Inventory, CsvTemplate)
export default interface WorkspaceState {
  CurrentUser:AppUser;
  Users:FSharpList_T<AppUser>;
  Permissions:UserPermissions;
  Inventory:InventorySnapshot;
  CsvTemplate:string;
}
