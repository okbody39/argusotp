import * as React from "react";
import { Image, Platform } from "react-native";
import { Container, Header, Title, Content, Text, Button, Icon, Left, Right, Body, Card, CardItem, Row } from "native-base";

import styles from "./styles";
// import {Image} from "../Login";
// import pkg from "package";

export interface Props {
	navigation: any;
}
export interface State {}
class BlankPage extends React.Component<Props, State> {
	render() {
		const {ver} = this.props;
		return (
			<Container style={styles.container}>
				<Header>
					<Left>
						<Button transparent onPress={() => this.props.navigation.goBack()}>
							<Icon name="ios-arrow-back" />
						</Button>
					</Left>

					<Body style={{ flex: 3 }}>
						<Title>About</Title>
					</Body>

					<Right />
				</Header>

				<Content padder>
          <Card>
            <CardItem>
              <Body>
              <Image
                source={require("../../../../assets/logo-seedauth.png")}
                style={{width: 600 / 4, height: 172 / 4}}
              />
              <Text>
                SeedAuth Mobile is Mobile OTP(One-time password) App for SeedCloud and SeedVDI.
              </Text>
              </Body>

            </CardItem>
            <CardItem>
              <Row>
                <Right style={{flex: 3}}>
                  <Text note>Copyright 2018 DFOCUS Inc.</Text>
                </Right>
              </Row>
            </CardItem>
          </Card>
          <Row>
          <Right>
            <Text note style={{marginRight: 10}}>
              v{ver}
            </Text>
          </Right>
          </Row>
				</Content>
			</Container>
		);
	}
}

export default BlankPage;
