import WorkspaceState from "./InventoryAlpha.WorkspaceState"
import AppUser from "./InventoryAlpha.AppUser"
import InventorySnapshot from "./InventoryAlpha.InventorySnapshot"
import UserPermissions from "./InventoryAlpha.UserPermissions"
export default class $StartupCode_Domain {
  static csvHeader:string;
  static emptyWorkspace:WorkspaceState;
  static fallbackUser:AppUser;
  static emptySnapshot:InventorySnapshot;
  static emptyPermissions:UserPermissions;
}
