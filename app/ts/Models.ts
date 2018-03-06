export enum GRADES_HEADERS_ENUM {CSID = "CSID", SNUM = "SNUM", GRADE = "GRADE"};
export enum CLASS_LIST_HEADERS_ENUM {FIRST = "FIRST", LAST = "LAST", SNUM = "SNUM", CWL = "CWL", CSID = "CSID"};

export interface StudentWithLab {
  fname: string;
  lname: string;
  snum: string;
  csid: string;
  labSection: string;
}

export interface GradeContainer {
  response: Grade[];
}

export interface Grade {
  course: string;
  deliverable: string;
  csid: string;
  snum: string;
  grade: number;
  comments: string;
}

export interface StudentWithLabContainer {
  response: StudentWithLab[];
}

export interface LabSection {
  labId: string;
  users: Student[];
}

/**
* Maps to the /:courseId/admin/teamGeneration ClassPortal-Backend Endpoint
*/ 
export interface TeamGenerationPayload {
  maxTeamSize: number; 
  teamsInSameLab: boolean;
  deliverableName: string;  // ie. 'd1', 'p1'.
}

/**
 * All of the information ClassPortal knows about a given student.
 */
export interface Student {
    sId?: string;               // new primary key for object. Cannot be changed. Same as sNum at UBC.
                                // Use this instead of userName as a key into Student.

    // TODO: role: 'admin' | 'ta' | 'student' | 'test' ?

    // TODO: what if a student is in multiple courses? should there be an orgName here too? (and the key be like sid_orgName)?

    // all other fields are changeable (although not likely for fName, lName)
    fName: string;
    lName: string;

    sNum: string;
    csId: string;
    labId: string;

    userName: string;           // GitHub (or enterprise GitHub) username. NOTE: could change, stop using as key in other objects
    userUrl: string;            // URL to this GitHub username.

    TA: string[];               // TAs who have tagged team. For future. Just return [] for now.
}


// RepoRepairPayload is for Endpoint /:courseId/admin/github/repo/team/repair
// If there are any errors encountered during the Repo creation process, we can re-run adding team members, etc., to fix the issues.
export interface RepoRepairPayload {
  deliverableName: string;
  githubOrg: string;
}

// RepoTeamUnlink is for Endpoint /:courseId/admin/github/repo/team/unlink
// Removes Github URL reference, which allows us to re-do Repo Provisions (after Github repos are deleted)
export interface RepoTeamUnlinkPayload {
  deliverableName: string;
}

export interface RepoTeamUnlinkResponseContainer {
  response: MongoUpdateManyResponse;
}

export interface RepoProvisionResponse {
  response: string; // 'successfully created, etc.'
}

export interface RepoProvisionPayload {
  deliverableName: string;
}

export interface TeamGenerationResponseContainer {
    response: TeamGenerationResponse;
}

export interface TeamGenerationResponse {
    result: MongoInsertResponse;
    ops: Team;
}

export interface MongoInsertResponse {
    ok: number; // 1 if successfully inserted
    n: number; // number of items inserted into database
}

export interface MongoUpdateManyResponse {
    ok: number; // 1 if successfully inserted
    n: number; // number of items inserted into database
    nModified: number // number of documents updated in the database
}

/**
 *
 *
 *
 * Deliverable Data Specifications
 *
 *
 *
 **/

 // based off of ITeamDocument, but with populated properties
// that contain other filled-out models by Mongoose

export interface Team {
  name: string;
  githubState: GithubState;
  TAs: object[];
  members: Student[];
  deliverableIds: Deliverable[]; // IDeliverableDocument
  disbanded: boolean;
  githubOrg: string;
}

export interface TeamContainer {
  response: Team[];
}

export interface Student {
  username: string;
  fname: string;
  lname: string;
}

export interface IsAuthenticatedResponse {
    response: boolean;
}

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
  dockerOverride: boolean;
  dockerImage: string;
  dockerBuild: string;
  whitelistedServers: string;
  solutionsUrl: string;
  solutionsKey: string;
  deliverableKey: string;
  customHtml: boolean;
  rate: number;
  gradesReleased: boolean;
  custom: object;
}

export interface DeliverableContainer {
  response: Deliverable[];
}


export interface DeliverablePayload {
    response: Deliverable[];
}

export interface Deliverable {
    _id: string;
    id: string;
    open: number; // timestamp
    close: number; // timestamp
    name: string;
    teamsInSameLab: boolean;
    teamsAllowed: boolean;
    maxTeamSize: number;
    minTeamSize: number;
    // NOTE: things are definitely missing here.
    url: string;
    studentsMakeTeams: boolean;
    buildingRepos: boolean;
    projectCount: number;
    // dockerImage and dockerBuild being deprecated, as one Contaienr per Course will exist
    dockerImage: string;
    dockerBuild: string;
    customHtml: boolean;
    solutionsUrl: string;
    whitelistedServers: string;
    solutionsKey: string;
    regressionTest: boolean;
    regressionTests: string;
    deliverableKey: string;
    rate: number;
    gradesReleased: boolean;
}

// TODO: lots of fields missing here


export interface RawTeamPayloadContainer {
    response: RawTeamPayload[];
}

export interface RawTeamPayload {
    _id: string;
    courseId: object;
    deliverableId?: object;
    members: object[];
    disbanded: boolean;
    githubState: object;
    name: string;
    TAs: object[];
    deliverableIds?: object[];
}

