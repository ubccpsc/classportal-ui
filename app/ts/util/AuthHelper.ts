/**
 * Created by rtholmes on 2017-10-04.
 */

import 'whatwg-fetch';
import {IsAuthenticatedResponse} from '../Models';
import {Network} from './Network';

export class AuthHelper {

  private backendURL: string;
  private OPTIONS_HTTP_GET: object = {credentials: 'include'};


  constructor(backendURL: string) {
    this.backendURL = backendURL;
  }

  /**
  * @param userrole that the current user should match
  **/
  public checkUserrole(userrole: string) {
    console.log('AuthHelper::checkUserRole() - start');
    this.getCurrentUser()
      .then((data: any) => {
        if (data.response.user.userrole === userrole) {
          console.log('AuthHelper::checkUserrole() Valid userrole confirmed: ' + userrole + '.');
        } else {
          this.updateAuthStatus();
        }
      })
      .catch((err: any) => {
        console.log('AuthHelper::checkUserrole() - end');
      });
  }

  public updateAuthStatus() {
    this.isLoggedIn().then((data: IsAuthenticatedResponse) => {
      console.log(data.response);
      console.log('Network::updateAuthStatus( ) - start');
      let authStatus = localStorage.getItem('authStatus');
      const UNAUTHENTICATED_STATUS = 'unauthenticated';
      if (data.response === false && authStatus !== UNAUTHENTICATED_STATUS) {
          console.log('Network::updateAuthStatus( unauthenticated )');
          localStorage.setItem('authStatus', UNAUTHENTICATED_STATUS);
          location.reload();
      }
      console.log('Network::updateAuthStatus( ) - end');
    })
    .catch((err: Error) => {
      this.removeAuthStatus();
      console.log('Network::updateAuthStatus( ERROR ) - Logged out - Unauthenticated');
    });
  }

  private getCurrentUser(): Promise<object> {
    let that = this;
    let url = that.backendURL + 'currentUser';
    console.log('AuthHelper::getCurrentUser( ' + url + ' ) - start');

    return fetch(url, that.OPTIONS_HTTP_GET).then((data: any) => {
      if (data.status !== 200) {
        throw new Error('AuthHelper::getCurrentUser( ' + url + ' ) - start');
      } else {
        return data.json();
      }
    })
    .catch((err: Error) => {
      console.error('AuthHelper::getCurrentUser( ' + url + ') - ERROR ' + err, err);
    });
  }

  private removeAuthStatus() {
    localStorage.removeItem('authStatus');
  }

  private isLoggedIn(): Promise<object> {
    let that = this;
    let url = that.backendURL + 'isAuthenticated';
    console.log('AuthHelper::isLoggedIn( ' + url + ' ) - start');
    const AUTHORIZED_STATUS: string = 'authorized';
    let authStatus = String(localStorage.getItem('authStatus'));

    return fetch(url, that.OPTIONS_HTTP_GET).then((data: any) => {
        if (data.status !== 200) {
            throw new Error('AuthHelper::isLoggedIn( ' + that.backendURL + ' ) - start');
        } else {
            return data.json();
        }
    }).catch((err: Error) => {
        console.error('AuthHelper::handleRemote( ' + that.backendURL + ' ) - ERROR ' + err, err);
        // onError(err.message);
    });
  }
}