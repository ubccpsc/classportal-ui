// Copied from Github.interfaces.ts in ClassPortal-Backend application
// Please keep copies consistent.

export interface GithubRepo {
  url: string;
  id: number;
  name: string;
}

export interface GithubState {
  repo: GithubRepo;
  team: GithubTeam;
}

export interface GithubTeam {
  id: number;
}
