import * as React from "react";
import { Image, Platform } from "react-native";
import { Container, Content, Header, Body, Title, Button, Text, View, Icon, Footer } from "native-base";
//import styles from "./styles";
export interface Props {
	loginForm: any,
	onLogin: Function,
}
export interface State {}
class Login extends React.Component<Props, State> {
	render() {
		return (
			<Container>
				<Header style={{ height: 200 }}>
					<Body style={{ alignItems: "center" }}>
						<Icon name="cloud" style={{ fontSize: 100 }} />
						<Title>SeedCloud</Title>
						<View padder>
							<Text style={{ color: Platform.OS === "ios" ? "#000" : "#FFF" }}>
								통합 관리자 모바일 콘솔
							</Text>
						</View>
					</Body>
				</Header>
				<Content>
					{this.props.loginForm}
					<View padder>
						<Button block onPress={() => this.props.onLogin()}>
							<Text>로그인</Text>
						</Button>
					</View>
				</Content>
				<Footer style={{ backgroundColor: "#F8F8F8" }}>
					<View style={{ alignItems: "center", opacity: 0.5, flexDirection: "row" }}>
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
