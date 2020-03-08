import React, { Component } from 'react'
import { View, Linking } from 'react-native'
import {
    ActivityIndicator,
    Button,
} from 'react-native-paper'

import { authorize, requestToken } from '../api'


export default class LoginScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            credentials: null
        }
        this.handleUserToken = this.handleUserToken.bind(this)
    }

    componentDidMount() {
        Linking.addEventListener('url', this.handleUserToken)
    }

    componentWillUnmount() {
        Linking.removeEventListener('url', this.handleUserToken)
    }

    handleUserToken(event) {
        const { navigate } = this.props.navigation
        requestToken(event, (data) => {
            this.setState({ credentials: data })
            navigate('Home')
        })
    }

    render() {
        const { credentials } = this.state
        return (
            <View style={{ flex: 2, justifyContent: 'center', alignContent: 'center' }}>
                {!credentials &&
                    <Button onPress={authorize}>
                        Sign up with Spotify
                    </Button>
                }
            </View>
        )
    }
}
