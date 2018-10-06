import { observable, action } from "mobx";
import { AsyncStorage } from "react-native";

class SettingStore {
  @observable otpServerIp = "";
  @observable otpServerPort = "";
  @observable encKey = "";
  @observable otpKey = "";

  @observable serverIpError = "";
  @observable serverPortError = "";
  @observable isValid = false;
  @observable period = "";
  @observable digits = "";

  @observable serverToken = {
    otpServerIp: "",
    otpServerPort: "",
    encKey: "",
    otpKey: "",
    period: "60",
    digits: "6",
  };

  @action
  getServerUrl() {
    let url = "http://" + this.otpServerIp + ":" + this.otpServerPort;
    return url;
  }

  @action
  loadServerInfo(serverToken) {
    this.otpServerIp = serverToken.otpServerIp;
    this.otpServerPort = serverToken.otpServerPort;
  }

  @action
  serverIpOnChange(ip) {
    this.otpServerIp = ip;
    this.validateServerIp();
  }

  @action
  validateServerIp() {
    const ipAddress = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/i.test(this.password)
      ? "Invalid IP address"
      : undefined;
    const required = this.otpServerIp ? undefined : "Required";
    this.serverIpError = required
      ? required
      : ipAddress;
  }

  @action
  serverPortOnChange(port) {
    this.otpServerPort = port;
    this.validateServerPort();
  }

  @action
  validateServerPort() {
    const numberic = /^0|[1-9]\d*$/i.test(this.password)
      ? "Only number"
      : undefined;
    const required = this.otpServerPort ? undefined : "Required";
    this.serverPortError = required
      ? required
      : numberic;
  }

  @action
  validateForm() {
    if (this.serverIpError === undefined && this.serverPortError === undefined) {
      this.isValid = true;
    }
  }

  @action
  setServerInfo(otpServerIp, otpServerPort, encKey) {
    this.serverToken.otpServerIp = otpServerIp;
    this.serverToken.otpServerPort = otpServerPort;
    this.serverToken.encKey = encKey;
  }

  @action
  setOtpInfo(otpKey, period, digits) {
    this.serverToken.otpKey = otpKey;
    this.serverToken.period = "" + period;
    this.serverToken.digits = "" + digits;
  }

  @action
  clearStore() {
    this.otpServerIp = "";
    this.otpServerPort = "";
    this.encKey = "";
    this.otpKey = "";
    this.period = "";
    this.digits = "";
    this.serverIpError = "";
    this.serverPortError = "";

    this.isValid = false;
  }
}

export default SettingStore;
