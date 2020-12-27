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

const platform = Platform.OS;
const _DEFAULT_KEY_ = "MyScret-YESJYHAN";

@inject("settingForm", "mainStore")
@observer
class Login extends React.Component {
	constructor(props) {
		super(props);

		const { settingForm } = this.props;

		this.state = {
			settingMode: false,
			serverIp: settingForm.serverToken.otpServerIp || "",
			serverPort: settingForm.serverToken.otpServerPort || "",
		}
	}

	onSave() {
		const { settingForm, mainStore } = this.props;
		const { serverIp, serverPort } = this.state;

		if (serverIp && serverPort) {
			axios.get("http://" + serverIp + ":" + serverPort + "/otp/encryptKey", {
				crossdomain: true,
			}).then(res => {
				const result = res.data;
				let jsonText = decrypt(result, _DEFAULT_KEY_);

				let jsonObj = JSON.parse(jsonText);

				// alert(jsonText);

				settingForm.serverToken.otpServerIp = serverIp;
				settingForm.serverToken.otpServerPort = serverPort;
				settingForm.serverToken.encKey = jsonObj.encKey;

				let saveServerInfo = {
					otpServerIp: serverIp,
					otpServerPort: serverPort,
					encKey: jsonObj.encKey,
				};

				mainStore.saveServerStore(saveServerInfo).then(() => {
					try {
						mainStore.resetUserStore();
						// navigation.dispatch(resetAction);
						// alert(JSON.stringify(settingForm.serverToken));
					} catch(e) {
						// alert(JSON.stringify(e));
					}
					this.setState({
						settingMode: false,
					});
				});

			}).catch(err => {
				Toast.show({
					text: "OTP Server error!",
					duration: 2000,
					position: "top",
					type: "danger",
					textStyle: { textAlign: "center" },
				});
			});
		} else {
			Toast.show({
				text: "Server IP or Port invalid!",
				duration: 2000,
				position: "top",
				type: "danger",
				textStyle: { textAlign: "center" },
			});
		}
	}

	render() {
		const { settingForm } = this.props;

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
						{this.props.loginForm}
					</View>

					<View style={{ margin: 16, marginBottom: 8 }}>
						<Button rounded block onPress={() => this.props.onLogin()} style={{ backgroundColor: "white" }}>
							<Text style={{ color: "#2D2B2C", fontWeight: "bold" }}>Login</Text>
						</Button>
					</View>


				</Content>

				<View padder style={{ backgroundColor: "#2D2B2C" }}>
					<View padder style={{ backgroundColor: "#60B0F4", borderTopLeftRadius: 30, borderTopRightRadius: 30, height: this.state.settingMode ? 480 : 65 }}>
						{/*<View style={{width: 80, height: 8, borderRadius: 5, backgroundColor: "lightgray"}}></View>*/}
						<Button transparent block info onPress={() => this.setState({settingMode : !this.state.settingMode})}>
							<Text style={{ color: "white", fontWeight: "bold" }}>Setting</Text>
						</Button>
						{
							this.state.settingMode ?
								<Form>
									<View style={{ marginHorizontal: 8, marginTop: 16, marginBottom: 8 }}>
										<Item rounded style={{ paddingLeft: 8, paddingTop: 0, backgroundColor: "white" }}>
											<Icon type={"FontAwesome"} active name="server" style={{ color: "lightgray" }} />
											<Input
												style={{ marginTop: -5}}
												placeholder="Server IP"
												placeholderTextColor="#c9c9c9"
												// keyboardType="numeric"
												value={ this.state.serverIp }
												onChangeText={ e => this.setState({serverIp: e}) }
											/>
										</Item>
									</View>
									<View style={{ marginHorizontal: 8, marginBottom: 8 }}>
										<Item rounded style={{ paddingLeft: 8, paddingTop: 0, backgroundColor: "white" }}>
											<Icon type={"FontAwesome"} active name="th-large" style={{ color: "lightgray" }} />
											<Input
												style={{ marginTop: -5}}
												placeholder="Server Port"
												placeholderTextColor="#c9c9c9"
												keyboardType="numeric"
												value={ this.state.serverPort }
												onChangeText={ e => this.setState({serverPort: e}) }
											/>
										</Item>
									</View>
									<View style={{  marginHorizontal: 8, marginTop: 8 }}>
										<Button rounded block onPress={() => this.onSave()} style={{ backgroundColor: "#2D2B2C" }}>
											<Text style={{ color: "white", fontWeight: "bold" }}>Save</Text>
										</Button>
									</View>
								</Form>
								: null
						}
					</View>
				</View>


				{/*<Footer style={{ backgroundColor: "#F8F8F8" }}>*/}
				{/*	<View style={{ alignItems: "center", opacity: 1, flexDirection: "row" }}>*/}
				{/*		/!*<View padder>*!/*/}
				{/*			/!*<Text style={{ color: "#000" }}>Copyright © DFOCUS All Rights Reserved.</Text>*!/*/}
				{/*		/!*</View>*!/*/}
				{/*		<Image*/}
				{/*			source={require("../../../../assets/dfocus-logo.jpg")}*/}
				{/*			style={{ width: 157 / 2, height: 53 / 2 }}*/}
				{/*		/>*/}
				{/*	</View>*/}
				{/*</Footer>*/}

			</Container>

		);
	}
}

export default Login;
