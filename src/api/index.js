import { Linking } from 'react-native'
import axios from 'axios'
import { Buffer } from 'buffer'
import qs from 'querystring'


const SPOTIFY_CLIENT_ID = 'd1d6570d415c4a0d95213a47d03aedc8'
const SPOTIFY_CLIENT_SECRET = 'ed3dfe6b5d734c88951ae8790e172936'
export const CALLBACK_URL = 'daily-me://auth/callback'
const SCOPES = 'playlist-read-private'

export function authorize() {
    const params = {
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: 'user-read-email user-follow-read user-library-read',
        redirect_uri: CALLBACK_URL
    }
    const spotifyAuthURL = `https://accounts.spotify.com/authorize?${qs.stringify(params)}`
    Linking.openURL(spotifyAuthURL)
}

export function requestToken(codeUrl, callback) {
    const code = codeUrl.url.split('code=')[1]
    const params = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: CALLBACK_URL
    }

    const base64EncodedToken = new Buffer(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
    axios.post('https://accounts.spotify.com/api/token', qs.stringify(params), {
        headers: {
            'Authorization': `Basic ${base64EncodedToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then((res) => {
            console.log('Success', res)
            callback(res.data)
        })
        .catch((err) => {
            console.log(`ERROR`, err)
            callback(err)
        })
}

export function followingArtists(token, callback) {
    axios.get('https://api.spotify.com/v1/me/following?type=artist', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then((res) => {
            console.log('Success', res)
            callback(res.data)
        })
        .catch((err) => {
            console.log('Error', err)
            callback(err)
        })
}

export function profile(token, callback) {
    axios.get('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then((res) => {
        console.log('Success', res.data)
        callback(res.data)
    })
}

export function fetchAllReleases(token, params, callback) {
    let allResults = []
    const searchUrl = `https://api.spotify.com/v1/search?${qs.stringify(params)}`
    const fetchResults = (url, token) => {
        return axios.get(`${url}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then((res) => {
            if (res.data.albums.items)
                allResults = allResults.concat(res.data.albums.items)
            if (res.data.albums.next) {
                return fetchResults(res.data.albums.next, token)
            }
            else {
                return allResults
            }
        }).catch((err) => console.log('Error:', err))
    }
    fetchResults(searchUrl, token, callback).then((data) => callback(data))
}

export function fetchAllArtists(token, callback) {
    let allResults = []
    const searchUrl = `https://api.spotify.com/v1/me/following?type=artist&limit=50`
    const fetchResults = (url, token) => {
        return axios.get(`${url}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then((res) => {
            if (res.data.artists.items)
                allResults = allResults.concat(res.data.artists.items)
            if (res.data.artists.next) {
                return fetchResults(res.data.artists.next, token)
            }
            else {
                return allResults
            }
        }).catch((err) => console.log('Error:', err))
    }
    fetchResults(searchUrl, token, callback).then((data) => {
        console.log(data.map((artist, index) => artist.id))
        callback(data.map((artist, index) => artist.id))
    })
}