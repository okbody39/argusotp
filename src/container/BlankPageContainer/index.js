import * as React from "react";
import BlankPage from "../../stories/screens/BlankPage";
import Expo, { Constants } from "expo";

export interface Props {
	navigation: any,
}
export interface State {}
export default class BlankPageContainer extends React.Component<Props, State> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      version: "",
    };

  }

  componentDidMount() {
    const {version} = Expo.Constants.manifest;

   this.setState({
     version: version
   });
  }

	render() {
		return <BlankPage navigation={this.props.navigation} ver={this.state.version}/>;
	}
}
