// @flow
import * as React from "react";
import { Item, Input, Icon, Form, Toast } from "native-base";
import { observer, inject } from "mobx-react/native";
import aesjs from "aes-js";
import axios from "axios";
import { AsyncStorage } from "react-native";

import Setting from "../../stories/screens/Setting";

export interface Props {
  navigation: any,
  settingForm: any,
}
export interface State {}

@inject("settingForm")
@observer
export default class SettingContainer extends React.Component<Props, State> {
  serverIpInput: any;
  serverPortInput: any;

  async componentDidMount() {
    const { settingForm } = this.props;

    await settingForm.loadOtpServerInfo();

  }

  save() {
    const { settingForm, navigation } = this.props;

    settingForm.validateForm();

    if (settingForm.isValid) {

      axios.get("http://" + settingForm.otpServerIp + ":" + settingForm.otpServerPort + "/otp/encryptKey", {
        crossdomain: true,
      }).then(res => {
        const result = res.data;

        settingForm.encKey = result;
        settingForm.saveOtpServerInfo();

        // navigation.navigate("Login");
        navigation.goBack();

      }).catch(err => {
        Toast.show({
          text: "Server IP or Port invalid!",
          duration: 2000,
          position: "top",
          textStyle: { textAlign: "center" },
        });
      });
    }
  }

  render() {
    const { settingForm } = this.props;

    const Fields = (
      <Form>
        <Item error={settingForm.serverIpError ? true : false}>
          <Icon active name="person" />
          <Input
            placeholder="OTP Server IP"
            keyboardType="default"
            ref={c => (this.serverIpInput = c)}
            value={settingForm.otpServerIp}
						// onBlur={() => settingForm.validateServerIp()}
            onChangeText={e => settingForm.serverIpOnChange(e)}
          />
        </Item>
        <Item error={settingForm.serverPortError ? true : false}>
          <Icon active name="unlock" />
          <Input
            placeholder="OTP Server Port"
            ref={c => (this.serverPortInput = c)}
            value={settingForm.otpServerPort}
						// onBlur={() => settingForm.validateServerPort()}
            onChangeText={e => settingForm.serverPortOnChange(e)}
          />
        </Item>
      </Form>
    );
    return <Setting navigation={this.props.navigation} settingForm={Fields} onSave={() => this.save()} />;
  }
}
