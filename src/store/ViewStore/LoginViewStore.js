import { observable, action } from "mobx";
import { AsyncStorage } from 'react-native';

class LoginStore {
  @observable userId = "";
  @observable password = "";
  @observable isValid = false;
  @observable userIdError = "";
  @observable passwordError = "";

  @observable userToken = {
    userId: "",
    password: "",
    pushToken: "",
    deviceId: "",
  };


  @action
  userIdOnChange(id) {
    this.userId = id;
    this.validateUserId();
  }

  @action
  validateUserId() {
    // const alphaNumeric = /[^a-zA-Z0-9 ]/i;
    // const required = this.userId ? undefined : "Required";
    // this.userIdError = required
    //   ? required
    //   : alphaNumeric.test(this.userId) ? undefined : "Invalid user ID";

    if(this.userId) {
      //
    } else {
      this.userIdError = "Must need user ID";
      return;
    }

    const required = this.userId ? undefined : "Required";

    // const alphaNumeric = /[^a-zA-Z0-9 ]/i.test(this.userId)
    //   ? "Only alphanumeric characters"
    //   : undefined;
    // const maxLength =
    //   this.userId.length > 15 ? "Must be 15 characters or less" : undefined;
    // const minLength =
    //   this.userId.length < 4 ? "Must be 4 characters or more" : undefined;

    // this.userIdError = required
    //   ? required
    //     : alphaNumeric ? alphaNumeric : maxLength ? maxLength : minLength;

    this.userIdError = required;

  }

  @action
  passwordOnChange(pwd) {
    this.password = pwd;
    this.validatePassword();
  }

  @action
  validatePassword() {

    if(this.password) {
      //
    } else {
      this.passwordError = "Must need password";
      return;
    }

    // const alphaNumeric = /[^a-zA-Z0-9 ]/i.test(this.password)
    //   ? "Only alphanumeric characters"
    //   : undefined;
    // const maxLength =
    //   this.password.length > 15 ? "Must be 15 characters or less" : undefined;
    // const minLength =
    //   this.password.length < 8 ? "Must be 8 characters or more" : undefined;

    const required = this.password ? undefined : "Required";

    // this.passwordError = required
    //   ? required
    //   //: alphaNumeric ? alphaNumeric : maxLength ? maxLength : minLength;
    //   : minLength;

    this.passwordError = required;
  }

  @action
  validateForm() {
    if (this.userIdError === undefined && this.passwordError === undefined) {
      this.isValid = true;
    }
  }

  @action
  setUserInfo(userId, password) {
    this.userToken.userId = userId || this.userId;
    this.userToken.password = password || this.password;
  }

  @action
  setPushInfo(pushToken) {
    this.userToken.pushToken = pushToken;
  }

  @action
  setDeviceId(deviceId) {
    this.userToken.deviceId = deviceId;
  }

  @action
  clearStore() {
    this.userId = "";
    this.isValid = false;
    this.userIdError = "";
    this.password = "";
    this.passwordError = "";
  }
}

export default LoginStore;
