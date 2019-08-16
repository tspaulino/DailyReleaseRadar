/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  Linking,
  Text,
  Image
} from 'react-native';

import {
  Header,
  Button,
  Container,
  Content,
  Body,
  Card,
  CardItem
} from 'native-base'
import { authorize, profile, requestToken, fetchAllReleases, fetchAllArtists } from './src/api'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      accessData: null,
      artists: null,
      profile: null,
      releases: null,
      filtered: false
    }
    this.handleUserToken = this.handleUserToken.bind(this)
    this.fetchArtists = this.fetchArtists.bind(this)
    this.fetchProfile = this.fetchProfile.bind(this)
    this.fetchNewReleases = this.fetchNewReleases.bind(this)
  }

  componentDidMount() {
    Linking.addEventListener('url', this.handleUserToken)
  }

  componentDidUpdate() {
    const {
      artists,
      releases,
      filtered
    } = this.state
    if (!filtered && artists && releases) {
      const filteredReleases = releases.filter((album, index) => album.artists
        .map((artist) => artist.id)
        .some((artistId) => artists.includes(artistId))
      ).sort((a, b) => new Date(a.release_date) < new Date(b.release_date))
      this.setState({ filtered: true, releases: filteredReleases })
    }
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleUserToken)
  }

  handleUserToken(event) {
    requestToken(event, (data) => {
      this.setState({ accessData: data })
      this.fetchProfile()
      this.fetchArtists()
    })
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
        this.setState({ artists: data })
        this.fetchNewReleases()
      })
    }
  }

  fetchNewReleases() {
    const { access_token, artists } = this.state.accessData
    const params = {
      q: 'tag:new',
      type: 'album',
      limit: 50
    }
    if (access_token) {
      fetchAllReleases(access_token, params, (data) => this.setState({ releases: data }))
    }

  }

  displayName() {
    const { profile } = this.state
    return `Welcome, ${profile.display_name}`
  }

  albumName(album) {
    return `${album.name} - ${album.release_date}`
  }

  render() {
    const { profile, artists, releases } = this.state
    return (
      <Container>
        {!profile &&
          <Button onPress={authorize}>
            <Text>Sign up with Spotify</Text>
          </Button>
        }
        {profile &&
          <Header>
            <Body>
              <Text>{this.displayName()}</Text>
            </Body>
          </Header>
        }
        {artists && releases &&
          <Content style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
            {releases.map((album, index) =>
              <Card key={index} style={{ width: '48%' }}>
                <CardItem cardBody>
                  {/* <Image source={{ uri: album.images[album.images.length - 1].url }} style={{ flex: 1 }} /> */}
                </CardItem>
                <CardItem>
                  <Body>
                    <Text>{this.albumName(album)}</Text>
                  </Body>
                </CardItem>
              </Card>
            )}
          </Content>
        }
      </Container >
    );
  }
}

export default App;
