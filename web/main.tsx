/// <reference types="vite/client" />
import 'react-native-gesture-handler';
import { AppRegistry, type RootTag } from 'react-native';

import { name as appName } from '../app.json';
import { env } from '../src/core/env';
import App from '../src/app/App';

import './index.css';

const label = document.getElementById('stage-label');
if (label) label.textContent = `Lagnaa mobile · ${env.apiBaseUrl}`;

const rootTag = document.getElementById('root');
if (!rootTag) throw new Error('Missing #root');

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  rootTag: rootTag as unknown as RootTag,
  initialProps: {},
});
