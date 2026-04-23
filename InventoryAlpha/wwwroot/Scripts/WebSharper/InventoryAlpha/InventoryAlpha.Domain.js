import StringBuilder from "../WebSharper.StdLib/System.Text.StringBuilder.js"
import { iter, sortBy, map, ofArray, filter, length } from "../WebSharper.StdLib/Microsoft.FSharp.Collections.ListModule.js"
import { concat, Replace, Trim } from "../WebSharper.StdLib/Microsoft.FSharp.Core.StringModule.js"
import $StartupCode_Domain from "./$StartupCode_Domain.js"
import { sumBy } from "../WebSharper.StdLib/Microsoft.FSharp.Collections.SeqModule.js"
import { New } from "./InventoryAlpha.DashboardMetrics.js"
import { New as New_1 } from "./InventoryAlpha.InventoryItem.js"
import { Compare } from "../WebSharper.StdLib/Microsoft.FSharp.Core.Operators.Unchecked.js"
import { Critical, Low, Overstock, Healthy } from "./InventoryAlpha.StockStatus.js"
import { New as New_2 } from "./InventoryAlpha.UserPermissions.js"
import { Some } from "../WebSharper.StdLib/Microsoft.FSharp.Core.FSharpOption`1.js"
import { Administrator, Manager, Clerk, Viewer } from "./InventoryAlpha.UserRole.js"
import { Components, Office, Packaging, Safety, Electronics } from "./InventoryAlpha.Category.js"
export function exportCsv(items){
  const builder=new StringBuilder();
  builder.AppendLine_13(csvHeader());
  iter((item) => {
    builder.AppendLine_13(itemToCsvRow(item));
  }, sortBy((item) => item.Name, items));
  return String(builder);
}
export function itemToCsvRow(item){
  return concat(",", map(escapeCsvCell, ofArray([item.Sku, item.Name, categoryLabel(item.Category), item.Unit, String(item.OnHand), String(item.ReorderLevel), String(item.TargetStock), item.Supplier, item.Location])));
}
export function escapeCsvCell(value){
  return"\""+Replace(value, "\"", "\"\"")+"\"";
}
export function csvHeader(){
  return $StartupCode_Domain.csvHeader;
}
export function buildMetrics(today, items, movements){
  const thisMonth=(new Date(today)).getMonth()+1;
  const thisYear=(new Date(today)).getFullYear();
  const monthlyOutbound=sumBy((movement) => movement.Quantity, filter((movement) => movement.Kind.$===1&&(new Date(movement.OccurredAt)).getMonth()+1===thisMonth&&(new Date(movement.OccurredAt)).getFullYear()===thisYear, movements));
  const lowCount=length(filter((item) => {
    const m=statusFor(item);
    return m.$==0||m.$==1;
  }, items));
  const criticalCount=length(filter((item) => statusFor(item).$===0, items));
  const overstockCount=length(filter((item) => statusFor(item).$===3, items));
  return New(sumBy((item) => item.OnHand, items), items.Length, lowCount, criticalCount, monthlyOutbound, overstockCount);
}
export function applyMovement(whenUtc, command, item){
  return New_1(item.Id, item.Sku, item.Name, item.Category, item.Unit, item.OnHand+signedQuantity(command.Kind, command.Quantity), item.ReorderLevel, item.TargetStock, item.Supplier, item.Location, whenUtc);
}
export function signedQuantity(kind, quantity){
  return kind.$==1?-quantity:kind.$==2?quantity:quantity;
}
export function statusCss(a){
  return a.$==1?"status status-low":a.$==2?"status status-healthy":a.$==3?"status status-overstock":"status status-critical";
}
export function statusLabel(a){
  return a.$==1?"Low":a.$==2?"Healthy":a.$==3?"Overstock":"Critical";
}
export function statusFor(item){
  const a=1;
  const b=item.ReorderLevel/2>>0;
  let _1=Compare(a, b)===1?a:b;
  return item.OnHand<=_1?Critical:item.OnHand<=item.ReorderLevel?Low:item.OnHand>=item.TargetStock+(item.TargetStock/3>>0)?Overstock:Healthy;
}
export function permissionsFor(role){
  return role.$==1?New_2(true, true, true, false, false):role.$==2?New_2(true, false, true, false, false):role.$==3?New_2(false, false, false, false, false):New_2(true, true, true, true, true);
}
export function parseRole(value){
  const m=Trim(value).toLowerCase();
  return m=="administrator"?Some(Administrator):m=="manager"?Some(Manager):m=="clerk"?Some(Clerk):m=="viewer"?Some(Viewer):null;
}
export function roleCss(a){
  return a.$==1?"role-pill role-manager":a.$==2?"role-pill role-clerk":a.$==3?"role-pill role-viewer":"role-pill role-admin";
}
export function roleLabel(a){
  return a.$==1?"Manager":a.$==2?"Clerk":a.$==3?"Viewer":"Administrator";
}
export function kindLabel(a){
  return a.$==1?"Issue":a.$==2?"Adjustment":"Restock";
}
export function parseCategory(value){
  const m=Trim(value).toLowerCase();
  return m=="components"?Some(Components):m=="office"?Some(Office):m=="packaging"?Some(Packaging):m=="safety"?Some(Safety):m=="electronics"?Some(Electronics):null;
}
export function categoryLabel(a){
  return a.$==1?"Office":a.$==2?"Packaging":a.$==3?"Safety":a.$==4?"Electronics":"Components";
}
export function emptyWorkspace(){
  return $StartupCode_Domain.emptyWorkspace;
}
export function fallbackUser(){
  return $StartupCode_Domain.fallbackUser;
}
export function emptySnapshot(){
  return $StartupCode_Domain.emptySnapshot;
}
export function emptyPermissions(){
  return $StartupCode_Domain.emptyPermissions;
}
