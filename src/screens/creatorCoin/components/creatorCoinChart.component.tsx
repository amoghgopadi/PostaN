import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { CreatorCoinTransaction } from '@types';
import { VictoryArea, VictoryAxis, VictoryChart, VictoryScatter, VictoryTooltip } from 'victory-native';
import { themeStyles } from '@styles/globalColors';
import { formatNumber, isPortrait } from '@services/helpers';
import Svg, { Defs, LinearGradient, Stop } from 'react-native-svg';
import { globals } from '@globals/globals';

interface Props {
    publicKey: string;
    currentCoinPrice: number;
    creatorCoinTransactions: CreatorCoinTransaction[];
}

interface State {
    aggregatedDate: { x: number, y: number }[];
    currentScreenDimension: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export class CreatorCoinChartComponent extends React.Component<Props, State> {

    private _isInitiallyPortrait = true;

    private _isMounted = false;

    constructor(props: Props) {
        super(props);

        const aggregateData = this.aggregateData();
        const data: { x: number, y: number }[] = [];
        for (let i = 0; i < aggregateData.length; i++) {
            data.push({ x: i, y: aggregateData[i] });
        }

        if (this.props.currentCoinPrice != null) {
            data.push({ x: data.length, y: this.props.currentCoinPrice });
        }

        this.state = {
            aggregatedDate: data,
            currentScreenDimension: screenWidth,
        };

        if (globals.isDeviceTablet) {
            this.init = this.init.bind(this);
            this.init();
            Dimensions.addEventListener(
                'change',
                () => {
                    let currentScreenDimension = isPortrait() ? screenWidth : screenHeight;
                    if (!this._isInitiallyPortrait) {
                        currentScreenDimension = isPortrait() ? screenHeight : screenWidth;
                    }
                    if (this._isMounted) {
                        this.setState({ currentScreenDimension });
                    }
                }
            );
        }
    }

    componentDidMount(): void {
        this._isMounted = true;
    }

    componentWillUnmount(): void {
        this._isMounted = false;
    }

    shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
        return nextProps.creatorCoinTransactions.length !== this.props.creatorCoinTransactions.length ||
            this.state.currentScreenDimension !== nextState.currentScreenDimension;
    }

    private init(): void {
        let currentScreenDimension = screenWidth;
        if (!isPortrait()) {
            this._isInitiallyPortrait = false;
            currentScreenDimension = screenHeight;
        }
        if (this._isMounted) {
            this.setState({ currentScreenDimension });
        }
    }

    private aggregateData(): number[] {
        const coinPricePerDayMap: { [key: string]: number[] } = {};

        for (const coinPrice of this.props.creatorCoinTransactions) {
            const timeStampInMilliseconds = coinPrice.timeStamp * 1000;
            const date = new Date(timeStampInMilliseconds);

            const key = '_' + date.getFullYear() + date.getMonth() + date.getDate() + Math.floor(date.getHours() / 8);

            if (coinPricePerDayMap[key]) {
                coinPricePerDayMap[key].push(coinPrice.coinPrice);
            } else {
                coinPricePerDayMap[key] = [coinPrice.coinPrice];
            }
        }

        const keys = Object.keys(coinPricePerDayMap);

        const result = [];

        for (const key of keys) {
            const average = this.getAverage(coinPricePerDayMap[key]);
            result.push(average);
        }

        return result;
    }

    private getAverage(p_numbers: number[]): number {
        let sum = 0;

        for (const number of p_numbers) {
            sum += number;
        }

        return sum / p_numbers.length;
    }

    render(): JSX.Element {
        return <View style={[styles.container, themeStyles.containerColorMain]}>
            <Svg>
                < VictoryChart
                    width={this.state.currentScreenDimension}
                    standalone={false}
                    padding={{ left: 0, top: 10, bottom: 0, right: 32 }}
                    domainPadding={{ x: [0, 5], y: [0, 40] }}
                    theme={
                        {
                            axis: {
                                style: {
                                    tickLabels: {
                                        fill: themeStyles.fontColorSub.color
                                    }
                                }
                            }
                        }
                    }
                >
                    <Defs>
                        <LinearGradient id="gradientStroke"
                            x1="0%"
                            x2="0%"
                            y1="0%"
                            y2="100%"
                        >
                            <Stop offset="0%" stopColor="#1E93FA" stopOpacity="1" />
                            <Stop offset="75%" stopColor="#1E93FA" stopOpacity="0" />
                        </LinearGradient>
                    </Defs>
                    <VictoryAxis
                        style={{
                            grid: { strokeWidth: 0 },
                            axis: { stroke: 'transparent' },
                            ticks: { stroke: 'transparent' },
                            tickLabels: { fill: 'transparent' }
                        }} />
                    <VictoryAxis
                        dependentAxis
                        style={{
                            grid: { strokeWidth: 0 },
                            axis: { stroke: 'transparent' },
                            tickLabels: { fontFamily: 'Arial', fontSize: 12 }
                        }}
                        domainPadding={1000}
                        orientation={'right'}
                        tickFormat={p_value => formatNumber(p_value, false)}
                    />
                    <VictoryArea
                        animate={{
                            duration: 2000,
                            onLoad: { duration: 1000 }
                        }}
                        style={{ data: { stroke: '#0061a8', strokeWidth: 1.3, fillOpacity: 0.1, fill: 'url(#gradientStroke)' } }}
                        padding={0}
                        data={this.state.aggregatedDate}
                    />
                    <VictoryScatter
                        size={15}
                        labels={({ datum }) => datum.y.toFixed(2)}
                        labelComponent={
                            <VictoryTooltip
                                dy={-12}
                                flyoutPadding={6}
                                flyoutStyle={{ stroke: 'none', backgroundColor: 'black', fill: themeStyles.containerColorSub.backgroundColor }}
                                renderInPortal={false} />
                        }
                        style={{
                            data: { stroke: 'none', strokeWidth: 2, fillOpacity: 0.1, fill: 'none' },
                            labels: { fill: themeStyles.fontColorMain.color, fontFamily: 'Arial' }
                        }}
                        padding={0}
                        data={this.state.aggregatedDate}
                    />
                </VictoryChart>
            </Svg>
        </View>;
    }
}

const styles = StyleSheet.create(
    {
        container: {
            alignItems: 'center',
            justifyContent: 'center',
            height: 300,
            paddingBottom: 10,
            marginRight: 20,
        }
    }
);
