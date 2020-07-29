import * as React from "react";
import { Container, Header, Title, Content, Text, Button, Icon, Row, Left, Right, Body, List, ListItem, H1, Card, CardItem, View } from "native-base";
import Sparkline from 'react-native-sparkline';
import axios from 'axios';
import OTP from 'otp-client';
import {AsyncStorage, Image} from "react-native";
// import styles from "./styles";
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
    const { navigation, mainStore, ver } = this.props;

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

					<Right>
            <Button transparent onPress={() => this.props.navigation.navigate("Setting")}>
              <Icon name="ios-cog" style={{fontSize: 30}}/>
            </Button>
          </Right>
				</Header>

        <Content padder style={{backgroundColor: "white"}}>
          {/*<Card>*/}
          {/*  <CardItem>*/}

              <List>
                <ListItem itemDivider>
                  <Text>User Information</Text>
                </ListItem>
                <ListItem>
                  <Body>
                    <Text>ID</Text>
                  </Body>
                  <Right style={{ flex: 1 }}>
                    <Text note>{mainStore.userToken.userId}</Text>
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
                    <Text note>{mainStore.serverToken.otpServerIp}</Text>
                  </Right>
                </ListItem>
                <ListItem>
                  <Body>
                    <Text>Port</Text>
                  </Body>
                  <Right style={{ flex: 1 }}>
                    <Text note>{mainStore.serverToken.otpServerPort}</Text>
                  </Right>
                </ListItem>

                {/*<ListItem>*/}
                {/*  <Body>*/}
                {/*  <Text>SCode</Text>*/}
                {/*  </Body>*/}
                {/*  <Right style={{ flex: 1 }}>*/}
                {/*    <Text note>{JSON.stringify(mainStore.serverToken)}</Text>*/}
                {/*  </Right>*/}
                {/*</ListItem>*/}

                <ListItem>
                  <Body>
                  <Text>Period</Text>
                  </Body>
                  <Right style={{ flex: 1 }}>
                    <Text note>{mainStore.serverToken.period}</Text>
                  </Right>
                </ListItem>
                <ListItem>
                  <Body>
                  <Text>Digits</Text>
                  </Body>
                  <Right style={{ flex: 1 }}>
                    <Text note>{mainStore.serverToken.digits}</Text>
                  </Right>
                </ListItem>
                <ListItem itemDivider>
                  <Text>App Information</Text>
                </ListItem>
                <ListItem>
                  <Body>
                  <Text>Version</Text>
                  </Body>
                  <Right style={{ flex: 1 }}>
                    <Text note>v{ver}</Text>
                  </Right>
                </ListItem>
              </List>

          {/*    </CardItem>*/}
          {/*</Card>*/}
          {/*<View padder>*/}
            {/*<Button block info onPress={() => this.props.navigation.navigate("Setting")}>*/}
              {/*<Text>Server Setting</Text>*/}
            {/*</Button>*/}
          {/*</View>*/}
				</Content>
			</Container>
		);
	}
}

export default ServerInfo;
