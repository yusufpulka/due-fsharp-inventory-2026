export let Overstock:StockStatus;
export let Healthy:StockStatus;
export let Low:StockStatus;
export let Critical:StockStatus;
export interface Critical {
  $:0;
}
export interface Low {
  $:1;
}
export interface Healthy {
  $:2;
}
export interface Overstock {
  $:3;
}
export type StockStatus = (Critical | Low | Healthy | Overstock)
