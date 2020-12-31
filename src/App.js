import React from "react";

import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from 'react-navigation-stack';
import Login from "./container/LoginContainer";
import Home from "./container/HomeContainer";
import LockSet from "./container/LockSetContainer";

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
	}
);

export default createAppContainer(AppStack);
