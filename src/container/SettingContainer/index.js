import * as React from "react";
import { Item, Input, Icon, Form, Toast } from "native-base";
import { observer, inject } from "mobx-react";
// import aesjs from "aes-js";
import axios from "axios";
import { AsyncStorage } from "react-native";

import { encrypt, decrypt} from "../../utils/crypt";
import Setting from "../../stories/screens/Setting";
import {NavigationActions, StackActions} from "react-navigation";

export interface Props {
  navigation: any,
  settingForm: any,
}
export interface State {}

const _DEFAULT_KEY_ = "MyScret-YESJYHAN";
const resetAction = StackActions.reset();
// NavigationActions.reset({
//   index: 0,
//   key: null,
//   actions: [NavigationActions.navigate({ routeName: "Login", params: { isLogout: true }})],
// });

@inject("settingForm", "mainStore")
@observer
export default class SettingContainer extends React.Component<Props, State> {
  serverIpInput: any;
  serverPortInput: any;

  componentDidMount() {
    const { settingForm, mainStore } = this.props;

    if(mainStore.serverToken) {
      settingForm.loadServerInfo(mainStore.serverToken);
    }
  }

  save() {
    const { settingForm, mainStore, navigation } = this.props;

    settingForm.validateServerIp();
    settingForm.validateServerPort();
    settingForm.validateForm();

    if (settingForm.isValid) {

      axios.get(settingForm.getServerUrl() + "/otp/encryptKey", {
        crossdomain: true,
      }).then(res => {
        const result = res.data;
        let jsonText = decrypt(result, _DEFAULT_KEY_);

        let jsonObj = JSON.parse(jsonText);

        settingForm.serverToken.otpServerIp = settingForm.otpServerIp;
        settingForm.serverToken.otpServerPort = settingForm.otpServerPort;
        settingForm.serverToken.encKey = jsonObj.encKey;

        let saveServerInfo = {
          otpServerIp: settingForm.otpServerIp,
          otpServerPort: settingForm.otpServerPort,
          encKey: jsonObj.encKey,
        };

        mainStore.saveServerStore(saveServerInfo).then(() => {
          // navigation.goBack();
          try {
            mainStore.resetUserStore();
            navigation.dispatch(resetAction);
          } catch(e) {
            navigation.goBack();
          }
        });

      }).catch(err => {
        Toast.show({
          text: "OTP Server error!",
          duration: 2000,
          position: "top",
          textStyle: { textAlign: "center" },
        });
      });
    } else {
      Toast.show({
        text: "Server IP or Port invalid!",
        duration: 2000,
        position: "top",
        textStyle: { textAlign: "center" },
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
            placeholder="Server IP"
            placeholderTextColor="#c9c9c9"
            keyboardType="numeric"
            value={settingForm.otpServerIp}
            onChangeText={e => settingForm.serverIpOnChange(e)}
          />
        </Item>
        <Item error={settingForm.serverPortError ? true : false}>
          <Icon active name="unlock" />
          <Input
            placeholder="Server Port"
            placeholderTextColor="#c9c9c9"
            keyboardType="numeric"
            value={settingForm.otpServerPort}
            onChangeText={e => settingForm.serverPortOnChange(e)}
          />
        </Item>
      </Form>
    );
    return <Setting navigation={this.props.navigation} settingForm={Fields} onSave={() => this.save()} />;
  }
}
