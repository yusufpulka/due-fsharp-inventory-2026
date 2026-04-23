import { New } from "./InventoryAlpha.UserPermissions.js"
import { New as New_1 } from "./InventoryAlpha.InventorySnapshot.js"
import FSharpList from "../WebSharper.StdLib/Microsoft.FSharp.Collections.FSharpList`1.js"
import { New as New_2 } from "./InventoryAlpha.DashboardMetrics.js"
import { New as New_3 } from "./InventoryAlpha.AppUser.js"
import { Viewer } from "./InventoryAlpha.UserRole.js"
import { New as New_4 } from "./InventoryAlpha.WorkspaceState.js"
import { fallbackUser, emptyPermissions, emptySnapshot } from "./InventoryAlpha.Domain.js"
import { ofArray } from "../WebSharper.StdLib/Microsoft.FSharp.Collections.ListModule.js"
import { Lazy } from "../WebSharper.Core.JavaScript/Runtime.js"
let _c=Lazy((_i) => class $StartupCode_Domain {
  static {
    _c=_i(this);
  }
  static csvHeader;
  static emptyWorkspace;
  static fallbackUser;
  static emptySnapshot;
  static emptyPermissions;
  static {
    this.emptyPermissions=New(false, false, false, false, false);
    this.emptySnapshot=New_1(FSharpList.Empty, FSharpList.Empty, New_2(0, 0, 0, 0, 0, 0));
    this.fallbackUser=New_3("viewer", "Guest Viewer", Viewer, "Observing");
    this.emptyWorkspace=New_4(fallbackUser(), ofArray([fallbackUser()]), emptyPermissions(), emptySnapshot(), "");
    this.csvHeader="Sku,Name,Category,Unit,OnHand,ReorderLevel,TargetStock,Supplier,Location";
  }
});
export default _c;
