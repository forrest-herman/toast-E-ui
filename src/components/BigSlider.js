/**
 * @providesModule %BigSlider
 * @flow
 */

import React, {Component} from 'react';
import {Animated, PanResponder, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default class BigSlider extends Component {
  static defaultProps = {
    value: 40,
    maximumValue: 100,
    minimumValue: 0,
    showLabel: true,
    onSlidingStart: () => {},
    onValueChange: () => {},
    onSlidingComplete: () => {},
  };

  constructor(props: Object) {
    super();
    this.state = {
      anchorValue: props.value,
      value: props.value,
      width: 150, // provisional value
      height: 100, // provisional value
    };

    this.range = props.maximumValue - props.minimumValue;
  }

  state: {
    anchorValue: number,
    value: number,
    width: number,
    height: number,
  };

  componentWillMount() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        this.props.onSlidingStart();
        this.setState({anchorValue: this.state.value});
      },
      onPanResponderMove: Animated.event([null, {}], {
        listener: this.handleSlide,
      }),
      onPanResponderRelease: () => {
        this.props.onSlidingComplete();
      },
    });
  }

  onLayout = ({nativeEvent}: Object) => {
    this.setState({
      width: nativeEvent.layout.width,
      height: nativeEvent.layout.height,
    });
  };

  slideTo = (value: number) => {
    this.setState({value});
  };

  handleSlide = (evt: Object, gestureState: Object) => {
    const {maximumValue, minimumValue} = this.props;
    const valueIncrement = (-gestureState.dy * this.range) / this.state.height;
    let nextValue = this.state.anchorValue + valueIncrement;
    nextValue = nextValue >= maximumValue ? maximumValue : nextValue;
    nextValue = nextValue <= minimumValue ? minimumValue : nextValue;

    this.props.onValueChange(nextValue);
    this.setState({value: nextValue});
  };

  panResponder: Object;
  range: number;

  render() {
    const value = this.state.value;
    const unitValue = (value - this.props.minimumValue) / this.range;

    return (
      <View
        onLayout={this.onLayout}
        style={[styles.container, this.props.style]}
        {...this.panResponder.panHandlers}>
        <View style={[styles.pendingTrack, {flex: 1 - unitValue}]} />
        {this.props.showLabel && (
          <View style={[styles.trackLabel, {position: 'absolute'}]}>
            <Text style={styles.trackLabelText}>
              {this.props.label || `${formatNumber(this.props.value)}%`}
            </Text>
          </View>
        )}
        <View style={[styles.track, {flex: unitValue}, this.props.trackStyle]}>
          <View style={styles.thumb} />
          {/* {this.props.renderLabel ? (
            this.props.renderLabel()
          ) : (
            <View style={styles.trackLabel}>
              <Text style={styles.trackLabelText}>
                {this.props.label || `${formatNumber(this.props.value)}%`}
              </Text>
            </View>
          )} */}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgb(241, 242, 247)',
    borderRadius: 12,
    overflow: 'hidden',
    // width: 120,
  },
  pendingTrack: {},
  track: {
    flex: 1,
    // backgroundColor: 'rgba(1, 160, 188, 0)',
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  trackLabel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackLabelText: {
    color: 'white',
    fontWeight: '600',
  },
  thumb: {
    backgroundColor: 'rgba(255,255,255,.7)',
    borderRadius: 25,
    height: 5,
    width: '80%',
    marginVertical: 6,
    alignSelf: 'center',
  },
});

function formatNumber(x) {
  return x.toFixed(1).replace(/\.?0*$/, '');
}
