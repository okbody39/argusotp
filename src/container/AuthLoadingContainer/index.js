// @flow
import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage
} from 'react-native';
import {inject, observer} from "mobx-react/native";
import {NavigationActions} from "react-navigation";
export interface Props {
	navigation: any,
}
export interface State {}

@inject("loginForm")
@observer
export default class AuthLoadingContainer extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    const { loginForm } = this.props;

    const userToken = await loginForm.checkUserAuthInfo();

    // console.log('AuthLoading...', userToken);

    let routName = userToken ? 'App' : 'Auth';

    this.props.navigation.dispatch(NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: routName })],
    }));

    // this.props.navigation.navigate(userToken ? 'App' : 'Auth');
  };

  render() {
    return (
        <ActivityIndicator />
    );
  }
}
