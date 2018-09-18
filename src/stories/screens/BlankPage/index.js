import * as React from "react";
import { Container, Header, Title, Content, Text, Button, Icon, Left, Right, Body, Card, CardItem } from "native-base";

import styles from "./styles";
export interface Props {
	navigation: any;
}
export interface State {}
class BlankPage extends React.Component<Props, State> {
	render() {
		const param = this.props.navigation.state.params;
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
            <CardItem header>
              <Text>SeedAuth Mobile</Text>
            </CardItem>
            <CardItem>
              <Body>
              <Text>
                SeedAuth Mobile is Mobile OTP(One-time password) App for SeedCloud and SeedVDI.
              </Text>
              </Body>
            </CardItem>
            <CardItem header>
              <Text>Copyright 2018 DFOCUS Inc.</Text>
            </CardItem>
          </Card>
				</Content>
			</Container>
		);
	}
}

export default BlankPage;
