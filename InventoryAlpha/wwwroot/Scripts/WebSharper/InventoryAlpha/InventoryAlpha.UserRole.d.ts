export let Viewer:UserRole;
export let Clerk:UserRole;
export let Manager:UserRole;
export let Administrator:UserRole;
export interface Administrator {
  $:0;
}
export interface Manager {
  $:1;
}
export interface Clerk {
  $:2;
}
export interface Viewer {
  $:3;
}
export type UserRole = (Administrator | Manager | Clerk | Viewer)
