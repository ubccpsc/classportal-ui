// You can bring in more properties from ClassPortal-Backend if required.

export interface Deliverable {
  url: string;
  open: number;
  close: number;
  name: string;
  studentsMakeTeams: boolean;
  minTeamSize: number;
  maxTeamSize: number;
  buildingRepos: boolean;
  projectCount: number;
  teamsInSameLab: boolean;
  // dockerImage and dockerBuild being deprecated, as one Contaienr per Course will exist
  dockerImage: string;
  dockerBuild: string;
  customHtml: boolean;
  commit: string;
  solutionsUrl: string;
  whitelistedServers: string;
  solutionsKey: string;
  deliverableKey: string;
  rate: number;
  gradesReleased: boolean;
}

export interface DeliverableContainer {
  response: Deliverable[];
}
