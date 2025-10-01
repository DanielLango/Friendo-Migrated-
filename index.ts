import "@expo/metro-runtime";
import './utils/global-error-handler';
import { AppRegistry } from 'react-native';
import App from './App';

// Register the app component
AppRegistry.registerComponent('main', () => App);
