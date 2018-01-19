// based off of ITeamDocument, but with populated properties
// that contain other filled-out models by Mongoose

import {GithubState} from './Github.Interfaces';
import {Deliverable} from './Deliverables.Interfaces';
import {Student} from './Student.Interfaces';

export interface Team {
  name: string;
  githubState: object;
  TAs: object[];
  members: Student[];
  deliverableIds: Deliverable[]; // IDeliverableDocument
  disbanded: boolean;
  githubOrg: string;
}

export interface TeamContainer {
  response: Team[];
}