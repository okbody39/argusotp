// @flow
import * as React from "react";
import { Item, Input, Icon, Form, Toast } from "native-base";
import { observer, inject } from "mobx-react/native";
import aesjs from 'aes-js';
import axios from 'axios';
import { AsyncStorage } from 'react-native';

import Login from "../../stories/screens/Login";

export interface Props {
  navigation: any,
  loginForm: any,
}
export interface State {}

@inject("settingForm")
@inject("loginForm")
@observer
export default class LoginContainer extends React.Component<Props, State> {
  userIdInput: any;
  pwdinput: any;

  async componentWillMount() {
    const { loginForm, settingForm, navigation } = this.props;

    let isLogout = navigation.state.params ? navigation.state.params.isLogout : false;

    if(isLogout) {
      await loginForm.resetUserAuthInfo();
      // await settingForm.resetOtpServerInfo();
    }

    await settingForm.loadOtpServerInfo();

    if(!settingForm.encKey) {
      //navigation.navigate("Setting");
      Toast.show({
        text: "서버 Setting을 먼저 해주세요!",
        duration: 2000,
        position: "top",
        textStyle: { textAlign: "center" },
      });

      return;
    }

    await loginForm.loadUserAuthInfo();

    if(loginForm.userId && loginForm.userId.length > 0) {
      navigation.navigate("Drawer");
      return;
    }
  }

  login() {
    const { loginForm, settingForm, navigation } = this.props;

    loginForm.validateForm();

    if (loginForm.isValid) {

      const formPayload = {
        userid: loginForm.userId,
        userpassword: loginForm.password,
        code: '',
      };

      var key = aesjs.utils.utf8.toBytes(settingForm.encKey);

      var text = JSON.stringify(formPayload);
      var textBytes = aesjs.utils.utf8.toBytes(text);

      var aesEcb = new aesjs.ModeOfOperation.ecb(key);
      var encryptedBytes = aesEcb.encrypt(textBytes);

      var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);

      axios.get("http://" + settingForm.otpServerIp + ":" + settingForm.otpServerPort + "/otp/register/" + encryptedHex, {
        crossdomain: true,
      }).then(res => {
        const result = res.data;

        let encryptedBytes = aesjs.utils.hex.toBytes(result);
        let decryptedBytes = aesEcb.decrypt(encryptedBytes);
        let decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
        // 중요 : 절대 삭제하지 말것!!!
        let jsonText = decryptedText.substring(0, decryptedText.indexOf('}')+1);

        let jsonObj = JSON.parse(jsonText);

        if(jsonObj.result == 'True') {
          AsyncStorage.setItem('@ApiKeysStore:otpKey', jsonObj.reason);

          loginForm.saveUserAuthInfo();
          navigation.navigate("Drawer");

        } else {
          loginForm.resetUserAuthInfo();
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
        text: "아이디 또는 비밀번호를 다시 확인해 주세요!",
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
        <Item error={form.userIdError ? true : false}>
          <Icon active name="person" />
          <Input
            placeholder="User ID"
            keyboardType="default"
            ref={c => (this.userIdInput = c)}
            value={form.userId}
            onBlur={() => form.validateUserId()}
            onChangeText={e => form.userIdOnChange(e)}
          />
        </Item>
        <Item error={form.passwordError ? true : false}>
          <Icon active name="unlock" />
          <Input
            placeholder="Password"
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
