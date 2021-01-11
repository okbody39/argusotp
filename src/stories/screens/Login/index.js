import * as React from "react";
import { Image, Platform, KeyboardAvoidingView } from "react-native";
import {
	Container,
	Content,
	Header,
	Body,
	Title,
	Button,
	Text,
	View,
	Icon,
	Footer,
	Row,
	Item,
	Input,
	Spinner,
	Form, Toast
} from "native-base";
import axios from "axios";
import { decrypt } from "../../../utils/crypt";
import { inject, observer } from "mobx-react";

class Login extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			settingMode: !this.props.isServerSet,
		}
	}

	render() {
		const { loginForm, settingForm, onLogin, onSave } = this.props;
		const { settingMode } = this.state;

		return (
			<Container style={{backgroundColor: "#2D2B2C"}}>
				<Content>
					<Body style={{alignItems: "center", marginTop: 50, marginBottom: 40}}>
						<Image
							source={require("../../../../assets/argusotp-logo-white.png")}
							style={{height: 70, resizeMode: 'contain'}}
						/>
					</Body>
					<View padder>
						{loginForm}
					</View>

					<View style={{margin: 16, marginBottom: 8}}>
						<Button rounded block onPress={() => onLogin()} style={{backgroundColor: "white"}}>
							<Text style={{color: "#2D2B2C", fontWeight: "bold"}}>로그인</Text>
						</Button>
					</View>


				</Content>
				<KeyboardAvoidingView
					// behavior={null}
					// keyboardVerticalOffset={60}
					style={{ backgroundColor: "#2D2B2C" }}>
					<View padder style={{ backgroundColor: "#60B0F4", borderTopLeftRadius: 30, borderTopRightRadius: 30, height: settingMode ? 525 : 65 }}>
						<Button transparent block info onPress={() => this.setState({ settingMode : !settingMode })}>
							<Text style={{ color: "white", fontWeight: "bold" }}>
								{ settingMode ? "닫기" : "설정" }
							</Text>
						</Button>
						{
							settingMode ?
								<>
									{ settingForm }
									<View style={{  marginHorizontal: 8, marginTop: 8 }}>
										<Button rounded block onPress={() => { this.setState({ settingMode: false }); onSave();}} style={{ backgroundColor: "#2D2B2C" }}>
											<Text style={{ color: "white", fontWeight: "bold" }}>저장</Text>
										</Button>
									</View>
								</>
								: null
						}

					</View>
				</KeyboardAvoidingView>

			</Container>

		);
	}
}

export default Login;
