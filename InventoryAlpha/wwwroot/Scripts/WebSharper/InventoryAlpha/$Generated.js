import { DecodeUnion, Id, DecodeRecord, DecodeList, DecodeDateTime, EncodeRecord, EncodeUnion } from "../WebSharper.Web/WebSharper.ClientSideJson.Provider.js"
let Decoder_UserRole;
let Decoder_AppUser;
let Decoder_Category;
let Decoder_InventoryItem;
let Decoder_MovementKind;
let Decoder_StockMovement;
let Decoder_InventorySnapshot;
let Decoder_WorkspaceState;
let Decoder_FSharpResult_2;
let Encoder_UserRole;
let Encoder_UserCommand;
let Decoder_CsvImportResult;
let Decoder_FSharpResult_3;
let Decoder_FSharpResult_4;
let Encoder_MovementKind;
let Encoder_MovementCommand;
export function DecodeJson_FSharpResult_2(){
  return Decoder_FSharpResult_2?Decoder_FSharpResult_2:Decoder_FSharpResult_2=(DecodeUnion(void 0, "$", [[0, [["$0", "ResultValue", DecodeJson_WorkspaceState, 0]]], [1, [["$0", "ErrorValue", Id(), 0]]]]))();
}
export function DecodeJson_WorkspaceState(){
  return Decoder_WorkspaceState?Decoder_WorkspaceState:Decoder_WorkspaceState=(DecodeRecord(void 0, [["CurrentUser", DecodeJson_AppUser, 0], ["Users", DecodeList(DecodeJson_AppUser), 0], ["Permissions", Id(), 0], ["Inventory", DecodeJson_InventorySnapshot, 0], ["CsvTemplate", Id(), 0]]))();
}
export function DecodeJson_InventorySnapshot(){
  return Decoder_InventorySnapshot?Decoder_InventorySnapshot:Decoder_InventorySnapshot=(DecodeRecord(void 0, [["Items", DecodeList(DecodeJson_InventoryItem), 0], ["RecentMovements", DecodeList(DecodeJson_StockMovement), 0], ["Metrics", Id(), 0]]))();
}
export function DecodeJson_StockMovement(){
  return Decoder_StockMovement?Decoder_StockMovement:Decoder_StockMovement=(DecodeRecord(void 0, [["Id", Id(), 0], ["ItemId", Id(), 0], ["ItemName", Id(), 0], ["Kind", DecodeJson_MovementKind, 0], ["Quantity", Id(), 0], ["Note", Id(), 0], ["OccurredAt", DecodeDateTime(), 0], ["OccurredLabel", Id(), 0], ["ActorName", Id(), 0]]))();
}
export function DecodeJson_MovementKind(){
  return Decoder_MovementKind?Decoder_MovementKind:Decoder_MovementKind=(DecodeUnion(void 0, "$", [[0, []], [1, []], [2, []]]))();
}
export function DecodeJson_InventoryItem(){
  return Decoder_InventoryItem?Decoder_InventoryItem:Decoder_InventoryItem=(DecodeRecord(void 0, [["Id", Id(), 0], ["Sku", Id(), 0], ["Name", Id(), 0], ["Category", DecodeJson_Category, 0], ["Unit", Id(), 0], ["OnHand", Id(), 0], ["ReorderLevel", Id(), 0], ["TargetStock", Id(), 0], ["Supplier", Id(), 0], ["Location", Id(), 0], ["LastUpdated", DecodeDateTime(), 0]]))();
}
export function DecodeJson_Category(){
  return Decoder_Category?Decoder_Category:Decoder_Category=(DecodeUnion(void 0, "$", [[0, []], [1, []], [2, []], [3, []], [4, []]]))();
}
export function DecodeJson_AppUser(){
  return Decoder_AppUser?Decoder_AppUser:Decoder_AppUser=(DecodeRecord(void 0, [["Id", Id(), 0], ["Name", Id(), 0], ["Role", DecodeJson_UserRole, 0], ["Badge", Id(), 0]]))();
}
export function DecodeJson_UserRole(){
  return Decoder_UserRole?Decoder_UserRole:Decoder_UserRole=(DecodeUnion(void 0, "$", [[0, []], [1, []], [2, []], [3, []]]))();
}
export function EncodeJson_UserCommand(){
  return Encoder_UserCommand?Encoder_UserCommand:Encoder_UserCommand=(EncodeRecord(void 0, [["UserId", Id(), 0], ["Name", Id(), 0], ["Role", EncodeJson_UserRole, 0], ["Badge", Id(), 0]]))();
}
export function EncodeJson_UserRole(){
  return Encoder_UserRole?Encoder_UserRole:Encoder_UserRole=(EncodeUnion(void 0, "$", [[0, []], [1, []], [2, []], [3, []]]))();
}
export function DecodeJson_FSharpResult_3(){
  return Decoder_FSharpResult_3?Decoder_FSharpResult_3:Decoder_FSharpResult_3=(DecodeUnion(void 0, "$", [[0, [["$0", "ResultValue", DecodeJson_CsvImportResult, 0]]], [1, [["$0", "ErrorValue", Id(), 0]]]]))();
}
export function DecodeJson_CsvImportResult(){
  return Decoder_CsvImportResult?Decoder_CsvImportResult:Decoder_CsvImportResult=(DecodeRecord(void 0, [["Workspace", DecodeJson_WorkspaceState, 0], ["ImportedCount", Id(), 0], ["Message", Id(), 0]]))();
}
export function DecodeJson_FSharpResult_4(){
  return Decoder_FSharpResult_4?Decoder_FSharpResult_4:Decoder_FSharpResult_4=(DecodeUnion(void 0, "$", [[0, [["$0", "ResultValue", Id(), 0]]], [1, [["$0", "ErrorValue", Id(), 0]]]]))();
}
export function EncodeJson_MovementKind(){
  return Encoder_MovementKind?Encoder_MovementKind:Encoder_MovementKind=(EncodeUnion(void 0, "$", [[0, []], [1, []], [2, []]]))();
}
export function EncodeJson_MovementCommand(){
  return Encoder_MovementCommand?Encoder_MovementCommand:Encoder_MovementCommand=(EncodeRecord(void 0, [["ItemId", Id(), 0], ["Kind", EncodeJson_MovementKind, 0], ["Quantity", Id(), 0], ["Note", Id(), 0]]))();
}
