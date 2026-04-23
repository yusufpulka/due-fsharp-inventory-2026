export let Electronics:Category;
export let Safety:Category;
export let Packaging:Category;
export let Office:Category;
export let Components:Category;
export interface Components {
  $:0;
}
export interface Office {
  $:1;
}
export interface Packaging {
  $:2;
}
export interface Safety {
  $:3;
}
export interface Electronics {
  $:4;
}
export type Category = (Components | Office | Packaging | Safety | Electronics)
