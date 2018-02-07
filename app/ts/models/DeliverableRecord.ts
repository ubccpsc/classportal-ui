import {Deliverable} from '../Models';

export default class DeliverableRecord {
  constructor() {

  }

  private id: string;
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
  private regressionTest: boolean;
  private regressionTests: string;
  private teamsInSameLab: false;
  private dockerImage: string;
  private dockerBuild: string;
  private customHtml: true;
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
          _id:               '', // Leave blank, but Mongo will make an _id on the back-end by default
          id:                '', // Will not be used on backend. Just keeps models consistent
          url:                '',
          open:               0,
          close:              0,
          name:               '',
          studentsMakeTeams:  false,
          teamsAllowed:       false,
          minTeamSize:        1,
          maxTeamSize:        1,
          regressionTest:     false,
          regressionTests:    '',
          projectCount:       0,
          teamsInSameLab:     true,
          customHtml:         false,
          buildingRepos:      false,
          dockerOverride:     false,
          dockerImage:        '',
          dockerBuild:        '',
          solutionsUrl:       '',
          whitelistedServers: 'portal.cs.ubc.ca:1210 portal.cs.ubc.ca:1310',
          solutionsKey:       '',
          deliverableKey:     '',
          rate:               90000,
          gradesReleased:     false,
          custom:             {},
      };
      return defaultDeliv;
  }

}