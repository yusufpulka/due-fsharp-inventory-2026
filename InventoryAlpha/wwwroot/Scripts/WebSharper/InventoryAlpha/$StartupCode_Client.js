import { ofArray } from "../WebSharper.StdLib/Microsoft.FSharp.Collections.ListModule.js"
import { Lazy } from "../WebSharper.Core.JavaScript/Runtime.js"
let _c=Lazy((_i) => class $StartupCode_Client {
  static {
    _c=_i(this);
  }
  static roleOptions;
  static actionOptions;
  static categoryOptions;
  static {
    this.categoryOptions=ofArray([["", "All categories"], ["Components", "Components"], ["Office", "Office"], ["Packaging", "Packaging"], ["Safety", "Safety"], ["Electronics", "Electronics"]]);
    this.actionOptions=ofArray([["Issue", "Issue"], ["Restock", "Restock"], ["Adjustment", "Adjustment"]]);
    this.roleOptions=ofArray([["Administrator", "Administrator"], ["Manager", "Manager"], ["Clerk", "Clerk"], ["Viewer", "Viewer"]]);
  }
});
export default _c;
