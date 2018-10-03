// @flow
import * as React from "react";
import { Item, Input, Icon, Form, Toast, Spinner } from "native-base";
import { observer, inject } from "mobx-react/native";
// import aesjs from "aes-js";
// import axios from "axios";
import { AsyncStorage } from "react-native";

import ServerInfo from "../../stories/screens/ServerInfo";

export interface Props {
  navigation: any,
  settingForm: any,
}
export interface State {}

@inject("settingForm", "loginForm")
@observer
export default class ServerInfoContainer extends React.Component<Props, State> {
  serverIpInput: any;
  serverPortInput: any;

  async componentDidMount() {
    const { settingForm, loginForm } = this.props;

    await settingForm.loadOtpServerInfo();
    await loginForm.loadUserAuthInfo();

  }

  render() {
    const { settingForm, loginForm, navigation } = this.props;

    if(!settingForm.encKey) {
    	return <Spinner/>;
		}

    return <ServerInfo navigation={navigation} settingForm={settingForm} loginForm={loginForm} />;
  }
}
