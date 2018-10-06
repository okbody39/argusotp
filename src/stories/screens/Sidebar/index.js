import * as React from "react";
import { Alert, Image } from "react-native";
import { Text, Container, List, ListItem, Content } from "native-base";
import { NavigationActions } from "react-navigation";

const routes = [
	{
		route: "Home",
		caption: "OTP",
	},
  {
    route: "Setting",
    caption: "Setting",
  },
  {
		route: "BlankPage",
		caption: "About",
	},
	{
		route: "Logout",
		caption: "Logout",
	},
];

export interface Props {
	navigation: any,
}
export interface State {}
const resetAction = NavigationActions.reset({
	index: 0,
	actions: [NavigationActions.navigate({ routeName: "Logout", params: { isLogout: true }})],
});
export default class Sidebar extends React.Component<Props, State> {

	onPress(route) {
    if(route === 'Logout') {

      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {text: 'Cancel', onPress: () => {}, style: 'cancel'},
          {text: 'OK', onPress: () => this.props.navigation.dispatch(resetAction)},
        ],
        { cancelable: true }
      )

		} else {
      this.props.navigation.navigate(route);
		}
		return;
	}

	render() {
		return (
			<Container>
				<Content>
          <Image
            source={require("../../../../assets/logo-seedauth.png")}
            style={{width: 600 / 4, height: 172 / 4,  marginTop: 10, marginLeft: 10}}
          />
					<List
						style={{ marginTop: 10 }}
						dataArray={routes}
						renderRow={data => {
							return (
								<ListItem
									button
									onPress={() =>  this.onPress(data.route) }
								>
									<Text>{data.caption}</Text>
								</ListItem>
							);
						}}
					/>
				</Content>
			</Container>
		);
	}
}
