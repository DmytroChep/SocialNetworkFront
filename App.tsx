import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { ICONS } from './src/shared/icons';
import { SettingsIcon } from './src/shared/icons/settings';
import { Header } from './src/shared/ui/Header/header';

export default function App() {
  return (
    <View style={styles.container}>
      <ICONS.home />
      <ICONS.people />
      <ICONS.chat />
      <ICONS.eye />
      <ICONS.checkbox />
      <ICONS.exit />
      <ICONS.image />
      <ICONS.plus/>
      <ICONS.settings/>
      
      <Header/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
