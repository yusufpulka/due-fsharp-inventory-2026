import WorkspaceState from "./InventoryAlpha.WorkspaceState"
import { FSharpResult } from "../WebSharper.StdLib/Microsoft.FSharp.Core.FSharpResult`2"
import FSharpAsync from "../WebSharper.StdLib/Microsoft.FSharp.Control.FSharpAsync`1"
import UserCommand from "./InventoryAlpha.UserCommand"
import CsvImportResult from "./InventoryAlpha.CsvImportResult"
import MovementCommand from "./InventoryAlpha.MovementCommand"
export function DeleteUser(actorId:string, targetUserId:string):FSharpAsync<FSharpResult<WorkspaceState, string>>
export function SaveUser(actorId:string, command:UserCommand):FSharpAsync<FSharpResult<WorkspaceState, string>>
export function ResetDemoData(actorId:string):FSharpAsync<FSharpResult<WorkspaceState, string>>
export function ImportCsv(actorId:string, csvText:string):FSharpAsync<FSharpResult<CsvImportResult, string>>
export function ExportCsv(actorId:string):FSharpAsync<FSharpResult<string, string>>
export function SubmitMovement(actorId:string, command:MovementCommand):FSharpAsync<FSharpResult<WorkspaceState, string>>
export function GetWorkspace(actorId:string):FSharpAsync<WorkspaceState>
