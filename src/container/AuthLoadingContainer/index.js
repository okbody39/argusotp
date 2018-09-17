// @flow
import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage
} from 'react-native';
export interface Props {
	navigation: any,
}
export interface State {}
export default class AuthLoadingContainer extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken');

    this.props.navigation.navigate(userToken ? 'App' : 'Auth');
  };

  render() {
    return (
        <ActivityIndicator />
    );
  }
}
