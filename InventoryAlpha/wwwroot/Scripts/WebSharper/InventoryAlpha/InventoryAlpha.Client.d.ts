import Doc from "../WebSharper.UI/WebSharper.UI.Doc"
import WorkspaceState from "./InventoryAlpha.WorkspaceState"
import { View_T } from "../WebSharper.UI/WebSharper.UI.View`1"
import Var from "../WebSharper.UI/WebSharper.UI.Var`1"
import InventoryItem from "./InventoryAlpha.InventoryItem"
import { FSharpOption } from "../WebSharper.StdLib/Microsoft.FSharp.Core.FSharpOption`1"
import StockMovement from "./InventoryAlpha.StockMovement"
import AppUser from "./InventoryAlpha.AppUser"
import { UserRole } from "./InventoryAlpha.UserRole"
import { MovementKind } from "./InventoryAlpha.MovementKind"
import { Category } from "./InventoryAlpha.Category"
import { FSharpList_T } from "../WebSharper.StdLib/Microsoft.FSharp.Collections.FSharpList`1"
export function Main():Doc
export function liveStatusGreeting(workspaceView:View_T<WorkspaceState>):View_T<string>
export function liveStatusDetail(workspaceView:View_T<WorkspaceState>):Doc
export function actionStrip(workspaceVar:Var<WorkspaceState>, userIdVar:Var<string>, statusVar:Var<string>):Doc
export function csvPanel(workspaceVar:Var<WorkspaceState>, userIdVar:Var<string>, statusVar:Var<string>):Doc
export function userManagementPanel(workspaceVar:Var<WorkspaceState>, userIdVar:Var<string>, statusVar:Var<string>):Doc
export function commandPanel(workspaceVar:Var<WorkspaceState>, userIdVar:Var<string>, selectedItemId:Var<string>, feedbackVar:Var<string>):Doc
export function inventoryBoard(workspaceView:View_T<WorkspaceState>, searchVar:Var<string>, categoryVar:Var<string>, selectedItemId:Var<string>):Doc
export function dashboard(workspaceView:View_T<WorkspaceState>):Doc
export function roleBar(workspaceVar:Var<WorkspaceState>, userIdVar:Var<string>, statusVar:Var<string>):Doc
export function movementTimeline(workspaceView:View_T<WorkspaceState>):Doc
export function alertsPanel(workspaceView:View_T<WorkspaceState>, selectedItemId:Var<string>):Doc
export function selectedPanel(selectedItemView:View_T<FSharpOption<InventoryItem>>):Doc
export function viewSelectedItem(workspaceView:View_T<WorkspaceState>, selectedItemIdView:View_T<string>):View_T<FSharpOption<InventoryItem>>
export function inventoryCard(selectedItemId:Var<string>, item:InventoryItem):Doc
export function renderMovement(movement:StockMovement):Doc
export function rolePill(user:AppUser):Doc
export function statusPill(item:InventoryItem):Doc
export function permissionChip(enabledState:boolean, labelText:string):Doc
export function metricCard(tone:string, title:string, valueView:View_T<string>, detailView:View_T<string>):Doc
export function tryInt(textValue:string):FSharpOption<number>
export function asUserRole(value:string):UserRole
export function asMovementKind(value:string):MovementKind
export function asCategoryFilter(value:string):FSharpOption<Category>
export function roleOptions():FSharpList_T<[string, string]>
export function actionOptions():FSharpList_T<[string, string]>
export function categoryOptions():FSharpList_T<[string, string]>
