import Var from "../WebSharper.UI/WebSharper.UI.Var.js"
import { emptyWorkspace, roleLabel, roleCss, statusFor, statusCss, statusLabel, categoryLabel, kindLabel, parseRole } from "./InventoryAlpha.Domain.js"
import { StartImmediate, Delay, Bind, Zero } from "../WebSharper.StdLib/WebSharper.Concurrency.js"
import { GetWorkspace, ResetDemoData, ExportCsv, ImportCsv, SaveUser, DeleteUser, SubmitMovement } from "./InventoryAlpha.Server.js"
import Doc from "../WebSharper.UI/WebSharper.UI.Doc.js"
import Attr from "../WebSharper.UI/WebSharper.UI.Attr.js"
import { Map, Map3, Map2 } from "../WebSharper.UI/WebSharper.UI.View.js"
import { toSafe } from "../WebSharper.StdLib/WebSharper.Utils.js"
import { ofSeq, filter, map, sortBy } from "../WebSharper.StdLib/Microsoft.FSharp.Collections.ListModule.js"
import { delay, append, tryFind } from "../WebSharper.StdLib/Microsoft.FSharp.Collections.SeqModule.js"
import { get } from "../WebSharper.StdLib/Microsoft.FSharp.Core.LanguagePrimitives.IntrinsicFunctions.js"
import { SplitChars, IsNullOrWhiteSpace, Trim } from "../WebSharper.StdLib/Microsoft.FSharp.Core.StringModule.js"
import { New } from "./InventoryAlpha.UserCommand.js"
import { New as New_1 } from "./InventoryAlpha.MovementCommand.js"
import { Equals } from "../WebSharper.StdLib/Microsoft.FSharp.Core.Operators.Unchecked.js"
import { TryParse } from "../WebSharper.StdLib/System.Int32.js"
import { Some } from "../WebSharper.StdLib/Microsoft.FSharp.Core.FSharpOption`1.js"
import { Viewer } from "./InventoryAlpha.UserRole.js"
import { Restock, Adjustment, Issue } from "./InventoryAlpha.MovementKind.js"
import { Components, Office, Packaging, Safety, Electronics } from "./InventoryAlpha.Category.js"
import $StartupCode_Client from "./$StartupCode_Client.js"
export function Main(){
  const defaultUserId="usr-1";
  const userIdVar=Var.Create_1(defaultUserId);
  const workspaceVar=Var.Create_1(emptyWorkspace());
  const searchVar=Var.Create_1("");
  const categoryVar=Var.Create_1("");
  const selectedItemId=Var.Create_1("");
  const statusVar=Var.Create_1("Loading workspace...");
  const _1=null;
  StartImmediate(Delay(() => Bind(GetWorkspace(defaultUserId), (a) => {
    workspaceVar.Set(a);
    statusVar.Set("Workspace ready.");
    return Zero();
  })), null);
  return Doc.Element("div", [Attr.Create("class", "shell")], [Doc.Element("section", [Attr.Create("class", "hero")], [Doc.Element("div", [Attr.Create("class", "hero-grid")], [Doc.Element("div", [], [Doc.Element("p", [Attr.Create("class", "eyebrow")], [Doc.TextNode("Alpha Project Build")]), Doc.Element("h1", [], [Doc.TextNode("ShelfPilot Control Room")]), Doc.Element("p", [Attr.Create("class", "hero-copy")], [Doc.TextNode("A more production-style WebSharper inventory workspace with role-aware access, CSV catalog operations, stock movement logging, and a responsive dashboard layout.")]), actionStrip(workspaceVar, userIdVar, statusVar)]), Doc.Element("div", [Attr.Create("class", "hero-card")], [Doc.Element("p", [Attr.Create("class", "section-kicker")], [Doc.TextNode("Live status")]), Doc.Element("p", [Attr.Create("class", "hero-status")], [Doc.TextView(liveStatusGreeting(workspaceVar.View))]), Doc.Element("p", [Attr.Create("class", "hero-status-detail")], [Doc.TextView(statusVar.View)]), Doc.Element("div", [Attr.Create("class", "hero-status-detail")], [liveStatusDetail(workspaceVar.View)])])])]), roleBar(workspaceVar, userIdVar, statusVar), dashboard(workspaceVar.View), Doc.Element("div", [Attr.Create("class", "content-grid")], [Doc.Element("div", [Attr.Create("class", "main-stack")], [inventoryBoard(workspaceVar.View, searchVar, categoryVar, selectedItemId), Doc.Element("div", [Attr.Create("class", "two-panel-grid")], [Doc.Element("div", [Attr.Create("class", "panel"), Attr.Create("id", "attention-queue")], [Doc.Element("div", [Attr.Create("class", "panel-head panel-head-stack")], [Doc.Element("div", [], [Doc.Element("p", [Attr.Create("class", "section-kicker")], [Doc.TextNode("Exceptions")]), Doc.Element("h2", [], [Doc.TextNode("Low-stock attention queue")])])]), alertsPanel(workspaceVar.View, selectedItemId)]), Doc.Element("div", [Attr.Create("class", "panel")], [Doc.Element("div", [Attr.Create("class", "panel-head panel-head-stack")], [Doc.Element("div", [], [Doc.Element("p", [Attr.Create("class", "section-kicker")], [Doc.TextNode("Activity")]), Doc.Element("h2", [], [Doc.TextNode("Recent movements")])])]), movementTimeline(workspaceVar.View)])]), csvPanel(workspaceVar, userIdVar, statusVar), userManagementPanel(workspaceVar, userIdVar, statusVar)]), commandPanel(workspaceVar, userIdVar, selectedItemId, statusVar)])]);
}
export function liveStatusGreeting(workspaceView){
  return Map((workspace) =>"Hi "+toSafe(workspace.CurrentUser.Name)+", you're signed in as "+toSafe(roleLabel(workspace.CurrentUser.Role))+".", workspaceView);
}
export function liveStatusDetail(workspaceView){
  return Doc.EmbedView(Map((workspace) => {
    const metrics=workspace.Inventory.Metrics;
    const roleName=roleLabel(workspace.CurrentUser.Role);
    return metrics.CriticalCount>0?Doc.Element("a", [Attr.Create("class", "hero-status-link"), Attr.Create("href", "#attention-queue")], [Doc.TextNode(toSafe(roleName)+" view: "+String(metrics.CriticalCount)+" critical item(s) need urgent attention and "+String(metrics.LowStockCount)+" line(s) are below target.")]):metrics.LowStockCount>0?Doc.Element("a", [Attr.Create("class", "hero-status-link"), Attr.Create("href", "#attention-queue")], [Doc.TextNode(toSafe(roleName)+" view: "+String(metrics.LowStockCount)+" low-stock line(s) need review and "+String(metrics.TotalSkus)+" SKU(s) are being tracked.")]):metrics.OverstockCount>0?Doc.Element("span", [], [Doc.TextNode(toSafe(roleName)+" view: inventory is stable, with "+String(metrics.OverstockCount)+" overstocked item(s) and "+String(metrics.TotalUnits)+" unit(s) on hand.")]):Doc.Element("span", [], [Doc.TextNode(toSafe(roleName)+" view: inventory looks healthy across "+String(metrics.TotalSkus)+" SKU(s), with "+String(metrics.TotalUnits)+" unit(s) currently on hand.")]);
  }, workspaceView));
}
export function actionStrip(workspaceVar, userIdVar, statusVar){
  return Doc.Element("div", [Attr.Create("class", "hero-actions")], [Doc.BindView((workspace) => Doc.Concat(ofSeq(delay(() => append(workspace.Permissions.CanExportCsv?[Doc.Element("button", [Attr.Create("class", "hero-button hero-button-secondary"), Attr.HandlerImpl("click", () =>() => statusVar.Set("Use the CSV panel below to export the current inventory."))], [Doc.TextNode("Open CSV tools")])]:[], delay(() => workspace.Permissions.CanResetDemo?[Doc.Element("button", [Attr.Create("class", "hero-button"), Attr.HandlerImpl("click", () =>() => {
    const _1=null;
    return StartImmediate(Delay(() => Bind(ResetDemoData(userIdVar.Get()), (a) => a.$==1?(statusVar.Set(a.$0),Zero()):(workspaceVar.Set(a.$0),statusVar.Set("Demo data reset."),Zero()))), null);
  })], [Doc.TextNode("Reset demo data")])]:[]))))), workspaceVar.View)]);
}
export function csvPanel(workspaceVar, userIdVar, statusVar){
  const csvVar=Var.Create_1("");
  const importBusyVar=Var.Create_1(false);
  const exportBusyVar=Var.Create_1(false);
  return Doc.Element("div", [Attr.Create("class", "panel")], [Doc.Element("div", [Attr.Create("class", "panel-head panel-head-stack")], [Doc.Element("div", [], [Doc.Element("p", [Attr.Create("class", "section-kicker")], [Doc.TextNode("Data tools")]), Doc.Element("h2", [], [Doc.TextNode("CSV import and export")]), Doc.Element("p", [Attr.Create("class", "muted")], [Doc.TextNode("This follows the familiar inventory-admin workflow: export the catalog, edit it in CSV, then re-import it.")])])]), Doc.BindView((workspace) => Doc.Element("div", [], ofSeq(delay(() => append([Doc.Element("div", [Attr.Create("class", "csv-toolbar")], ofSeq(delay(() => append(workspace.Permissions.CanExportCsv?[Doc.Element("button", [Attr.Create("class", "ghost-button"), Attr.HandlerImpl("click", () =>() => {
    const _1=null;
    return StartImmediate(Delay(() => {
      exportBusyVar.Set(true);
      return Bind(ExportCsv(userIdVar.Get()), (a) => {
        exportBusyVar.Set(false);
        if(a.$==1){
          statusVar.Set(a.$0);
          return Zero();
        }
        else {
          let a_1=document.createElement("a");
          a_1.href="data:text/csv;charset=utf-8,"+encodeURIComponent(a.$0);
          a_1.download="inventory-export.csv";
          document.body.appendChild(a_1);
          a_1.click();
          document.body.removeChild(a_1);
          statusVar.Set("CSV export downloaded.");
          return Zero();
        }
      });
    }), null);
  })], [Doc.TextView(Map((busy) => busy?"Preparing export...":"Export CSV", exportBusyVar.View))])]:[], delay(() => workspace.Permissions.CanImportCsv?[Doc.Element("label", [Attr.Create("class", "file-button")], [Doc.TextNode("Load CSV file"), Doc.Element("input", [Attr.Create("type", "file"), Attr.Create("accept", ".csv,text/csv"), Attr.HandlerImpl("change", (el) =>() => {
    const files=el.files;
    const file=files&&files.length>0?files[0]:null;
    if(!(file==null)){
      if(file){
        let reader=new FileReader();
        reader.onload=() => {
          (((fileText) => {
            csvVar.Set(fileText);
          })(reader.result?String(reader.result):""));
        };
        reader.readAsText(file);
      }
      return;
    }
    else return null;
  })], [])])]:[])))))], delay(() => append([Doc.Element("textarea", [Attr.Create("class", "csv-box"), Attr.Create("placeholder", "Paste CSV data here."), Attr.HandlerImpl("input", (el) =>() => csvVar.Set(el.value))], [Doc.TextView(csvVar.View)])], delay(() => append([Doc.Element("div", [Attr.Create("class", "csv-help muted")], [Doc.TextNode("Expected columns: "), Doc.Element("code", [], [Doc.TextNode(get(SplitChars(workspace.CsvTemplate, ["\n"], 0), 0))])])], delay(() => workspace.Permissions.CanImportCsv?[Doc.Element("button", [Attr.Create("class", "primary-button"), Attr.HandlerImpl("click", () =>() => {
    const _1=null;
    return StartImmediate(Delay(() => IsNullOrWhiteSpace(csvVar.Get())?(statusVar.Set("Paste CSV content or load a CSV file first."),Zero()):(importBusyVar.Set(true),Bind(ImportCsv(userIdVar.Get(), csvVar.Get()), (a) => {
      importBusyVar.Set(false);
      if(a.$==1){
        statusVar.Set(a.$0);
        return Zero();
      }
      else {
        const importResult=a.$0;
        workspaceVar.Set(importResult.Workspace);
        csvVar.Set("");
        statusVar.Set(importResult.Message);
        return Zero();
      }
    }))), null);
  })], [Doc.TextView(Map((busy) => busy?"Importing...":"Import CSV", importBusyVar.View))])]:!workspace.Permissions.CanExportCsv?[Doc.Element("div", [Attr.Create("class", "read-only-box")], [Doc.Element("h3", [], [Doc.TextNode("No CSV access")]), Doc.Element("p", [Attr.Create("class", "muted")], [Doc.TextNode("Switch to a manager or administrator account to import catalog data.")])])]:[]))))))))), workspaceVar.View)]);
}
export function userManagementPanel(workspaceVar, userIdVar, statusVar){
  const createNameVar=Var.Create_1("");
  const createBadgeVar=Var.Create_1("");
  const createRoleVar=Var.Create_1("Viewer");
  const saveBusyVar=Var.Create_1(false);
  const deleteBusyVar=Var.Create_1(false);
  const resetCreateForm=() => {
    createNameVar.Set("");
    createBadgeVar.Set("");
    createRoleVar.Set("Viewer");
  };
  const saveUser=(command, successMessage) => {
    const _1=null;
    return StartImmediate(Delay(() => {
      saveBusyVar.Set(true);
      return Bind(SaveUser(userIdVar.Get(), command), (a) => {
        saveBusyVar.Set(false);
        return a.$==1?(statusVar.Set(a.$0),Zero()):(workspaceVar.Set(a.$0),statusVar.Set(successMessage),Zero());
      });
    }), null);
  };
  return Doc.Element("div", [Attr.Create("class", "panel")], [Doc.Element("div", [Attr.Create("class", "panel-head panel-head-stack")], [Doc.Element("div", [], [Doc.Element("p", [Attr.Create("class", "section-kicker")], [Doc.TextNode("Admin")]), Doc.Element("h2", [], [Doc.TextNode("User management")]), Doc.Element("p", [Attr.Create("class", "muted")], [Doc.TextNode("Administrators can create workers, update their details, change roles, and remove accounts.")])]), Doc.Element("button", [Attr.Create("class", "ghost-button"), Attr.HandlerImpl("click", () =>() => resetCreateForm())], [Doc.TextNode("New user")])]), Doc.BindView((workspace) => {
    if(workspace.Permissions.CanManageUsers){
      const otherUsers=filter((user) => user.Id!=workspace.CurrentUser.Id, workspace.Users);
      return Doc.Element("div", [Attr.Create("class", "user-admin-grid")], [Doc.Element("div", [Attr.Create("class", "user-list")], ofSeq(delay(() => append([Doc.Element("div", [Attr.Create("class", "user-editor user-create-card")], [Doc.Element("p", [Attr.Create("class", "section-kicker")], [Doc.TextNode("Create worker")]), Doc.Element("div", [Attr.Create("class", "field-group")], [Doc.Element("label", [], [Doc.TextNode("Name")]), Doc.Element("input", [Attr.Create("class", "search-input"), Attr.Create("placeholder", "Worker name"), Attr.HandlerImpl("input", (el) =>() => createNameVar.Set(el.value))], [])]), Doc.Element("div", [Attr.Create("class", "field-group")], [Doc.Element("label", [], [Doc.TextNode("Badge")]), Doc.Element("input", [Attr.Create("class", "search-input"), Attr.Create("placeholder", "e.g. Warehouse Lead"), Attr.HandlerImpl("input", (el) =>() => createBadgeVar.Set(el.value))], [])]), Doc.Element("div", [Attr.Create("class", "field-group")], [Doc.Element("label", [], [Doc.TextNode("Role")]), Doc.Element("select", [Attr.Create("class", "search-select"), Attr.HandlerImpl("change", (el) =>() => createRoleVar.Set(el.value))], map((_1) => Doc.Element("option", [Attr.Create("value", _1[0])], [Doc.TextNode(_1[1])]), roleOptions()))]), Doc.Element("div", [Attr.Create("class", "user-editor-actions")], [Doc.Element("button", [Attr.Create("class", "primary-button"), Attr.HandlerImpl("click", () =>() => {
        const N=createNameVar.Get();
        const B=createBadgeVar.Get();
        let _1=New("", N, asUserRole(createRoleVar.Get()), B);
        saveUser(_1, "User created successfully.");
        return resetCreateForm();
      })], [Doc.TextView(Map((busy) => busy?"Saving...":"Create user", saveBusyVar.View))])])])], delay(() => otherUsers.$==0?[Doc.Element("div", [Attr.Create("class", "empty-note")], [Doc.TextNode("No other workers are available yet.")])]:[Doc.Concat(map((user) => {
        const nameVar=Var.Create_1(user.Name);
        const badgeVar=Var.Create_1(user.Badge);
        const roleVar=Var.Create_1(roleLabel(user.Role));
        return Doc.Element("div", [Attr.Create("class", "user-row")], [Doc.Element("div", [Attr.Create("class", "user-row-fields")], [Doc.Element("div", [Attr.Create("class", "field-group compact")], [Doc.Element("label", [], [Doc.TextNode("Name")]), Doc.Element("input", [Attr.Create("class", "search-input"), Attr.Create("value", user.Name), Attr.HandlerImpl("input", (el) =>() => nameVar.Set(el.value))], [])]), Doc.Element("div", [Attr.Create("class", "field-group compact")], [Doc.Element("label", [], [Doc.TextNode("Badge")]), Doc.Element("input", [Attr.Create("class", "search-input"), Attr.Create("value", user.Badge), Attr.HandlerImpl("input", (el) =>() => badgeVar.Set(el.value))], [])]), Doc.Element("div", [Attr.Create("class", "field-group compact")], [Doc.Element("label", [], [Doc.TextNode("Role")]), Doc.Element("select", [Attr.Create("class", "search-select"), Attr.HandlerImpl("change", (el) =>() => roleVar.Set(el.value))], map((_1) => {
          const value=_1[0];
          return Doc.Element("option", ofSeq(delay(() => append([Attr.Create("value", value)], delay(() => value==roleLabel(user.Role)?[Attr.Create("selected", "selected")]:[])))), [Doc.TextNode(_1[1])]);
        }, roleOptions()))])]), Doc.Element("div", [Attr.Create("class", "user-row-actions")], [Doc.Element("span", [Attr.Create("class", roleCss(user.Role))], [Doc.TextNode(roleLabel(user.Role))]), Doc.Element("button", [Attr.Create("class", "primary-button"), Attr.HandlerImpl("click", () =>() => {
          const N=nameVar.Get();
          const B=badgeVar.Get();
          let _1=New(user.Id, N, asUserRole(roleVar.Get()), B);
          return saveUser(_1, "User updated successfully.");
        })], [Doc.TextView(Map((busy) => busy?"Saving...":"Save", saveBusyVar.View))]), Doc.Element("button", [Attr.Create("class", "ghost-button user-delete-button"), Attr.HandlerImpl("click", () =>() => {
          const targetUserId=user.Id;
          const _1=null;
          return StartImmediate(Delay(() => {
            deleteBusyVar.Set(true);
            return Bind(DeleteUser(userIdVar.Get(), targetUserId), (a) => {
              deleteBusyVar.Set(false);
              return a.$==1?(statusVar.Set(a.$0),Zero()):(workspaceVar.Set(a.$0),statusVar.Set("User deleted successfully."),Zero());
            });
          }), null);
        })], [Doc.TextView(Map((busy) => busy?"Deleting...":"Delete", deleteBusyVar.View))])])]);
      }, otherUsers))])))))]);
    }
    else return Doc.Element("div", [Attr.Create("class", "read-only-box")], [Doc.Element("h3", [], [Doc.TextNode("Admin access required")]), Doc.Element("p", [Attr.Create("class", "muted")], [Doc.TextNode("Switch to an administrator account to manage workers and change roles.")])]);
  }, workspaceVar.View)]);
}
export function commandPanel(workspaceVar, userIdVar, selectedItemId, feedbackVar){
  const selectedItemView=viewSelectedItem(workspaceVar.View, selectedItemId.View);
  const actionVar=Var.Create_1("Issue");
  const quantityVar=Var.Create_1("");
  const noteVar=Var.Create_1("");
  const busyVar=Var.Create_1(false);
  return Doc.Element("div", [Attr.Create("class", "panel side-panel"), Attr.Create("id", "operations-panel")], [Doc.Element("div", [Attr.Create("class", "panel-head panel-head-stack")], [Doc.Element("div", [], [Doc.Element("p", [Attr.Create("class", "section-kicker")], [Doc.TextNode("Operations")]), Doc.Element("h2", [], [Doc.TextNode("Stock console")]), Doc.Element("p", [Attr.Create("class", "muted")], [Doc.TextNode("Managers, clerks, and administrators can record stock movement here.")])])]), selectedPanel(selectedItemView), Doc.BindView((workspace) => workspace.Permissions.CanMoveStock?Doc.Element("div", [], [Doc.Element("div", [Attr.Create("class", "field-group")], [Doc.Element("label", [], [Doc.TextNode("Action")]), Doc.Element("select", [Attr.Create("class", "search-select"), Attr.HandlerImpl("change", (el) =>() => actionVar.Set(el.value))], map((_1) => Doc.Element("option", [Attr.Create("value", _1[0])], [Doc.TextNode(_1[1])]), actionOptions()))]), Doc.Element("div", [Attr.Create("class", "field-group")], [Doc.Element("label", [], [Doc.TextNode("Quantity")]), Doc.Element("input", [Attr.Create("class", "search-input"), Attr.Create("placeholder", "e.g. 8"), Attr.HandlerImpl("input", (el) =>() => quantityVar.Set(el.value))], [])]), Doc.Element("div", [Attr.Create("class", "field-group")], [Doc.Element("label", [], [Doc.TextNode("Note")]), Doc.Element("textarea", [Attr.Create("class", "note-box"), Attr.Create("placeholder", "What happened to the stock?"), Attr.HandlerImpl("input", (el) =>() => noteVar.Set(el.value))], [])]), Doc.Element("button", [Attr.Create("class", "primary-button wide-button"), Attr.HandlerImpl("click", () =>() => {
    const _1=null;
    return StartImmediate(Delay(() => {
      const _2=selectedItemId.Get();
      const _3=tryInt(quantityVar.Get());
      return _2==""?(feedbackVar.Set("Select an inventory item first."),Zero()):_3!=null&&_3.$==1?(busyVar.Set(true),Bind(SubmitMovement(userIdVar.Get(), New_1(selectedItemId.Get(), asMovementKind(actionVar.Get()), _3.$0, noteVar.Get())), (a) => {
        busyVar.Set(false);
        return a.$==1?(feedbackVar.Set(a.$0),Zero()):(workspaceVar.Set(a.$0),feedbackVar.Set("Stock movement saved."),quantityVar.Set(""),noteVar.Set(""),Zero());
      })):(feedbackVar.Set("Enter a valid quantity."),Zero());
    }), null);
  })], [Doc.TextView(Map((busy) => busy?"Saving...":"Save movement", busyVar.View))])]):Doc.Element("div", [Attr.Create("class", "read-only-box")], [Doc.Element("h3", [], [Doc.TextNode("Read-only view")]), Doc.Element("p", [Attr.Create("class", "muted")], [Doc.TextNode("This role can monitor inventory but cannot create stock movements.")])]), workspaceVar.View), Doc.Element("p", [Attr.Create("class", "feedback")], [Doc.TextView(feedbackVar.View)])]);
}
export function inventoryBoard(workspaceView, searchVar, categoryVar, selectedItemId){
  const cardsView=Map3((_1, _2, _3) => {
    const searchTerm=Trim(_2).toLowerCase();
    const categoryFilter=asCategoryFilter(_3);
    const items=filter((item) =>(IsNullOrWhiteSpace(searchTerm)||item.Name.toLowerCase().indexOf(searchTerm)!=-1||item.Sku.toLowerCase().indexOf(searchTerm)!=-1||item.Location.toLowerCase().indexOf(searchTerm)!=-1||item.Supplier.toLowerCase().indexOf(searchTerm)!=-1)&&(categoryFilter!=null&&categoryFilter.$==1?Equals(item.Category, categoryFilter.$0):true), _1.Inventory.Items);
    return items.$==0?Doc.Element("div", [Attr.Create("class", "empty-note")], [Doc.TextNode("No items match the current filters.")]):Doc.Element("div", [Attr.Create("class", "inventory-board")], map((i) => inventoryCard(selectedItemId, i), items));
  }, workspaceView, searchVar.View, categoryVar.View);
  return Doc.Element("div", [Attr.Create("class", "panel")], [Doc.Element("div", [Attr.Create("class", "panel-head panel-head-stack")], [Doc.Element("div", [], [Doc.Element("p", [Attr.Create("class", "section-kicker")], [Doc.TextNode("Inventory")]), Doc.Element("h2", [], [Doc.TextNode("Inventory board")]), Doc.Element("p", [Attr.Create("class", "muted")], [Doc.TextNode("Search stock by name, SKU, location, or supplier.")])]), Doc.Element("div", [Attr.Create("class", "toolbar")], [Doc.Element("input", [Attr.Create("class", "search-input"), Attr.Create("placeholder", "Search stock"), Attr.HandlerImpl("input", (el) =>() => searchVar.Set(el.value))], []), Doc.Element("select", [Attr.Create("class", "search-select"), Attr.HandlerImpl("change", (el) =>() => categoryVar.Set(el.value))], map((_1) => Doc.Element("option", [Attr.Create("value", _1[0])], [Doc.TextNode(_1[1])]), categoryOptions()))])]), Doc.EmbedView(cardsView)]);
}
export function dashboard(workspaceView){
  return Doc.Element("div", [Attr.Create("class", "metrics-grid")], [metricCard("metric-primary", "Units on hand", Map((ws) => String(ws.Inventory.Metrics.TotalUnits), workspaceView), Map((ws) => String(ws.Inventory.Metrics.TotalSkus)+" tracked SKUs", workspaceView)), metricCard("metric-warm", "Risk lines", Map((ws) => String(ws.Inventory.Metrics.LowStockCount), workspaceView), Map((ws) => String(ws.Inventory.Metrics.CriticalCount)+" need urgent action", workspaceView)), metricCard("metric-cool", "Outbound this month", Map((ws) => String(ws.Inventory.Metrics.MonthlyOutbound), workspaceView), Map((ws) => String(ws.Inventory.Metrics.OverstockCount)+" overstocked items", workspaceView))]);
}
export function roleBar(workspaceVar, userIdVar, statusVar){
  return Doc.Element("div", [Attr.Create("class", "panel role-panel")], [Doc.Element("div", [Attr.Create("class", "role-grid")], [Doc.Element("div", [], [Doc.Element("p", [Attr.Create("class", "section-kicker")], [Doc.TextNode("Workspace mode")]), Doc.Element("h2", [], [Doc.TextView(Map((ws) => ws.CurrentUser.Name, workspaceVar.View))]), Doc.Element("p", [Attr.Create("class", "muted")], [Doc.TextView(Map((ws) => ws.CurrentUser.Badge, workspaceVar.View))])]), Doc.Element("div", [Attr.Create("class", "role-actions")], [Doc.Element("div", [Attr.Create("class", "field-group compact")], [Doc.Element("label", [], [Doc.TextNode("User role")]), Doc.Element("select", [Attr.Create("class", "search-select"), Attr.HandlerImpl("change", (el) =>() => {
    const userId=el.value;
    const _1=null;
    return StartImmediate(Delay(() => Bind(GetWorkspace(userId), (a) => {
      userIdVar.Set(userId);
      workspaceVar.Set(a);
      statusVar.Set("Switched to "+a.CurrentUser.Name+".");
      return Zero();
    })), null);
  })], [Doc.BindView((ws) => Doc.Concat(map((user) => Doc.Element("option", ofSeq(delay(() => append([Attr.Create("value", user.Id)], delay(() => user.Id==ws.CurrentUser.Id?[Attr.Create("selected", "selected")]:[])))), [Doc.TextNode(user.Name+" - "+roleLabel(user.Role))]), ws.Users)), workspaceVar.View)])]), Doc.Element("div", [Attr.Create("class", "role-pill-wrap")], [Doc.BindView((ws) => rolePill(ws.CurrentUser), workspaceVar.View)])])]), Doc.Element("div", [Attr.Create("class", "permission-row")], [Doc.BindView((ws) => Doc.Concat([permissionChip(ws.Permissions.CanMoveStock, "Stock changes"), permissionChip(ws.Permissions.CanImportCsv, "CSV import"), permissionChip(ws.Permissions.CanExportCsv, "CSV export"), permissionChip(ws.Permissions.CanResetDemo, "Reset demo"), permissionChip(ws.Permissions.CanManageUsers, "User admin")]), workspaceVar.View)])]);
}
export function movementTimeline(workspaceView){
  return Doc.EmbedView(Map((workspace) => workspace.Inventory.RecentMovements.$==0?Doc.Element("div", [Attr.Create("class", "empty-note")], [Doc.TextNode("No movement history yet.")]):Doc.Element("ul", [Attr.Create("class", "movement-list")], map(renderMovement, workspace.Inventory.RecentMovements)), workspaceView));
}
export function alertsPanel(workspaceView, selectedItemId){
  return Doc.EmbedView(Map((workspace) => {
    const alerts=filter((item) => {
      const m=statusFor(item);
      return m.$==0||m.$==1;
    }, workspace.Inventory.Items);
    return alerts.$==0?Doc.Element("div", [Attr.Create("class", "empty-note")], [Doc.TextNode("No low-stock lines are currently flagged.")]):Doc.Concat(map((item) => {
      const status=statusFor(item);
      return Doc.Element("div", [Attr.Create("class", "alert-item")], [Doc.Element("div", [], [Doc.Element("strong", [], [Doc.TextNode(item.Name)]), Doc.Element("p", [Attr.Create("class", "muted")], [Doc.TextNode("Current "+String(item.OnHand)+" "+item.Unit+" / reorder "+String(item.ReorderLevel))])]), Doc.Element("div", [Attr.Create("class", "alert-actions")], [Doc.Element("span", [Attr.Create("class", statusCss(status))], [Doc.TextNode(statusLabel(status))]), Doc.Element("a", [Attr.Create("class", "ghost-button alert-action-button"), Attr.Create("href", "#operations-panel"), Attr.HandlerImpl("click", () =>() => selectedItemId.Set(item.Id))], [Doc.TextNode(statusLabel(status)+" in operations")])])]);
    }, sortBy((item) => item.OnHand, alerts)));
  }, workspaceView));
}
export function selectedPanel(selectedItemView){
  return Doc.EmbedView(Map((selected) => {
    if(selected!=null&&selected.$==1){
      const item=selected.$0;
      const status=statusFor(item);
      return Doc.Element("div", [Attr.Create("class", "selected-card")], [Doc.Element("div", [Attr.Create("class", "selected-topline")], [Doc.Element("div", [], [Doc.Element("h3", [], [Doc.TextNode(item.Name)]), Doc.Element("p", [Attr.Create("class", "muted")], [Doc.TextNode(item.Sku+" in "+item.Location)])]), Doc.Element("span", [Attr.Create("class", statusCss(status))], [Doc.TextNode(statusLabel(status))])]), Doc.Element("div", [Attr.Create("class", "selected-grid")], [Doc.Element("div", [], [Doc.Element("span", [Attr.Create("class", "selected-label")], [Doc.TextNode("On hand")]), Doc.Element("strong", [], [Doc.TextNode(String(item.OnHand)+" "+item.Unit)])]), Doc.Element("div", [], [Doc.Element("span", [Attr.Create("class", "selected-label")], [Doc.TextNode("Status")]), Doc.Element("strong", [], [Doc.TextNode(statusLabel(status))])]), Doc.Element("div", [], [Doc.Element("span", [Attr.Create("class", "selected-label")], [Doc.TextNode("Supplier")]), Doc.Element("strong", [], [Doc.TextNode(item.Supplier)])]), Doc.Element("div", [], [Doc.Element("span", [Attr.Create("class", "selected-label")], [Doc.TextNode("Reorder")]), Doc.Element("strong", [], [Doc.TextNode(String(item.ReorderLevel))])]), Doc.Element("div", [], [Doc.Element("span", [Attr.Create("class", "selected-label")], [Doc.TextNode("Target")]), Doc.Element("strong", [], [Doc.TextNode(String(item.TargetStock))])])])]);
    }
    else return Doc.Element("div", [Attr.Create("class", "selected-placeholder")], [Doc.Element("h3", [], [Doc.TextNode("Choose an item")]), Doc.Element("p", [], [Doc.TextNode("Select a card from the inventory board to prefill the stock movement form.")])]);
  }, selectedItemView));
}
export function viewSelectedItem(workspaceView, selectedItemIdView){
  return Map2((_1, _2) => tryFind((item) => item.Id==_2, _1.Inventory.Items), workspaceView, selectedItemIdView);
}
export function inventoryCard(selectedItemId, item){
  return Doc.Element("div", [Attr.Create("class", "inventory-card")], [Doc.Element("div", [Attr.Create("class", "inventory-card-head")], [Doc.Element("div", [], [Doc.Element("p", [Attr.Create("class", "inventory-sku")], [Doc.TextNode(item.Sku)]), Doc.Element("h3", [], [Doc.TextNode(item.Name)])]), statusPill(item)]), Doc.Element("div", [Attr.Create("class", "inventory-meta")], [Doc.Element("span", [], [Doc.TextNode(categoryLabel(item.Category))]), Doc.Element("span", [], [Doc.TextNode(item.Location)]), Doc.Element("span", [], [Doc.TextNode(item.Supplier)])]), Doc.Element("div", [Attr.Create("class", "inventory-stats")], [Doc.Element("div", [], [Doc.Element("span", [Attr.Create("class", "small-label")], [Doc.TextNode("On hand")]), Doc.Element("strong", [], [Doc.TextNode(String(item.OnHand)+" "+item.Unit)])]), Doc.Element("div", [], [Doc.Element("span", [Attr.Create("class", "small-label")], [Doc.TextNode("Reorder")]), Doc.Element("strong", [], [Doc.TextNode(String(item.ReorderLevel))])]), Doc.Element("div", [], [Doc.Element("span", [Attr.Create("class", "small-label")], [Doc.TextNode("Target")]), Doc.Element("strong", [], [Doc.TextNode(String(item.TargetStock))])])]), Doc.Element("button", [Attr.Create("class", "ghost-button wide-button"), Attr.HandlerImpl("click", () =>() => selectedItemId.Set(item.Id))], [Doc.TextNode("Select item")])]);
}
export function renderMovement(movement){
  const m=movement.Kind;
  let _1=[Attr.Create("class", m.$==0?"movement movement-restock":m.$==2?"movement movement-adjustment":"movement movement-issue")];
  return Doc.Element("li", _1, [Doc.Element("div", [Attr.Create("class", "movement-topline")], [Doc.Element("strong", [], [Doc.TextNode(movement.ItemName)]), Doc.Element("span", [Attr.Create("class", "muted")], [Doc.TextNode(movement.OccurredLabel)])]), Doc.Element("div", [Attr.Create("class", "movement-bottomline")], [Doc.Element("span", [], [Doc.TextNode(kindLabel(movement.Kind)+" "+String(movement.Quantity))]), Doc.Element("span", [Attr.Create("class", "muted")], [Doc.TextNode("by "+movement.ActorName)])]), Doc.Element("p", [Attr.Create("class", "movement-note muted")], [Doc.TextNode(movement.Note)])]);
}
export function rolePill(user){
  return Doc.Element("span", [Attr.Create("class", roleCss(user.Role))], [Doc.TextNode(roleLabel(user.Role))]);
}
export function statusPill(item){
  const status=statusFor(item);
  return Doc.Element("span", [Attr.Create("class", statusCss(status))], [Doc.TextNode(statusLabel(status))]);
}
export function permissionChip(enabledState, labelText){
  return Doc.Element("span", [Attr.Create("class", enabledState?"permission-chip permission-on":"permission-chip permission-off")], [Doc.TextNode(labelText)]);
}
export function metricCard(tone, title, valueView, detailView){
  return Doc.Element("div", [Attr.Create("class", "metric-card "+tone)], [Doc.Element("p", [Attr.Create("class", "metric-label")], [Doc.TextNode(title)]), Doc.Element("h2", [Attr.Create("class", "metric-value")], [Doc.TextView(valueView)]), Doc.Element("p", [Attr.Create("class", "metric-detail")], [Doc.TextView(detailView)])]);
}
export function tryInt(textValue){
  let o;
  const m=(o=0,[TryParse(Trim(textValue), {get:() => o, set:(v) => {
    o=v;
  }}), o]);
  return m[0]?Some(m[1]):null;
}
export function asUserRole(value){
  const m=parseRole(value);
  return m==null?Viewer:m.$0;
}
export function asMovementKind(value){
  return value=="Restock"?Restock:value=="Adjustment"?Adjustment:Issue;
}
export function asCategoryFilter(value){
  return value=="Components"?Some(Components):value=="Office"?Some(Office):value=="Packaging"?Some(Packaging):value=="Safety"?Some(Safety):value=="Electronics"?Some(Electronics):null;
}
export function roleOptions(){
  return $StartupCode_Client.roleOptions;
}
export function actionOptions(){
  return $StartupCode_Client.actionOptions;
}
export function categoryOptions(){
  return $StartupCode_Client.categoryOptions;
}
