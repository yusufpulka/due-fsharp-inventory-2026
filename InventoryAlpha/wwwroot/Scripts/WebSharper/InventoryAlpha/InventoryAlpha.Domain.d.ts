import InventoryItem from "./InventoryAlpha.InventoryItem"
import { FSharpList_T } from "../WebSharper.StdLib/Microsoft.FSharp.Collections.FSharpList`1"
import StockMovement from "./InventoryAlpha.StockMovement"
import DashboardMetrics from "./InventoryAlpha.DashboardMetrics"
import MovementCommand from "./InventoryAlpha.MovementCommand"
import { MovementKind } from "./InventoryAlpha.MovementKind"
import { StockStatus } from "./InventoryAlpha.StockStatus"
import { UserRole } from "./InventoryAlpha.UserRole"
import UserPermissions from "./InventoryAlpha.UserPermissions"
import { FSharpOption } from "../WebSharper.StdLib/Microsoft.FSharp.Core.FSharpOption`1"
import { Category } from "./InventoryAlpha.Category"
import WorkspaceState from "./InventoryAlpha.WorkspaceState"
import AppUser from "./InventoryAlpha.AppUser"
import InventorySnapshot from "./InventoryAlpha.InventorySnapshot"
export function exportCsv(items:FSharpList_T<InventoryItem>):string
export function itemToCsvRow(item:InventoryItem):string
export function escapeCsvCell(value:string):string
export function csvHeader():string
export function buildMetrics(today:number, items:FSharpList_T<InventoryItem>, movements:FSharpList_T<StockMovement>):DashboardMetrics
export function applyMovement(whenUtc:number, command:MovementCommand, item:InventoryItem):InventoryItem
export function signedQuantity(kind:MovementKind, quantity:number):number
export function statusCss(a:StockStatus):string
export function statusLabel(a:StockStatus):string
export function statusFor(item:InventoryItem):StockStatus
export function permissionsFor(role:UserRole):UserPermissions
export function parseRole(value:string):FSharpOption<UserRole>
export function roleCss(a:UserRole):string
export function roleLabel(a:UserRole):string
export function kindLabel(a:MovementKind):string
export function parseCategory(value:string):FSharpOption<Category>
export function categoryLabel(a:Category):string
export function emptyWorkspace():WorkspaceState
export function fallbackUser():AppUser
export function emptySnapshot():InventorySnapshot
export function emptyPermissions():UserPermissions
