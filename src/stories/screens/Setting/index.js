import * as React from "react";
import { Image, Platform } from "react-native";
import { Container, Content, Header, Body, Title, Button, Text, View, Icon, Footer, Row, Left, Right } from "native-base";
import styles from "./styles";

export interface Props {
  settingForm: any,
	onSave: Function,
  navigation: any,
}

export interface State {}
class Setting extends React.Component<Props, State> {
	render() {
		return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon name="ios-arrow-back" />
            </Button>
          </Left>

          <Body style={{ flex: 3 }}>
          	<Title>Setting</Title>
          </Body>

          <Right />
        </Header>

				<Content padder>
					{this.props.settingForm}
					<View padder>
							<Button rounded block onPress={() => this.props.onSave()}>
								<Text>Save</Text>
							</Button>
					</View>
				</Content>
			</Container>
		);
	}
}

export default Setting;
