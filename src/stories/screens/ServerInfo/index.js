import * as React from "react";
import { Container, Header, Title, Content, Text, Button, Icon, Left, Right, Body, List, ListItem, H1, Card, CardItem, View } from "native-base";
import Sparkline from 'react-native-sparkline';
import axios from 'axios';
import OTP from 'otp-client'

export interface Props {
	navigation: any;
}
export interface State {}
class ServerInfo extends React.Component<Props, State> {

  componentDidMount() {
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
