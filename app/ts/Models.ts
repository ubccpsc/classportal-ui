/**
 *
 *
 *
 * Student Data Specifications
 *
 *
 *
 **/

/**
 * All of the information ClassPortal knows about a given student.
 */
export interface Student {
    userName: string;           // CWL: Primary Key for object
    userUrl: string;            // full URL to user

    fName: string;
    lName: string;

    sNum: string;
    csId: string;

    labId: string;
    TA: string[];               // TAs who have tagged team. For future. Just return [] for now.
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

export interface DeliverablePayloadContainer {
    response: DeliverablePayload[];
}

export interface DeliverablePayload {
    id: string;
    open: number; // timestamp
    close: number; // timestamp
    // NOTE: things are definitely missing here.
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

// DEPRECATED: will go away On Oct 20
export interface GradePayloadContainer {
    response: GradeRow[];
}

// DEPRECATED: will go away On Oct 20
export interface GradeContainer {
    headers: string[];
    grades: GradeRow[];
}

// DEPRECATED: will go away On Oct 20
export interface GradeRow {
    userName: string; // cwl
    userUrl: string;
    sNum: string; // may be removed in future
    fName: string; // may be removed in future
    lName: string; // may be removed in future
    projectUrl: string; // full URL to project
    projectName: string; // string name for project (e.g., cpsc310_team22)

    timeStamp: number; // Date.getTime()
    commitUrl: string; // full URL to commit corresponding to the row
    delivId: string; // deliverable name
    gradeKey: string; // deliverable name (e.g., d0last)
    gradeValue: string; // score for deliverable key (use string rep for flexibility)
    gradeRequested: boolean; // was the result explicitly requested by the student
    gradeDetails: GradeDetail[];
}

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
 * records[]    will contain _all_ executions within the valid time range for that deliverable.
 */
export interface ResultPayload {
    students: StudentResult[];
    records: ResultRecord[];

    // TODO: remove records
    // TODO: update students to studentresult

    // Maps the projects to the result records
    // Enables quick retrieval of ResultRecord from a StudentRecord
    projectMap: { [projectUrl: string]: ResultRecord[] };
}

export interface StudentResult extends Student {
    projectUrl: string; // the project for a student (deliverableId captured in ResultRecord itself)
}

/**
 * Each ResultRecord corresponds to a single AutoTest execution.
 */
export interface ResultRecord {
    userName: string;           // cwl; key back to Student
    timeStamp: number;          // timestamp of the webhoook push event

    projectName: string;        // string name for project (e.g., cpsc310_team22)
    projectUrl: string;         // full URL to project

    commitUrl: string;          // full URL to commit corresponding to the row
    branchName: string;         // branch name
    gradeRequested: boolean;    // whether the result explicitly requested by the student

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
