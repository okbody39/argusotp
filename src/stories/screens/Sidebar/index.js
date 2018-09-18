import * as React from "react";
import { Alert } from "react-native";
import { Text, Container, List, ListItem, Content } from "native-base";
import { NavigationActions } from "react-navigation";

const routes = [
	{
		route: "Home",
		caption: "Home",
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
        '로그아웃',
        '로그아웃을 실행하시겠습니까?',
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
					<List
						style={{ marginTop: 40 }}
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
