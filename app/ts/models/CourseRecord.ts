import {Course, LabSection, DockerLogs, User} from '../Models';

export default class CourseRecord {
  constructor() {

  }

  private courseId: string;
  private githubOrg: string;
  private dockerRepo: string;
  private dockerKey: string;
  private labSections: LabSection[];
  private urlWebhook: string;
  private admins: string[] | User[];
  private staffList: string[] | User[];
  private classList: string[] | User[];
  private dockerLogs: DockerLogs;
  private buildingContainer: boolean;

  /**
  * @return Course DEFAULT Course object used for AddCourseView;
  */
  public static getDefaultCourse(): Course {

      let that = this;
      let dockerLogs: DockerLogs = {
        buildHistory: '',
        destroyHistory: '',
      }

      let course: Course = {
        courseId: '',
        githubOrg: '',
        dockerRepo: '',
        dockerKey: '',
        labSections: [],
        urlWebhook: 'https://portal.cs.ubc.ca:port/submit',
        admins: [],
        staffList: [],
        classList: [],
        dockerLogs: dockerLogs,
        buildingContainer: false
      };
      return course;
  }

}