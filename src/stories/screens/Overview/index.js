import * as React from "react";
import { Container, Header, Title, Content, Text, H2, Button, Icon, Left, Right, Body, Card, CardItem, Grid, Col, Row } from "native-base";

// import { PieChart, Pie, Legend, Cell, Tooltip, ResponsiveContainer, Sector,
//   Label, LabelList } from 'recharts';
import { scaleOrdinal, schemeCategory10 } from 'd3-scale';

// import {
//   LineChart,
//   BarChart,
//   PieChart,
//   ProgressChart,
//   ContributionGraph
// } from 'react-native-chart-kit';

import PureChart from 'react-native-pure-chart';
import Sparkline from 'react-native-sparkline';

import styles from "./styles";
export interface Props {
	navigation: any;
}
export interface State {}
class Overview extends React.Component<Props, State> {
	render() {
		const param = this.props.navigation.state.params;
    const colors = scaleOrdinal(schemeCategory10).range();
    const data = [
      { name: 'Seoul', population: 21500000, color: 'rgba(131, 167, 234, 1)', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      { name: 'Toronto', population: 2800000, color: '#F00', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      { name: 'Beijing', population: 527612, color: 'red', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      { name: 'New York', population: 8538000, color: '#ffffff', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      { name: 'Moscow', population: 11920000, color: 'rgb(0, 0, 255)', legendFontColor: '#7F7F7F, legendFontSize: 15' }
    ];
    const data01 = [
      { name: 'Group A', value: 400, v: 89 },
      { name: 'Group B', value: 300, v: 100 },
      { name: 'Group C', value: 200, v: 200 },
      { name: 'Group D', value: 200, v: 20 },
      { name: 'Group E', value: 278, v: 40 },
      { name: 'Group F', value: 189, v: 60 },
    ];

    const data2 = Array.from({ length: 20 }).map(
      (unused, i) => i + (i + 1) * Math.random()
    )
    let sampleData = [
      {
        seriesName: 'series1',
        data: [
          {x: '2018-02-01', y: 30},
          {x: '2018-02-02', y: 200},
          {x: '2018-02-03', y: 170},
          {x: '2018-02-04', y: 250},
          {x: '2018-02-05', y: 10},
          {x: '2018-02-06', y: 10},
          {x: '2018-02-07', y: 10},
          {x: '2018-02-08', y: 10},
          {x: '2018-02-09', y: 10},
          {x: '2018-02-10', y: 10},
          {x: '2018-02-11', y: 10}
        ],
        color: '#297AB1'
      },
      {
        seriesName: 'series2',
        data: [
          {x: '2018-02-01', y: 20},
          {x: '2018-02-02', y: 100},
          {x: '2018-02-03', y: 140},
          {x: '2018-02-04', y: 550},
          {x: '2018-02-05', y: 40},
          {x: '2018-02-06', y: 20},
          {x: '2018-02-07', y: 20},
          {x: '2018-02-08', y: 20},
          {x: '2018-02-09', y: 20},
          {x: '2018-02-10', y: 20},
          {x: '2018-02-11', y: 20}
        ],
        color: 'red'
      }
    ];
    let sampleData2 = [
      {
        value: 50,
        label: 'Marketing',
        color: colors[50 % 10],
      }, {
        value: 40,
        label: 'Sales',
        color: colors[40 % 10],
      }, {
        value: 25,
        label: 'Support',
        color: colors[25 % 10],
      }

    ];

    return (
			<Container style={styles.container}>
				<Header>
					<Left>
						<Button transparent onPress={() => this.props.navigation.goBack()}>
							<Icon name="ios-arrow-back" />
						</Button>
					</Left>

					<Body style={{ flex: 3 }}>
						<Title>{param ? param.name.item.caption : "Overview"}</Title>
					</Body>

					<Right />
				</Header>

				<Content padder>
					{/*<Text>{param !== undefined ? param.name.item.caption : "Create Something Awesome . . ."}</Text>*/}
          <Grid>
            <Row>
              <Col>
                <Card>
                  <CardItem header>
                    <Text>사용 현황</Text>
                  </CardItem>
                  <CardItem>
                    {/*<Text> 123/256 </Text>*/}
                    {/*<PureChart data={sampleData2} type='pie' size={100} />*/}
                    {/*<PieChart*/}
                      {/*data={data}*/}
                      {/*width={150}*/}
                      {/*height={100}*/}
                      {/*chartConfig={{*/}
                        {/*backgroundColor: '#ffffff',*/}
                        {/*backgroundGradientFrom: '#ffffff',*/}
                        {/*backgroundGradientTo: '#ffffff',*/}
                        {/*color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`*/}
                      {/*}}*/}
                      {/*accessor="population"*/}
                      {/*bgColor="#ffffff"*/}
                      {/*// paddingLeft="15"*/}
                    {/*/>*/}
                    {/*<PieChart width={100} height={100}>*/}
                      {/*<Legend />*/}
                      {/*<Pie*/}
                        {/*data={data01}*/}
                        {/*dataKey="value"*/}
                        {/*cx={50}*/}
                        {/*cy={50}*/}
                        {/*startAngle={180}*/}
                        {/*endAngle={0}*/}
                        {/*outerRadius={80}*/}
                        {/*label*/}
                      {/*>*/}
                        {/*{*/}
                          {/*data01.map((entry, index) => (*/}
                            {/*<Cell key={`slice-${index}`} fill={colors[index % 10]}/>*/}
                          {/*))*/}
                        {/*}*/}
                        {/*<Label value="test" position="outside" />*/}
                        {/*<LabelList position="outside" />*/}
                      {/*</Pie>*/}
                    {/*</PieChart>*/}
                  </CardItem>
                </Card>
              </Col>
              <Col>
                <Card>
                  <CardItem header>
                    <Text>동시 사용자 수</Text>
                  </CardItem>
                  <CardItem>
                    <Body>
                      {/*<Text note>동시 사용자수</Text>*/}
                      <Grid>
                        <Row>
                          <H2>133</H2>
                          <Right>
                            <Text note>/ 300</Text>
                          </Right>
                        </Row>
                        <Row>
                          <Sparkline data={data2} width={100} >
                            <Sparkline.Line />
                            <Sparkline.Fill />
                            <Sparkline.Spots />
                            <Sparkline.Band />
                          </Sparkline>
                        </Row>
                      </Grid>
                    </Body>
                  </CardItem>
                </Card>
              </Col>
            </Row>
            <Row>
              <Card>
                <CardItem>
                  <PureChart data={sampleData} type='line' height={200} />
                </CardItem>
              </Card>
            </Row>
            <Row>
              <Card>
                <CardItem>
                  <PureChart data={sampleData} type='bar' height={200} />
                </CardItem>
              </Card>
            </Row>
          </Grid>
				</Content>
			</Container>
		);
	}
}

export default Overview;
