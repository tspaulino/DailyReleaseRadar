import React, { Component } from 'react'
import { Appbar } from 'react-native-paper'


export default class Header extends Component {

    displayName() {
        const { profile } = this.props
        return `Welcome, ${profile.display_name}`
    }

    render() {
        return (
            <Appbar>
                <Appbar.Content title={this.displayName()} />
            </Appbar>
        )
    }
}