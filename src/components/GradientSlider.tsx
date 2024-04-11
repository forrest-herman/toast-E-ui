import BigSlider from './BigSlider';
import LinearGradient from 'react-native-linear-gradient';

import Octicon from 'react-native-vector-icons/Octicons';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome6';
import {View} from 'react-native';

const GradientSlider = ({
  inputValue,
  width = 140,
  height = '90%',
  onValueChangeFn = () => {
    return;
  },
  showIcons = true,
  showLabel = true,
  horizontal = false,
  readOnly = false,
}) => {
  return (
    <View style={{width: width, height: height}}>
      <LinearGradient
        colors={['#240d02', '#5e2d16', '#edb985']}
        angle={-90}
        useAngle={horizontal}
        style={{
          flex: 1,
          paddingLeft: 15,
          paddingRight: 15,
          borderRadius: 25,
        }}>
        {showIcons && (
          <>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: horizontal ? 'center' : 'flex-start',
                alignItems: horizontal ? 'flex-end' : 'center',
              }}>
              <AwesomeIcon
                name={'fire-flame-curved'}
                size={40}
                color={`rgba(255, 255, 255, ${inputValue / 100 + 0.1})`}
                style={{
                  padding: 10,
                }}
              />
            </View>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: horizontal ? 'center' : 'flex-end',
                alignItems: horizontal ? 'flex-start' : 'center',
              }}>
              <Octicon
                name={'flame'}
                size={20}
                color={`rgba(255, 255, 255, ${1 - inputValue / 100 + 0.1})`}
                style={{
                  padding: 10,
                }}
              />
            </View>
          </>
        )}
        <BigSlider
          style={{width: '100%', height: '100%'}}
          onValueChange={onValueChangeFn}
          showLabel={showLabel}
          // trackStyle={{backgroundColor: 'rgba(143, 255, 160, .1)'}}
          maximumValue={100}
          minimumValue={0}
          value={inputValue}
          horizontal={horizontal}
          readOnly={readOnly}
        />
      </LinearGradient>
    </View>
  );
};

export default GradientSlider;
