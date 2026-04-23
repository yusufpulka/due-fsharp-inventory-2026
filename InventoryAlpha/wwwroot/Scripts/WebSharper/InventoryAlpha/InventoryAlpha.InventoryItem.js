export function New(Id, Sku, Name, Category, Unit, OnHand, ReorderLevel, TargetStock, Supplier, Location, LastUpdated){
  return{
    Id:Id, 
    Sku:Sku, 
    Name:Name, 
    Category:Category, 
    Unit:Unit, 
    OnHand:OnHand, 
    ReorderLevel:ReorderLevel, 
    TargetStock:TargetStock, 
    Supplier:Supplier, 
    Location:Location, 
    LastUpdated:LastUpdated
  };
}
