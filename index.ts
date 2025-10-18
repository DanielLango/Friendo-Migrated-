import "@expo/metro-runtime";
import './utils/global-error-handler';
import './polyfills';
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
