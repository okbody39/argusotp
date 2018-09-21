// @flow
import React from "react";
import {
  ActivityIndicator,
  AsyncStorage
} from "react-native";
import {
  Content, Spinner
} from "native-base";
import {inject, observer} from "mobx-react/native";
import {NavigationActions} from "react-navigation";
export interface Props {
	navigation: any,
}
export interface State {}

@inject("mainStore")
@observer
export default class AuthLoadingContainer extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    const { mainStore } = this.props;

    await mainStore.loadUserToken();
    await mainStore.loadOtpServerInfo();

    let routName = mainStore.isLogin ? "App" : "Auth";

    this.props.navigation.dispatch(NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: routName })],
    }));

    // this.props.navigation.navigate(userToken ? 'App' : 'Auth');
  };

  render() {
    return (
      <Content contentContainerStyle={{ justifyContent: "center", flex: 1 }}>
        <Spinner />
      </Content>
    );
  }
}
