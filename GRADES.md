# AutoTest, ClassPortal, and Grades

AutoTest and ClassPortal have been designed to let course staff assign grades as flexibly as possible. To enable this flexibility though, this does require a small amount of work to determine how they want to translate the AutoTest results into grades.

The core difficulty is that AutoTest is just a test runner. This means that for any given course deliverable each student and/or team will have many AutoTest records associated with them that needs to be distilled into a single final deliverable mark. Each course has complete flexibility for defining how a series of AutoTest records are translated into a single grade.

## Process

The high-level process for this task looks like this:

1. AutoTest executes the student deliverables as they are received. Each of these executions generates `ResultRecord`.

1. Course staff visit the _Test Results_ tab in ClassPortal, selects a single deliverable, and downloads a JSON file containing the complete AutoTest data for that deliverable (`ResultPayload`).

1. Course staff iterate over the test execution data structure and apply their own course-specific rubric to determine a grade for the deliverable for each student. This can then be uploaded to UBC connect for further editing and sharing with the students. Starting January 2018 these will also be visible in ClassPortal for both displaying to students and editing by course staff.


## Transformation

The transformation process should be relatively straightforward. While it could be handled in one large loop, we find it easiest to split it into five steps:

1. Create a map from `userName` to `Student` objects (`studentMap`) by iterating through `ResultPayload.students`. One thing to note here is that course staff & TAs may have records here that you wish to ignore. One easy way to do this is to note that only students will have a valid value for `Student.sNum`.

1. Loop through `ResultPayload.records` to determine which project each student was associated with. This isn't strictly needed for individual projects, but is required for teams. For single projects though it still works fine because they work on a project too so there is no harm in including this step. This creates a `projectMap` that maps `ResultRecord.projectUrl` to a student (e.g.,  by their `userName` or some other internal data structure).

1. Loop through the `ResultPayload.records` to associate the executions with the students. For each `ResultRecord` we can use `ResultRecord.projectUrl` to index into `projectMap` and add the execution to all students on the team.

1. The key part of this process involves iterating through the students in the course and for each student, examining all of the executions their team has made to determine which one corresponds to their final grade. Usually we sort by `ResultRecord.timeStamp` before we proceed. Useful fields in this process include `timeStamp` (e.g., for finding the last execution), `grade` (e.g., for finding the max grade), `branchName` (e.g., for figuring out if the commit was on master or not), and `gradeRequested` (e.g., for determining if the grade was explicitly requested by the student). 

1. Once this process is complete, the data should be exported in a CSV. This can be any format UBC Connect uses; further detail about the CSV needed to upload the grades back to ClassPortal will be included here once they are known.

## Data Types

The current data types are shown here. These should be the same as those found in [Models.ts](https://github.com/ubccpsc/classportal-ui-next/blob/master/app/ts/Models.ts). If they are not, please file an issue.

### `ResultPayload`

Simple aggregation type. No surprises here.

```typescript
/**
 * Aggregates all students and records for a single deliverable.
 *
 * students[]   will contain _all_ students in the course, whether they invoked AutoTest or not.
 * records[]    will contain _all_ executions within the valid time range for that deliverable.
 */
export interface ResultPayload {
    students: Student[];
    records: ResultRecord[];
}
```

### `Student`

This is likely more information than is needed for grade transformation, but all records are returned to enable courses to reason about the results as flexibly as possible.

```typescript
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
```

### `ResultRecord`

All required fields for reasoning about an AutoTest execution should be found in this record. If you expect / need different information, please file an issue.

```typescript
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
```

### `ResultDetail`

In December 2018 this data structure will be made available for course staff to populate from their AutoTest executions. This provides a simple means for additional information about an execution to be exposed to the grading rubric.

```typescript
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
```

## FAQ

* ***Why does this have to happen per-deliverable?*** This unfortunate limitation revolves around teams since some courses allow different teams per deliverable (and indeed individual projects are usually on independent projects). This is a limitation we may change in the future, but for now this ensures maximum flexibility. Usually grades are released as the deliverables are completed as well, so this will be less work after this term is completed.

* ***Why can't ClassPortal just do this automatically?*** Even with just considering `branchName` as a boolean (master or not), `gradeRequested`, and the notion of lastGrade vs maxGrade there are 8 combinations of grade exporter that are needed. To enable maximum flexibility, and to support manual overriding of grades (e.g., by manipulating the CSV directly), the TestRecord --> Grade translation process has been left to the course staff to handle. In future we may add the simplest version of this (e.g., last execution on a project regardless of other features) for courses that want to take a 'no exceptions' approach to translating grades.



