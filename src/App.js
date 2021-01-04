import React from "react";

import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createStackNavigator, TransitionPresets } from 'react-navigation-stack';
import Login from "./container/LoginContainer";
import Home from "./container/HomeContainer";
import LockSet from "./container/LockSetContainer";
/*
options={{
    cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
  }}
 */
const AppStack = createStackNavigator(
	{
		Home: { screen: Home },
		Login: { screen: Login },
		Logout: { screen: Login },
		LockSet: { screen: LockSet },
	},
	{
		initialRouteName: "Login",
		headerMode: "none",
		// navigationOptions: ({ navigation }) => ({
		// 	...TransitionPresets.SlideFromRightIOS
		// }),
		defaultNavigationOptions: ({navigation}) => ({
			// animationEnabled: false,
			...TransitionPresets.ModalSlideFromBottomIOS
		})
	}
);

export default createAppContainer(AppStack);
