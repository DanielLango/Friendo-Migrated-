import "@expo/metro-runtime";
import './utils/global-error-handler';
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);