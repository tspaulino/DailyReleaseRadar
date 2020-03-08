import { createAppContainer, createStackNavigator } from 'react-navigation'
import App from './App'
import LoginScreen from './src/components/LoginScreen'


export default AppContainer = createAppContainer(createStackNavigator(
    {
        Home: App,
        Login: LoginScreen
    }, {
        initialRouteName: 'Login'
    }
))