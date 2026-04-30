export function New(Id, ItemId, ItemName, Kind, Quantity, Note, OccurredAt, OccurredLabel, ActorName){
  return{
    Id:Id, 
    ItemId:ItemId, 
    ItemName:ItemName, 
    Kind:Kind, 
    Quantity:Quantity, 
    Note:Note, 
    OccurredAt:OccurredAt, 
    OccurredLabel:OccurredLabel, 
    ActorName:ActorName
  };
}
