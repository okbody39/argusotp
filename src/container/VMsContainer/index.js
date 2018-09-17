// @flow
import * as React from "react";
import VMs from "../../stories/screens/VMs";
export interface Props {
	navigation: any,
}
export interface State {}
export default class VMsContainer extends React.Component<Props, State> {
	render() {
		return <VMs navigation={this.props.navigation} />;
	}
}
