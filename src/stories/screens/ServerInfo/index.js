import * as React from "react";
import { Container, Header, Title, Content, Text, Button, Icon, Left, Right, Body, List, ListItem, H1, Card, CardItem, View } from "native-base";
import Sparkline from 'react-native-sparkline';
import axios from 'axios';
import OTP from 'otp-client';
import {AsyncStorage} from "react-native";

export interface Props {
	navigation: any;
}
export interface State {}
class ServerInfo extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    // this.state = {
    //   period: 60,
    //   digits: 6,
    // };
  }
  componentDidMount() {
    // AsyncStorage.getItem("@ApiKeysStore:period", (err, result) => {
    //   if (err) {
    //     return;
    //   }
    //   this.setState({period: parseInt(result)});
    // });
    //
    // AsyncStorage.getItem("@ApiKeysStore:digits", (err, result) => {
    //   if (err) {
    //     return;
    //   }
    //   this.setState({digits: parseInt(result)});
    // });
  }

	render() {
    const { navigation, settingForm, loginForm } = this.props;

		return (
			<Container>
				<Header>
					<Left>
						<Button transparent onPress={() => navigation.goBack()}>
							<Icon name="ios-arrow-back" />
						</Button>
					</Left>

					<Body style={{ flex: 3 }}>
						<Title>Detail Inform.</Title>
					</Body>

					<Right />
				</Header>

        <Content padder>
          <Card>
            <List>
              <ListItem itemDivider>
                <Text>User Information</Text>
              </ListItem>
              <ListItem>
                <Body>
                <Text>ID</Text>
                </Body>
                <Right style={{ flex: 1 }}>
                  <Text note>{loginForm.userId}</Text>
                </Right>
              </ListItem>
              <ListItem itemDivider>
                <Text>OTP Server Information</Text>
              </ListItem>
              <ListItem>
                <Body>
                  <Text>IP</Text>
                </Body>
                <Right style={{ flex: 1 }}>
                  <Text note>{settingForm.otpServerIp}</Text>
                </Right>
              </ListItem>
              <ListItem>
                <Body>
                  <Text>Port</Text>
                </Body>
                <Right style={{ flex: 1 }}>
                  <Text note>{settingForm.otpServerPort}</Text>
                </Right>
              </ListItem>
              <ListItem>
                <Body>
                <Text>SCode</Text>
                </Body>
                <Right style={{ flex: 1 }}>
                  <Text note>{settingForm.encKey}</Text>
                </Right>
              </ListItem>
              <ListItem>
                <Body>
                <Text>Period</Text>
                </Body>
                <Right style={{ flex: 1 }}>
                  <Text note>{settingForm.period}</Text>
                </Right>
              </ListItem>
              <ListItem>
                <Body>
                <Text>Digits</Text>
                </Body>
                <Right style={{ flex: 1 }}>
                  <Text note>{settingForm.digits}</Text>
                </Right>
              </ListItem>
            </List>
          </Card>
          <View padder>
            <Button block info onPress={() => this.props.navigation.navigate("Setting")}>
              <Text>Server Setting</Text>
            </Button>
          </View>
				</Content>
			</Container>
		);
	}
}

export default ServerInfo;
