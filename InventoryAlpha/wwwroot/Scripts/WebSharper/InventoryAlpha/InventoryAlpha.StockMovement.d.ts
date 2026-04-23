import { MovementKind } from "./InventoryAlpha.MovementKind"
export function New(Id, ItemId, ItemName, Kind, Quantity, Note, OccurredAt, OccurredLabel, ActorName)
export default interface StockMovement {
  Id:string;
  ItemId:string;
  ItemName:string;
  Kind:MovementKind;
  Quantity:number;
  Note:string;
  OccurredAt:number;
  OccurredLabel:string;
  ActorName:string;
}
