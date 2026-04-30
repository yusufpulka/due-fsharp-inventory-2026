export function New(CanMoveStock, CanImportCsv, CanExportCsv, CanResetDemo, CanManageUsers)
export default interface UserPermissions {
  CanMoveStock:boolean;
  CanImportCsv:boolean;
  CanExportCsv:boolean;
  CanResetDemo:boolean;
  CanManageUsers:boolean;
}
