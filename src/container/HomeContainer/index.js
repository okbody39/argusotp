import * as React from "react";
import { observer, inject } from "mobx-react";

import Home from "../../stories/screens/Home";

@inject("mainStore")
@observer
export default class HomeContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { mainStore, navigation } = this.props;

    return <Home navigation={navigation} mainStore={mainStore} />;

  }
}
