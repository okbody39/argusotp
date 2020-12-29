import * as React from "react";
import { Image, Platform } from "react-native";
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
			<Container>
				<Content style={{ backgroundColor: "#2D2B2C" }}>
					<Body style={{ alignItems: "center", marginTop: 50, marginBottom: 40 }}>
						<Image
							source={require("../../../../assets/argusotp-logo-white.png")}
							style={{ height: 70,  resizeMode: 'contain' }}
						/>
					</Body>
					<View padder>
						{ loginForm }
					</View>

					<View style={{ margin: 16, marginBottom: 8 }}>
						<Button rounded block onPress={() => onLogin()} style={{ backgroundColor: "white" }}>
							<Text style={{ color: "#2D2B2C", fontWeight: "bold" }}>Login</Text>
						</Button>
					</View>


				</Content>

				<View padder style={{ backgroundColor: "#2D2B2C" }}>
					<View padder style={{ backgroundColor: "#60B0F4", borderTopLeftRadius: 30, borderTopRightRadius: 30, height: settingMode ? 480 : 65 }}>
						<Button transparent block info onPress={() => this.setState({ settingMode : !settingMode })}>
							<Text style={{ color: "white", fontWeight: "bold" }}>
								{ settingMode ? "Close" : "Setting" }
							</Text>
						</Button>
						{
							settingMode ?
								<>
									{ settingForm }
									<View style={{  marginHorizontal: 8, marginTop: 8 }}>
										<Button rounded block onPress={() => { this.setState({ settingMode: false }); onSave();}} style={{ backgroundColor: "#2D2B2C" }}>
											<Text style={{ color: "white", fontWeight: "bold" }}>Save</Text>
										</Button>
									</View>
								</>
								: null
						}

					</View>
				</View>

			</Container>

		);
	}
}

export default Login;
