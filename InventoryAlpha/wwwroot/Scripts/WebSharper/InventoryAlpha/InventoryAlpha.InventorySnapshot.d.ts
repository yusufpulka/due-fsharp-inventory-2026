import InventoryItem from "./InventoryAlpha.InventoryItem"
import { FSharpList_T } from "../WebSharper.StdLib/Microsoft.FSharp.Collections.FSharpList`1"
import StockMovement from "./InventoryAlpha.StockMovement"
import DashboardMetrics from "./InventoryAlpha.DashboardMetrics"
export function New(Items, RecentMovements, Metrics)
export default interface InventorySnapshot {
  Items:FSharpList_T<InventoryItem>;
  RecentMovements:FSharpList_T<StockMovement>;
  Metrics:DashboardMetrics;
}