export interface ProvisionHealthCheckContainer {
    response: ProvisionHealthCheck;
}

export interface ProvisionHealthCheck {
    classSize: number;
    teamsAllowed: boolean;
    numOfTeams: number;
    numOfTeamsWithRepo: object[];
    numOfTeamsWithoutRepo: object[];
    studentTeamStatus: StudentTeamStatusContainer;
    buildStats: object;
    studentsMakeTeams: boolean;
    teams: Team[];
}

export interface StudentTeamStatusContainer {
    studentsWithTeam: object[];
    studentsWithoutTeam: object[];
}

export interface Student {
    _id: string;
    csid: string;
    snum: string;
    lname: string;
    fname: string;
    courses: string[];
    profileUrl: string;
    userrole: string;
    username: string;
}

export interface Team {
    _id: string;
    courseId: string;
    name: string;
    githubState: GithubState;
    TAs: object[];
    members: Student[];
    deliverableIds: Deliverable[];
    disbanded: boolean;
    githubOrg: string;
}

export interface GithubState {
    team: GithubTeam;
    repo: GithubRepo;
    creationRecord: CreationRecord;
}

export interface CreationRecord {
  error: string;
}

export interface GithubTeam {
    id: number;
    // we can potentially put more info here if needed
    // but needs implementation on the back-end as well
}

export interface GithubRepo {
    webhookUrl: string;
    webhookId: number;
    name: string;
    id: number;
    url: string;
}

/**
 *
 *
 *
 * Result Data Specifications
 *
 *
 *
 **/

/**
 * Datastructure for AutoTest test executions.
 *
 * Used in the admin/ResultsView and to export data to course admins for processing
 * into Grades.
 */
export interface ResultPayloadContainer {
    response: ResultPayload;
}

/**
 * Aggregates all students and records for a single deliverable.
 *
 * students[]   will contain _all_ students in the course, whether they invoked AutoTest or not.
 * records[]    will contain _all_ executions for that deliverable.
 */
export interface ResultPayload {
    students: StudentResult[];
    projectMap: { [projectUrl: string]: ResultRecord[] };
}

export interface StudentResult extends Student {
    projectUrl: string; // the project for a student (deliverableId captured in ResultRecord itself)
}

/**
 * Each ResultRecord corresponds to a single AutoTest execution.
 */
export interface ResultRecord {
    sId?: string;               // USE THIS ID to link back to student (in case they update their userName)

    userName: string;           // GitHub account associated with the change
    timeStamp: number;          // timestamp of the webhoook push event

    projectName: string;        // string name for project (e.g., cpsc310_team22)
    projectUrl: string;         // full URL to project

    commitUrl: string;          // full URL to commit corresponding to the row
    branchName: string;         // branch name
    gradeRequested: boolean;    // whether the result explicitly requested by the student
    gradeRequestedTimeStamp?: number;    // ts of the request

    delivId: string;            // deliverable name
    grade: string;              // final grade assigned by AutoTest for the execution
    gradeDetails: ResultDetail[];
}

/**
 * This is for extra detail about an execution result.
 *
 * AutoTest containers will be able to add this detail to the execution result so
 * it can be available during conversion into Grade records.
 *
 * value is a string, just to keep things simple (aka to avoid huge objects being
 * appended, and to allow for both '98' and 'A+' as needed.
 *
 * For example:
 *
 * {key: 'testScore', value: '92'}
 * {key: 'branchCoverage', value: '65'}
 * {key: 'totalTime', value: '10993'}
 *
 */
export interface ResultDetail {
    key: string;
    value: string;
}

/**
 *
 *
 *
 * Grade Data Specifications
 *
 *
 *
 **/


/**
 * Required columns for CSV upload; the first row must contain thes labels with this case.
 * If any of these are missing, the upload will be rejected.
 * If the CSV contains more than one delivId, the upload will be rejected.
 *
 * Uploads will always overwrite all previous records for each student for that deliverable.
 *
 * You can add _any_ other columns you want. Only columns with headers will be considered.
 * The column header _must_ not collide with any existing column (from any deliverable);
 * this will _not_ be validated by the system.
 *
 * The grade and any additional columns you add will be visible to students when they view
 * their grade details.
 *
 * Empty cells will be treated as ''.
 *
 * userName
 * sNum
 * labId
 * projectName
 * delivId
 * grade
 *
 */

/**
 * Proposed grade record for our backend tracking & supporting editing.
 */
export interface GradeRecord {
    student: Student;
    grades: GradeDeliverable[];
}

/**
 * Details about a graded deliverable.
 */
export interface GradeDeliverable {
    delivId: string;            // Primary key
    projectName: string;        // To track teams / individuals
    projectUrl: string;
    grade: string;              // will be called the 'final' grade (e.g., rendered as d0_final)
    gradeDetails: GradeDetail[] // additional graded details
}

/**
 * This is for extra detail about grades.
 *
 * This will not be used this term, but future containers can emit things like:
 *
 * {key: 'testScore', value: 92}
 * {key: 'branchCoverage', value: 65}
 *
 * And those can be forwarded back with the TestRecord.
 *
 *
 */
export interface GradeDetail {
    key: string;
    value: string;
}

/**
 *
 *
 *
 * Project / Team Specifications
 *
 *
 *
 **/

// TODO: I'm assuming we need something here, but what?

/**
 *
 *
 *
 * Course Data Specifications
 *
 *
 *
 **/

// TODO: Need to define these too