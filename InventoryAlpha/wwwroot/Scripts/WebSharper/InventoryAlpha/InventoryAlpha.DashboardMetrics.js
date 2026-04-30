export function New(TotalUnits, TotalSkus, LowStockCount, CriticalCount, MonthlyOutbound, OverstockCount){
  return{
    TotalUnits:TotalUnits, 
    TotalSkus:TotalSkus, 
    LowStockCount:LowStockCount, 
    CriticalCount:CriticalCount, 
    MonthlyOutbound:MonthlyOutbound, 
    OverstockCount:OverstockCount
  };
}
