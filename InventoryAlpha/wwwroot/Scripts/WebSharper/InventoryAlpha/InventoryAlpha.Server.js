import { Bind, Return } from "../WebSharper.StdLib/WebSharper.Concurrency.js"
import AjaxRemotingProvider from "../WebSharper.StdLib/WebSharper.Remoting.AjaxRemotingProvider.js"
import { DecodeJson_FSharpResult_2, EncodeJson_UserCommand, DecodeJson_FSharpResult_3, DecodeJson_FSharpResult_4, EncodeJson_MovementCommand, DecodeJson_WorkspaceState } from "./$Generated.js"
export function DeleteUser(actorId, targetUserId){
  return Bind((new AjaxRemotingProvider()).Async("Server/DeleteUser", [actorId, targetUserId]), (o) => Return((DecodeJson_FSharpResult_2())(o)));
}
export function SaveUser(actorId, command){
  return Bind((new AjaxRemotingProvider()).Async("Server/SaveUser", [actorId, (EncodeJson_UserCommand())(command)]), (o) => Return((DecodeJson_FSharpResult_2())(o)));
}
export function ResetDemoData(actorId){
  return Bind((new AjaxRemotingProvider()).Async("Server/ResetDemoData", [actorId]), (o) => Return((DecodeJson_FSharpResult_2())(o)));
}
export function ImportCsv(actorId, csvText){
  return Bind((new AjaxRemotingProvider()).Async("Server/ImportCsv", [actorId, csvText]), (o) => Return((DecodeJson_FSharpResult_3())(o)));
}
export function ExportCsv(actorId){
  return Bind((new AjaxRemotingProvider()).Async("Server/ExportCsv", [actorId]), (o) => Return((DecodeJson_FSharpResult_4())(o)));
}
export function SubmitMovement(actorId, command){
  return Bind((new AjaxRemotingProvider()).Async("Server/SubmitMovement", [actorId, (EncodeJson_MovementCommand())(command)]), (o) => Return((DecodeJson_FSharpResult_2())(o)));
}
export function GetWorkspace(actorId){
  return Bind((new AjaxRemotingProvider()).Async("Server/GetWorkspace", [actorId]), (o) => Return((DecodeJson_WorkspaceState())(o)));
}
