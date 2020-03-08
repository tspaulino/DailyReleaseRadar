/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react'
import {
  Linking,
  Text,
  Image,
  View,
  ScrollView
} from 'react-native'

import {
  DataTable
} from 'react-native-paper'

import Header from './src/components/Header'

import { profile, fetchAllReleases, fetchAllArtists } from './src/api'


class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      artists: null,
      profile: null,
      releases: null
    }
    this.fetchArtists = this.fetchArtists.bind(this)
    this.fetchProfile = this.fetchProfile.bind(this)
    this.fetchNewReleases = this.fetchNewReleases.bind(this)
    this.linkToAlbum = this.linkToAlbum.bind(this)
  }

  fetchProfile() {
    const { access_token } = this.state.accessData
    if (access_token) {
      profile(access_token, (data) => this.setState({ profile: data }))
    }
  }

  fetchArtists() {
    const { access_token } = this.state.accessData
    if (access_token) {
      fetchAllArtists(access_token, (data) => {
        console.log(data)
        this.setState({ artists: data })
        this.fetchNewReleases()
      })
    }
  }

  fetchNewReleases() {
    const { access_token } = this.state.accessData
    const { artists } = this.state
    const params = {
      q: 'tag:new',
      type: 'album',
      limit: 50
    }
    console.log(access_token)
    if (access_token) {
      fetchAllReleases(access_token, params, artists, (data) => {
        const newReleases = data.sort((a, b) => Date.parse(b.release_date) - Date.parse(a.release_date))
        this.setState({ releases: newReleases })
      })
    }
  }

  displayArtistsName(artists) {
    if (artists.length == 1)
      return artists[0].name
    return artists.map((artist) => artist.name).join(' feat. ')
  }

  linkToAlbum(album) {
    Linking.openURL(album.external_urls.spotify)
  }

  render() {
    const { profile } = this.props
    return (
      <View style={{ flex: 1 }}>
        {profile &&
          <Header profile={profile} />
        }
        {profile && !releases &&
          <View style={{ flex: 2, justifyContent: 'center', alignContent: 'center' }}>
            <Text style={{ textAlign: 'center' }}>Please wait while we match the last releases from your favorite artists...</Text>
            <ActivityIndicator animating={true} />
          </View>
        }
        {artists && releases &&
          <ScrollView>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Title</DataTable.Title>
                <DataTable.Title>Artist</DataTable.Title>
                <DataTable.Title>Release Date</DataTable.Title>
              </DataTable.Header>
              {releases.map((album, index) =>
                <DataTable.Row key={index} onPress={() => this.linkToAlbum(album)}>
                  <DataTable.Cell>
                    {album.name}
                  </DataTable.Cell>
                  <DataTable.Cell>
                    {this.displayArtistsName(album.artists)}
                  </DataTable.Cell>
                  <DataTable.Cell>
                    {album.release_date}
                  </DataTable.Cell>
                </DataTable.Row>
              )}
            </DataTable>
          </ScrollView>
        }
      </ View >
    );
  }
}

export default App;
