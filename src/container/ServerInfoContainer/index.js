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

@inject("mainStore")
@observer
export default class ServerInfoContainer extends React.Component<Props, State> {
  serverIpInput: any;
  serverPortInput: any;

  componentDidMount() {
    // const { settingForm, loginForm } = this.props;

  }

  render() {
    const { mainStore, navigation } = this.props;

    if(!mainStore.isServerSet) {
    	return <Spinner/>;
		}

    return <ServerInfo navigation={navigation} mainStore={mainStore} />;
  }
}
