# AutoTest, ClassPortal, and Grades

AutoTest and ClassPortal have been designed to let course staff assign grades as flexibly as possible. To enable this flexibility though, this does require a small amount of work to determine how they want to translate the AutoTest results into grades.

The core difficulty is that AutoTest is just a test runner. This means that for any given course deliverable each student and/or team will have many AutoTest records associated with them that needs to be distilled into a single final deliverable mark. Each course has complete flexibility for defining how a series of AutoTest records are translated into a single grade.

To get an idea of why this is important, the fall 2017 instance of CPSC 310 ran 14,659 AutoTest executions for 322 students during d1. Since the students were working in pairs, these executions needed to be reduced to the 161 test executions that corresponded to real student grades (aka 99% of executions needed to be processed and ignored according to the course rubric). This document describes the process and data structures that enable staff to do this with complete flexibility.

## Process

The high-level process for this task looks like this:

1. AutoTest executes the student deliverables as they are received. Each of these executions generates a `ResultRecord`.

1. Course staff visit the _Test Results_ tab in ClassPortal, selects a single deliverable, and downloads a JSON file containing the complete AutoTest data for that deliverable (`ResultPayload`).

1. Course staff iterate over the test execution results (`ResultRecord`) and apply their own course-specific rubric to determine a grade for the deliverable for each student (`Student`). This can then be uploaded to UBC connect for further editing and sharing with the students. Starting January 2018 these will also be visible in ClassPortal for both displaying to students and editing by course staff.


## Transformation

The transformation process should be relatively straightforward. Our sample implementation of this can be found in [ResultView::convertResultsToGrades](https://github.com/ubccpsc/classportal-ui-next/blob/master/app/ts/viewAdmin/ResultView.ts). While it could be handled in one large loop, we find it easiest to split it into five steps:

1. Create a map from `userName` to `Student` objects (`studentMap`) by iterating through `ResultPayload.students`. 

1. Loop through `ResultPayload.records` to determine which project each student was associated with. This isn't strictly needed for individual projects, but is required for teams. For single projects though it still works fine because they work on a project too so there is no harm in including this step. This creates a `projectMap` that maps `ResultRecord.projectUrl` to a student (e.g.,  by their `userName` or some other internal data structure).

1. Loop through the `ResultPayload.records` to associate the executions with the students. For each `ResultRecord` we can use `ResultRecord.projectUrl` to index into `projectMap` and add the execution to all students on the team.

1. The key part of this process involves iterating through the students in the course and for each student, examining all of the executions their team has made to determine which one corresponds to their final grade. Usually we sort by `ResultRecord.timeStamp` before we proceed. Useful fields in this process include `timeStamp` (e.g., for finding the last execution), `grade` (e.g., for finding the max grade), `branchName` (e.g., for figuring out if the commit was on master or not), and `gradeRequested` (e.g., for determining if the grade was explicitly requested by the student). 

1. Once this process is complete, the data should be exported in a CSV. This can be any format UBC Connect uses; further detail about the CSV needed to upload the grades back to ClassPortal will be included here once they are known.

#### Things to watch out for:


* Some `Student` objects in `ResultPayload.students` will not correspond to real students (aka there will be course staff, test accounts, and TAs). You probably want to ignore these. One easy way to do this is to note that only real students will have a valid value for `Student.sNum`.

* When the AutoTest container fails to exit successfully (e.g., returning a `finalGrade`, even if it is 0, the `ResultRecord`s might be corrupted. While we are going to fix this in future, right now the best way to deal with these is to check for `ResultRecord.projectUrl === ''` and drop those records.

* Some students will exist in `Student` but will _never_ make an execution that runs to completion and returns a grade. While you might want to give them 0, if they are working on course project they might technically deserve their team grade. The problem though is because of the point above: we can't associate a student with a project with a student without at least one execution. We are working on fixing this, but it is a rare edge case we need to be aware of for now. (Really the bar is not high here: a student just needs to run AutoTest once successfully. In 310d1 this only came up once across 14,000+ executions).

## Data Types

The current data types are shown here. These should be the same as those found in [Models.ts](https://github.com/ubccpsc/classportal-ui-next/blob/master/app/ts/Models.ts). If they are not, please file an issue.

All fields should always be present for all objects. But if a field is not available on the backend it will be filled with a default value. These are:

* for `string`: `''`
* for `boolean`: `false`
* for any array: `[]`
* for any number: `-1`

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

* ***Why does this have to be per-deliverable?*** This unfortunate limitation revolves around teams since some courses allow different teams per deliverable (and indeed individual projects are usually on independent projects). This is a limitation we may change in the future, but for now this ensures maximum flexibility. Usually grades are released as the deliverables are completed as well, so this will be less work after this term is completed. NOTE: once ClassPortal is able to render these grades they will be shown one row-per-student so this limitation will go away (not in the execution to grades mapping process, but at least during grade viewing and editing).

* ***Why can't ClassPortal just do this automatically?*** Even with just considering `branchName` as a boolean (master or not), `gradeRequested`, and the notion of lastGrade vs maxGrade there are 8 combinations of grade exporter that are needed. To enable maximum flexibility, and to support manual overriding of grades (e.g., by manipulating the CSV directly), the TestRecord --> Grade translation process has been left to the course staff to handle. In future we may add the simplest version of this (e.g., last execution on a project regardless of other features) for courses that want to take a 'no exceptions' approach to translating grades.



