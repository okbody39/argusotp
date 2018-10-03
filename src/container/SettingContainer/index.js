import * as React from "react";
import { Item, Input, Icon, Form, Toast } from "native-base";
import { observer, inject } from "mobx-react/native";
// import aesjs from "aes-js";
import axios from "axios";
import { AsyncStorage } from "react-native";

import { encrypt, decrypt} from "../../utils/crypt";
import Setting from "../../stories/screens/Setting";

export interface Props {
  navigation: any,
  settingForm: any,
}
export interface State {}

const _DEFAULT_KEY_ = "MyScret-YESJYHAN";

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

    settingForm.validateServerIp();
    settingForm.validateServerPort();

    settingForm.validateForm();

    if (settingForm.isValid) {

      axios.get("http://" + settingForm.otpServerIp + ":" + settingForm.otpServerPort + "/otp/encryptKey", {
        crossdomain: true,
      }).then(res => {
        const result = res.data;

        // var key = aesjs.utils.utf8.toBytes(_DEFAULT_KEY_);
        // var aesEcb = new aesjs.ModeOfOperation.ecb(key);
        //
        // let encryptedBytes = aesjs.utils.hex.toBytes(result);
        // let decryptedBytes = aesEcb.decrypt(encryptedBytes);
        // let decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
        //
        // // 중요 : 절대 삭제하지 말것!!!
        // let jsonText = decryptedText.substring(0, decryptedText.indexOf("}") + 1);

        let jsonText = decrypt(result, _DEFAULT_KEY_);

        let jsonObj = JSON.parse(jsonText);

        settingForm.saveOtpServerBasicInfo(jsonObj.encKey);

        navigation.goBack();

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
            placeholder="OTP Server IP"
            keyboardType="default"
            value={settingForm.otpServerIp}
            onChangeText={e => settingForm.serverIpOnChange(e)}
          />
        </Item>
        <Item error={settingForm.serverPortError ? true : false}>
          <Icon active name="unlock" />
          <Input
            placeholder="OTP Server Port"
            value={settingForm.otpServerPort}
            onChangeText={e => settingForm.serverPortOnChange(e)}
          />
        </Item>
      </Form>
    );
    return <Setting navigation={this.props.navigation} settingForm={Fields} onSave={() => this.save()} />;
  }
}
