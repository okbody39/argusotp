import * as React from "react";
import { Image, Platform } from "react-native";
// import AssetUtils from 'expo-asset-utils';
import { Container, Content, Header, Body, Title, Button, Text, View, Icon, Footer, Row } from "native-base";
//import styles from "./styles";
export interface Props {
	loginForm: any,
	onLogin: Function,
}
const platform = Platform.OS;

export interface State {}
class Login extends React.Component<Props, State> {
	render() {
		return (
			<Container>
				<Header style={{ height: 150 }}>
					<Body style={{ alignItems: "center" }}>
						{/*<Icon name="cloud" style={{ fontSize: 100 }} />*/}
            {platform === "ios" ?
              <Image
                source={require("../../../../assets/logo-seedauth.png")}
                style={{width: 600 / 2.5, height: 172 / 2.5}}
              />
              :
              <Image
                source={require("../../../../assets/logo-seedauth-white.png")}
                style={{width: 600 / 2.5, height: 172 / 2.5}}
              />
            }
						{/*<Title>SeedAuth Mobile</Title>*/}
						<View padder>
							<Text style={{ color: Platform.OS === "ios" ? "#000" : "#FFF" }}>
								for SeedVDI and SeedCloud
							</Text>
						</View>
					</Body>
				</Header>
				<Content>
					{this.props.loginForm}
					<View padder>
							<Button block onPress={() => this.props.onLogin()}>
								<Text>Login</Text>
							</Button>
					</View>
					<View padder style={{ alignItems: "center" }}>
						<Text note style={{ marginBottom: 10 }}>
              This service need setting the server first.
						</Text>
						<Button block info onPress={() => this.props.navigation.navigate("PreSetting")}>
							<Text>Setting</Text>
						</Button>
					</View>
				</Content>
				<Footer style={{ backgroundColor: "#F8F8F8" }}>
					<View style={{ alignItems: "center", opacity: 1, flexDirection: "row" }}>
						{/*<View padder>*/}
							{/*<Text style={{ color: "#000" }}>Copyright © DFOCUS All Rights Reserved.</Text>*/}
						{/*</View>*/}
						<Image
							source={{ uri: "http://www.dfocus.net/www/img/logo.jpg" }}
							style={{ width: 157 / 2, height: 53 / 2 }}
						/>
					</View>
				</Footer>
			</Container>
		);
	}
}

export default Login;
