// @flow
import * as React from "react";
import Overview from "../../stories/screens/Overview";
export interface Props {
	navigation: any,
}
export interface State {}
export default class OverviewContainer extends React.Component<Props, State> {
	render() {
		return <Overview navigation={this.props.navigation} />;
	}
}
