import React from "react";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';
import { Root } from "native-base";
import Login from "./container/LoginContainer";
import Home from "./container/HomeContainer";
import Lock from "./container/LockContainer";
import LockSet from "./container/LockSetContainer";
import BlankPage from "./container/BlankPageContainer";
import Sidebar from "./container/SidebarContainer";
import AuthLoading from "./container/AuthLoadingContainer";
import Setting from "./container/SettingContainer";
import ServerInfo from "./container/ServerInfoContainer";

const Drawer = createDrawerNavigator(
	{
		Home: { screen: Home },
		Lock: {
			screen: Lock,
			navigationOptions: {
				drawerLockMode: "locked-closed",
				disableGestures: true
			}
		}
	},
	{
		initialRouteName: "Home",
		// disableGestures: true,
		// defaultNavigationOptions: {
		// 	drawerLockMode: "locked-closed",
		// 	disableGestures: true,
		// },
		contentComponent: props => <Sidebar {...props} />,
	}
);

const AppStack = createStackNavigator(
	{
		Login: { screen: Login },
		Logout: { screen: Login },
		Lock: { screen: Lock },
		LockSet: { screen: LockSet },
		BlankPage: { screen: BlankPage },
		ServerInfo: { screen: ServerInfo },
		Setting: { screen: Setting },
		Drawer: { screen: Drawer },
	},
	{
		initialRouteName: "Drawer",
		headerMode: "none",
	}
);

const AuthStack = createStackNavigator(
	{
		Login:  { screen: Login },
		Lock: { screen: Lock },
		PreSetting: { screen: Setting },
		AuthLoading:  { screen: AuthLoading },
		App: { screen: AppStack },
	},
	{
		initialRouteName: "Login",
		headerMode: "none",
	}
);

const AuthSwitch = createStackNavigator(
	{
		AuthLoading:  { screen: AuthLoading },
		App: { screen: AppStack },
		Auth: { screen: AuthStack },
		Logout: { screen: Login },
	},
	{
		initialRouteName: "AuthLoading",
		headerMode: "none",
	}
);

export default createAppContainer(AuthSwitch);
