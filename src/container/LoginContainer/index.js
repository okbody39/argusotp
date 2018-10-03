// @flow
import * as React from "react";
import { Item, Input, Icon, Form, Toast } from "native-base";
import { observer, inject } from "mobx-react/native";
// import aesjs from "aes-js";
import axios from "axios";
import { AsyncStorage } from "react-native";
import { Permissions, Notifications } from "expo";

import { encrypt, decrypt} from "../../utils/crypt";
import Login from "../../stories/screens/Login";

export interface Props {
  navigation: any,
  loginForm: any,
}
export interface State {}

@inject("settingForm", "loginForm", "mainStore")
@observer
export default class LoginContainer extends React.Component<Props, State> {
  userIdInput: any;
  pwdinput: any;

  constructor(props) {
    super(props);

    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    const { loginForm, mainStore } = this.props;
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== "granted") {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // console.log('===>', finalStatus)

    // Stop here if the user did not grant permissions
    if (finalStatus !== "granted") {
      return;
    }

    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();
    // console.log('===>', token);
    mainStore.setPushToken(token);

  };

  async componentWillMount() {
    const { loginForm, settingForm, navigation, mainStore } = this.props;

    let isLogout = navigation.state.params ? navigation.state.params.isLogout : false;

    if (isLogout) {
      await loginForm.resetUserAuthInfo();
      await mainStore.saveUserToken({}, false);
      // await settingForm.resetOtpServerInfo();
    }

    await settingForm.loadOtpServerInfo();

    if (!settingForm.encKey) {
      //navigation.navigate("Setting");
      Toast.show({
        text: "Please setting your server first",
        duration: 2000,
        position: "top",
        textStyle: { textAlign: "center" },
      });

      return;
    }

    await loginForm.loadUserAuthInfo();

    if (mainStore.isLogin) {
      navigation.navigate("Drawer");
    }
  }

  login() {
    const { loginForm, settingForm, navigation, mainStore } = this.props;

    loginForm.validateForm();

    if (loginForm.isValid) {

      const formPayload = {
        userid: loginForm.userId,
        userpassword: loginForm.password,
        pushToken: mainStore.pushToken,
        code: "",
      };

      // var key = aesjs.utils.utf8.toBytes(settingForm.encKey);
      //
      // var text = JSON.stringify(formPayload);
      // var textBytes = aesjs.utils.utf8.toBytes(text);
      //
      // var aesEcb = new aesjs.ModeOfOperation.ecb(key);
      // var encryptedBytes = aesEcb.encrypt(textBytes);
      //
      // var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);

      var encryptedHex = encrypt(JSON.stringify(formPayload), settingForm.encKey);

      axios.get("http://" + settingForm.otpServerIp + ":" + settingForm.otpServerPort + "/otp/register/" + encryptedHex, {
        crossdomain: true,
      }).then(res => {
        const result = res.data;

        // let encryptedBytes = aesjs.utils.hex.toBytes(result);
        // let decryptedBytes = aesEcb.decrypt(encryptedBytes);
        // let decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
        // // 중요 : 절대 삭제하지 말것!!!
        // let jsonText = decryptedText.substring(0, decryptedText.indexOf("}") + 1);

        let jsonText = decrypt(result, settingForm.encKey);

          let jsonObj = JSON.parse(jsonText);

        if (jsonObj.result === "True") {
          // AsyncStorage.setItem("@ApiKeysStore:otpKey", jsonObj.reason);
          // AsyncStorage.setItem("@ApiKeysStore:period", "" + jsonObj.period);
          // AsyncStorage.setItem("@ApiKeysStore:digits", "" + jsonObj.digits);
          //
          // settingForm.otpKey = jsonObj.reason;
          // settingForm.period = jsonObj.period;
          // settingForm.digits = jsonObj.digits;


          settingForm.setOtpInfo(jsonObj.reason, jsonObj.period, jsonObj.digits);

          loginForm.saveUserAuthInfo();
          mainStore.saveUserToken(loginForm.userId, true);
          settingForm.saveOtpServerInfo();

          setTimeout(() => {
            navigation.navigate("AuthLoading");
          }, 500);
          // navigation.navigate("Drawer");

        } else {
          loginForm.resetUserAuthInfo();
          mainStore.saveUserToken({}, false);

          Toast.show({
            text: jsonObj.reason,
            duration: 2000,
            position: "top",
            textStyle: { textAlign: "center" },
          });
        }

      });


    } else {
      Toast.show({
        text: "Username or password invalid!",
        duration: 2000,
        position: "top",
        textStyle: { textAlign: "center" },
      });
    }
  }

  render() {
    const form = this.props.loginForm;
    const Fields = (
      <Form>
        <Item error={!!form.userIdError}>
          <Icon active name="person" />
          <Input
            placeholder="User ID"
            keyboardType="email-address"
            autoCapitalize = "none"
            ref={c => (this.userIdInput = c)}
            value={form.userId}
            onBlur={() => form.validateUserId()}
            onChangeText={e => form.userIdOnChange(e)}
          />
        </Item>
        <Item error={!!form.passwordError}>
          <Icon active name="unlock" />
          <Input
            placeholder="Password"
            autoCapitalize = "none"
            ref={c => (this.pwdinput = c)}
            value={form.password}
            onBlur={() => form.validatePassword()}
            onChangeText={e => form.passwordOnChange(e)}
            secureTextEntry={true}
          />
        </Item>
      </Form>
    );
    return <Login navigation={this.props.navigation} loginForm={Fields} onLogin={() => this.login()} />;
  }
}
