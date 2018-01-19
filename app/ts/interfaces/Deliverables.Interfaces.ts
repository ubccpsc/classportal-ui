// You can bring in more properties from ClassPortal-Backend if required.

export interface Deliverable {
  url: string;
  open: number;
  close: number;
  name: string;
  studentsMakeTeams: boolean;
  gradesReleased: boolean;
}

export interface DeliverableContainer {
  response: Deliverable[];
}