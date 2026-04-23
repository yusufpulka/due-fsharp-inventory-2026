export function New(CurrentUser, Users, Permissions, Inventory, CsvTemplate){
  return{
    CurrentUser:CurrentUser, 
    Users:Users, 
    Permissions:Permissions, 
    Inventory:Inventory, 
    CsvTemplate:CsvTemplate
  };
}
