import * as Expo from "expo";
import * as Font from "expo-font";
import * as React from "react";
import { Provider } from "mobx-react";
import { StyleProvider, Toast } from "native-base";
import { Root } from "native-base";

import App from "../App";
import getTheme from "../theme/components";
import variables from "../theme/variables/platform";

export default function(stores) {
	return class Setup extends React.Component {
		state: {
			isReady: boolean,
		};
		constructor() {
			super();
			this.state = {
				isReady: false,
			};
		}

		componentWillMount() {
			this.loadFonts();
		}

		async loadFonts() {
			await Font.loadAsync({
				// Roboto: require("native-base/Fonts/Roboto.ttf"),
				Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
				// Ionicons: require("@expo/vector-icons/fonts/Ionicons.ttf"),
			});

			this.setState({ isReady: true });
		}

		render() {
			if (!this.state.isReady) {
				return <Expo.AppLoading />;
			}
			return (
				<StyleProvider style={getTheme(variables)}>
					<Provider {...stores}>
						<Root>
							<App />
						</Root>
					</Provider>
				</StyleProvider>
			);
		}
	};
}
