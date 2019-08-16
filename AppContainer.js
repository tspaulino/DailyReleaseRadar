import { createAppContainer, createStackNavigator } from 'react-navigation'
import App from './App'


export default AppContainer = createAppContainer(createStackNavigator({
    Home: { screen: App }
}))