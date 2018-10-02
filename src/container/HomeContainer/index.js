// @flow
import * as React from "react";
import { observer, inject } from "mobx-react/native";

import Home from "../../stories/screens/Home";
import data from "./data";
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
@inject("loginForm", "settingForm")
@observer
export default class HomeContainer extends React.Component<Props, State> {

  constructor(props) {
    super(props);

    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    const { loginForm, settingForm } = this.props;

    await loginForm.loadUserAuthInfo();
    await settingForm.loadOtpServerInfo();

    // console.log('HomeContainer....', loginForm.userId);
    // const userToken = await loginForm.checkUserAuthInfo();

  };

  render() {
    const { loginForm, navigation, settingForm } = this.props;

    // const list = this.props.mainStore.items.toJS();
    return <Home navigation={navigation} userId={loginForm.userId} settingForm={settingForm} />;


  }
}
