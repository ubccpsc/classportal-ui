// based off of ITeamDocument, but with populated properties
// that contain other filled-out models by Mongoose

import {GithubState} from './Github.Interfaces';
import {Deliverable} from './Deliverables.Interfaces';

export interface Team {
  name: string;
  githubState: object;
  TAs: object[];
  members: object[];
  deliverableIds: Deliverable[]; // IDeliverableDocument
  disbanded: boolean;
  githubOrg: string;
}

