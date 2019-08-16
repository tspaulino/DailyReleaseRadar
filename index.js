/**
 * @format
 */

import React from 'react'
import { AppRegistry } from 'react-native';
import AppContainer from './AppContainer';
import { name as appName } from './app.json';

const prefix = 'daily-me://'

const MainApp = () => <AppContainer uriPrefix={prefix} />

AppRegistry.registerComponent(appName, () => MainApp);
