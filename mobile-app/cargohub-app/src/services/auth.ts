import AsyncStorage from '@react-native-async-storage/async-storage';

export const logout = async () => {
  await AsyncStorage.removeItem('@cargohub_driver_token');
  await AsyncStorage.removeItem('@cargohub_mock_uid');
};
