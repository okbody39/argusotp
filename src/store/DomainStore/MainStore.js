import { observable, action } from "mobx";
import { AsyncStorage } from "react-native";

class MainStore {
  @observable hasErrored = false;
  @observable isLoading = true;
  @observable items = [];

  @observable userToken = "";
  @observable isLogin = false;

  @observable otpServerIp = "";
  @observable otpServerPort = "";
  @observable encKey = "";
  @observable period = "";
  @observable digits = "";

  @action
  fetchItems(data) {
    this.items = data;
    this.isLoading = false;
  }

  @action
  saveUserToken(data, isLogin) {
    this.userToken = data;
    this.isLogin = isLogin;
  }

  @action
  async loadUserToken() {
    try {
      let userToken = await AsyncStorage.getItem("@ApiKeysStore:userId");

      this.userToken = userToken;

      if (this.userToken.length > 0) {
        this.isLogin = true;
      }
    } catch (e) {
      console.log(e);
    }
  }

  @action
  saveOtpServerInfo(ip, port, key) {
    this.otpServerIp = ip;
    this.otpServerPort = port;
    this.encKey = port;
  }

  @action
  async loadOtpServerInfo() {
    try {
      this.otpServerIp = await AsyncStorage.getItem("@ApiKeysStore:otpServerIp");
      this.otpServerPort = await AsyncStorage.getItem("@ApiKeysStore:otpServerPort");
      this.encKey = await AsyncStorage.getItem("@ApiKeysStore:encKey");
      this.period = await AsyncStorage.getItem("@ApiKeysStore:period");
      this.digits = await AsyncStorage.getItem("@ApiKeysStore:digits");
    } catch (e) {
      console.log(e);
    }
  }

}

export default MainStore;
