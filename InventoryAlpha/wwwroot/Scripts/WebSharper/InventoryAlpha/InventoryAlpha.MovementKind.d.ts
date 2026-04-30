export let Adjustment:MovementKind;
export let Issue:MovementKind;
export let Restock:MovementKind;
export interface Restock {
  $:0;
}
export interface Issue {
  $:1;
}
export interface Adjustment {
  $:2;
}
export type MovementKind = (Restock | Issue | Adjustment)
