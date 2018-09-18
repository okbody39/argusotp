import { observable, action } from "mobx";
import { AsyncStorage } from 'react-native';

class SettingStore {
  @observable otpServerIp = "";
  @observable otpServerPort = "";
  @observable encKey = "";
  @observable serverIpError = "";
  @observable serverPortError = "";
  @observable isValid = false;

  @action async saveOtpServerInfo() {
    try{
      await AsyncStorage.setItem('@ApiKeysStore:otpServerIp', this.otpServerIp);
      await AsyncStorage.setItem('@ApiKeysStore:otpServerPort', this.otpServerPort);
      await AsyncStorage.setItem('@ApiKeysStore:encKey', this.encKey);
    } catch(e) {
      console.log(e);
    }
  }

  @action async resetOtpServerInfo() {
    try{
      this.otpServerIp = "";
      this.otpServerPort = "";
      this.encKey = "";

      await AsyncStorage.removeItem('@ApiKeysStore:otpServerIp');
      await AsyncStorage.removeItem('@ApiKeysStore:otpServerPort');
      await AsyncStorage.removeItem('@ApiKeysStore:encKey');

    } catch(e) {
      console.log(e);
    }
  }

  @action async loadOtpServerInfo() {
    try {
      this.otpServerIp = await AsyncStorage.getItem('@ApiKeysStore:otpServerIp');
      this.otpServerPort = await AsyncStorage.getItem('@ApiKeysStore:otpServerPort');
      this.encKey = await AsyncStorage.getItem('@ApiKeysStore:encKey');
    } catch (e) {
      console.log(e);
    }
  }

  @action
  serverIpOnChange(ip) {
    this.otpServerIp = ip;
    // this.validateServerIp();
  }

  // @action
  // validateServerIp() {
  //   const ipAddress = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/i.test(this.password)
  //     ? "Invalid IP address"
  //     : undefined;
  //   const required = this.otpServerIp ? undefined : "Required";
  //   this.serverIpError = required
  //     ? required
  //     : ipAddress;
  // }

  @action
  serverPortOnChange(port) {
    this.otpServerPort = port;
    // this.validateServerPort();
  }

  // @action
  // validateServerPort() {
  //   const numberic = /^0|[1-9]\d*$/i.test(this.password)
  //     ? "Only number"
  //     : undefined;
  //   const required = this.otpServerPort ? undefined : "Required";
  //   this.serverPortError = required
  //     ? required
  //     : numberic;
  // }

  @action
  validateForm() {
    // if (this.serverIpError === undefined && this.serverPortError === undefined) {
    //   this.isValid = true;
    // }
    this.isValid = true;
  }

  @action
  clearStore() {
    this.otpServerIp = "";
    this.otpServerPort = "";
    this.encKey = "";
    this.isValid = false;
  }
}

export default SettingStore;
