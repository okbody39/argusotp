import React from "react";
import { createDrawerNavigator, createAppContainer, createStackNavigator, createSwitchNavigator } from "react-navigation";
import { Root } from "native-base";
import Login from "./container/LoginContainer";
import Home from "./container/HomeContainer";
import BlankPage from "./container/BlankPageContainer";
import Sidebar from "./container/SidebarContainer";
// import Overview from "./container/OverviewContainer";
// import VMs from "./container/VMsContainer";
import AuthLoading from "./container/AuthLoadingContainer";
import Setting from "./container/SettingContainer";
import ServerInfo from "./container/ServerInfoContainer";

const Drawer = createDrawerNavigator(
	{
		Home: { screen: Home },
	},
	{
		initialRouteName: "Home",
		contentComponent: props => <Sidebar {...props} />,
	}
);

const AppStack = createStackNavigator(
		{
      Login: { screen: Login },
      Logout: { screen: Login },
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
  },
  {
    initialRouteName: "AuthLoading",
    headerMode: "none",
  }
);
//
// class App extends React.Component {
//   render() {
//     return (
//       <Root>
//       	<AuthSwitch />
//       </Root>
// 		);
//   }
// }

export default createAppContainer(AuthSwitch);
