import { Category } from "./InventoryAlpha.Category"
export function New(Id, Sku, Name, Category_1, Unit, OnHand, ReorderLevel, TargetStock, Supplier, Location, LastUpdated)
export default interface InventoryItem {
  Id:string;
  Sku:string;
  Name:string;
  Category:Category;
  Unit:string;
  OnHand:number;
  ReorderLevel:number;
  TargetStock:number;
  Supplier:string;
  Location:string;
  LastUpdated:number;
}
