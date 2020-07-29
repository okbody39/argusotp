import * as React from "react";
import Lock from "../../stories/screens/Lock";
import Constants from 'expo-constants';

export interface Props {
	navigation: any,
}
export interface State {}
export default class LockContainer extends React.Component<Props, State> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      version: "",
    };

  }

  componentDidMount() {
    const {version} = Constants.manifest;

   this.setState({
     version: version
   });
  }

	render() {
		return <Lock navigation={this.props.navigation} ver={this.state.version}/>;
	}
}
