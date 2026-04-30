import { MovementKind } from "./InventoryAlpha.MovementKind"
export function New(ItemId, Kind, Quantity, Note)
export default interface MovementCommand {
  ItemId:string;
  Kind:MovementKind;
  Quantity:number;
  Note:string;
}
