import { observable, action } from "mobx";
import { AsyncStorage } from 'react-native';

class LoginStore {
  @observable userId = "";
  @observable password = "";
  @observable isValid = false;
  @observable userIdError = "";
  @observable passwordError = "";
  @observable otpKey = "";

  @action async saveUserAuthInfo() {
    try{
      await AsyncStorage.setItem('@ApiKeysStore:userId', this.userId);
      await AsyncStorage.setItem('@ApiKeysStore:userPassword', this.password);
    } catch(e) {
      console.log(e);
    }
  }

  @action async checkUserAuthInfo() {
    try{
      //TODO: encryption
      let userToken = await AsyncStorage.getItem('@ApiKeysStore:userId');
      return userToken.toString();
    } catch(e) {
      // console.log(e);
      return null;
    }
  }

  @action async resetUserAuthInfo() {
    try{
      this.userId = "";
      this.isValid = false;
      this.userIdError = "";
      this.password = "";
      this.passwordError = "";
      this.otpKey = "";

      await AsyncStorage.removeItem('@ApiKeysStore:userId');
      await AsyncStorage.removeItem('@ApiKeysStore:userPassword');
    } catch(e) {
      console.log(e);
    }
  }

  @action async loadUserAuthInfo() {
    try {
      this.userId = await AsyncStorage.getItem('@ApiKeysStore:userId');
      this.password = await AsyncStorage.getItem('@ApiKeysStore:userPassword');
    } catch (e) {
      console.log(e);
    }
  }

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
    const alphaNumeric = /[^a-zA-Z0-9 ]/i.test(this.userId)
      ? "Only alphanumeric characters"
      : undefined;
    const maxLength =
      this.userId.length > 15 ? "Must be 15 characters or less" : undefined;
    const minLength =
      this.userId.length < 4 ? "Must be 4 characters or more" : undefined;

    this.userIdError = required
      ? required
      : alphaNumeric ? alphaNumeric : maxLength ? maxLength : minLength;

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

    const alphaNumeric = /[^a-zA-Z0-9 ]/i.test(this.password)
      ? "Only alphanumeric characters"
      : undefined;
    const maxLength =
      this.password.length > 15 ? "Must be 15 characters or less" : undefined;
    const minLength =
      this.password.length < 8 ? "Must be 8 characters or more" : undefined;
    const required = this.password ? undefined : "Required";
    this.passwordError = required
      ? required
      : alphaNumeric ? alphaNumeric : maxLength ? maxLength : minLength;
  }

  @action
  validateForm() {
    if (this.userIdError === undefined && this.passwordError === undefined) {
      this.isValid = true;
    }
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
