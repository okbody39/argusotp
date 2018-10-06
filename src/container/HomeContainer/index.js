// @flow
import * as React from "react";
import { observer, inject } from "mobx-react/native";

import Home from "../../stories/screens/Home";
// import data from "./data";
import OTP from "otp-client";
import styles from "../../stories/screens/VMs/styles";
import {
  Body,
  Button, Container,
  Content,
  H1,
  Header,
  Icon,
  Left,
  List,
  ListItem,
  Right,
  Text,
  Title
} from "../../stories/screens/VMs";
import Sparkline from "react-native-sparkline";
import {NavigationActions} from "react-navigation";

export interface Props {
  navigation: any,
  mainStore: any,
}
export interface State {}

// @inject("mainStore")
@inject("mainStore")
@observer
export default class HomeContainer extends React.Component<Props, State> {

  constructor(props) {
    super(props);

    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    const { loginForm, settingForm } = this.props;

    // loginForm.loadUserAuthInfo();
    // settingForm.loadOtpServerInfo();

    // console.log('HomeContainer....', loginForm.userId);
    // const userToken = loginForm.checkUserAuthInfo();

  };

  render() {
    const { mainStore, navigation } = this.props;

    // const list = this.props.mainStore.items.toJS();
    return <Home navigation={navigation} mainStore={mainStore} />;


  }
}
