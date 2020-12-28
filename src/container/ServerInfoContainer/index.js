// @flow
import * as React from "react";
import { Item, Input, Icon, Form, Toast, Spinner } from "native-base";
import { observer, inject } from "mobx-react";
// import aesjs from "aes-js";
// import axios from "axios";
import { AsyncStorage } from "react-native";
// import Expo from "expo";
import Constants from 'expo-constants';

import ServerInfo from "../../stories/screens/ServerInfo";

@inject("mainStore")
@observer
export default class ServerInfoContainer extends React.Component {
  serverIpInput: any;
  serverPortInput: any;

  constructor(props, context) {
    super(props, context);
    this.state = {
      version: "",
    };

  }

  componentDidMount() {
    const {version} = Constants.manifest;

    this.setState({
      version: version
    });
  }

  render() {
    const { mainStore, navigation } = this.props;

    if(!mainStore.isServerSet) {
    	return <Spinner/>;
		}

    return <ServerInfo navigation={navigation} mainStore={mainStore} ver={this.state.version}/>;
  }
}
