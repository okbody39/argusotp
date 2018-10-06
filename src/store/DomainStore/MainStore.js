import { observable, action } from "mobx";
import { AsyncStorage } from "react-native";

class MainStore {
  @observable userToken = {};
  @observable serverToken = {};
  @observable isLogin = false;
  @observable isServerSet = false;

  @action
  getServerUrl() {
    let url = "http://" + this.serverToken.otpServerIp + ":" + this.serverToken.otpServerPort;
    return url;
  }

  @action
  async loadStore() {
    try {
      this.isLogin = false;
      this.isServerSet = false;

      let userToken = await AsyncStorage.getItem("@SeedAuthStore:userToken");
      let serverToken = await AsyncStorage.getItem("@SeedAuthStore:serverToken");

      this.userToken = JSON.parse(userToken);
      this.serverToken = JSON.parse(serverToken);

      // console.log(this.userToken, this.serverToken);

      if (this.userToken && this.userToken.userId.length > 0) {
        this.isLogin = true;
      }

      if (this.serverToken && this.serverToken.encKey.length > 0) {
        this.isServerSet = true;
      }

    } catch (e) {
      console.log(e);
    }
  }

  @action
  async saveStore(_userToken, _serverToken) {
    try {
      await this.saveUserStore(_userToken);
      await this.saveServerStore(_serverToken);
    } catch (e) {
      console.log(e);
    }
  }

  @action
  async saveUserStore(_userToken) {
    try {
      let userToken = _userToken || JSON.stringify(this.userToken);

      if (typeof _userToken === "object") {
        userToken = JSON.stringify(_userToken);
      }

      await AsyncStorage.setItem("@SeedAuthStore:userToken", userToken);
      this.userToken = JSON.parse(userToken);
      this.isLogin = true;
    } catch (e) {
      console.log(e);
    }
  }

  @action
  async saveServerStore(_serverToken) {
    try {
      let serverToken = _serverToken || JSON.stringify(this.serverToken);

      if (typeof _serverToken === "object") {
        serverToken = JSON.stringify(_serverToken);
      }

      // console.log(serverToken);

      await AsyncStorage.setItem("@SeedAuthStore:serverToken", serverToken);
      this.serverToken = JSON.parse(serverToken);
      this.isServerSet = true;
    } catch (e) {
      console.log(e);
    }
  }

  @action
  async resetStore() {
    try {
      await AsyncStorage.removeItem("@SeedAuthStore:userToken");
      await AsyncStorage.removeItem("@SeedAuthStore:serverToken");
      this.userToken = {};
      this.serverToken = {};
      this.isLogin = false;
      this.isServerSet = false;
    } catch (e) {
      console.log(e);
    }
  }

  @action
  async resetUserStore() {
    try {
      await AsyncStorage.removeItem("@SeedAuthStore:userToken");
      this.userToken = {};
      this.isLogin = false;
    } catch (e) {
      console.log(e);
    }
  }

  // @action
  // async resetServerStore() {
  //   try {
  //     await AsyncStorage.removeItem("@SeedAuthStore:serverToken");
  //     this.serverToken = {};
  //     this.isServerSet = false;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
}

export default MainStore;
