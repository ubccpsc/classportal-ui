export interface Deliverable {
  id: string;
  url: string;
  open: number;
  teamsAllowed: boolean;
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

export interface DeliverablePayloadContainer {
    response: Deliverable[];
}

export interface DeliverablePayload {
  response: Deliverable[];
}

export default class DeliverableModel {
  constructor() {

  }

  private _id: string;
  private url: string;
  private open: number;
  private close: number;
  private name: string;
  private studentsMakeTeams: boolean;
  private getMinTeamSize: number;
  private minTeamSize: boolean;
  private maxTeamSize: number;
  private buildingRepos: boolean;
  private projectCount: number;
  private teamsInSameLab: false;
  private dockerImage: string;
  private dockerBuild: string;
  private customHtml: true;
  private commit: string;
  private solutionsUrl: string;
  private whitelistedServers: string;
  private solutionsKey: string;
  private deliverableKey: string;
  private rate: number;
  private gradesReleased: boolean;

  public static getDefaultDeliv(): Deliverable {

      // ## DEFAULT New Deliverable options ##

      let that = this;
      let defaultDeliv: Deliverable = {
          id:                'WILL NOT BE USED ON BACK-END',
          url:                '',
          open:               0,
          close:              0,
          name:               '',
          studentsMakeTeams:  false,
          teamsAllowed:       false,
          minTeamSize:        1,
          maxTeamSize:        3,
          projectCount:       0,
          teamsInSameLab:     true,
          customHtml:         false,
          buildingRepos:      false,
          dockerImage:        '',
          commit:             '',
          dockerBuild:        '',
          solutionsUrl:       '',
          whitelistedServers: 'portal.cs.ubc.ca:1210 portal.cs.ubc.ca:1310',
          solutionsKey:       '',
          deliverableKey:     '',
          rate:               90000,
          gradesReleased:     false
      };
      return defaultDeliv;
  }

}