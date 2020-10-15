import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { Props } from '@base/types/SignUpNavigation';

export default function useLocation({ navigation }: Props) {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

  useEffect(() => {
    const requestAndGetLocation = async () => {
      const { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('가게 등록을 위해서는 위치 권한이 필요합니다.');
        navigation.goBack();
      }

      const curLocation = await Location.getCurrentPositionAsync({});
      setLocation(curLocation);
    };

    requestAndGetLocation();
  }, [navigation]);

  return location;
}
