export function New(CanMoveStock, CanImportCsv, CanExportCsv, CanResetDemo, CanManageUsers){
  return{
    CanMoveStock:CanMoveStock, 
    CanImportCsv:CanImportCsv, 
    CanExportCsv:CanExportCsv, 
    CanResetDemo:CanResetDemo, 
    CanManageUsers:CanManageUsers
  };
}
