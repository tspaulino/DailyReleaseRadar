import { Linking } from 'react-native'
import axios from 'axios'
import { Buffer } from 'buffer'
import qs from 'querystring'


const SPOTIFY_CLIENT_ID = 'd1d6570d415c4a0d95213a47d03aedc8'
const SPOTIFY_CLIENT_SECRET = 'ed3dfe6b5d734c88951ae8790e172936'
const SCOPES = 'playlist-read-private user-read-email user-follow-read user-library-read'
const BASE64_ENCODED_TOKEN = new Buffer(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
export const CALLBACK_URL = 'daily-me://auth/callback'

export function authorize() {
    const params = {
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: SCOPES,
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

    axios.post('https://accounts.spotify.com/api/token', qs.stringify(params), {
        headers: {
            'Authorization': `Basic ${BASE64_ENCODED_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then((res) => {
            callback(res.data)
        })
        .catch((err) => {
            console.log(`ERROR`, err)
            callback(err)
        })
}

export function profile(token, callback) {
    axios.get('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then((res) => {
        callback(res.data)
    })
}

export function fetchAllReleases(token, params, artists, callback) {
    let allResults = []
    const searchUrl = `https://api.spotify.com/v1/search?${qs.stringify(params)}`
    const fetchResults = (url, token) => {
        return axios.get(`${url}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then((res) => {
            if (res.data.albums.items.length) {
                allResults = allResults.concat(filteredReleases(res.data.albums.items, artists))
            }
            if (res.data.albums.next) {
                return fetchResults(res.data.albums.next, token)
            }
            else {
                return allResults
            }
        }).catch((err) => err)
    }
    fetchResults(searchUrl, token, callback).then((data) => callback(data))
}

export function fetchAllArtists(token, callback) {
    return fetchPaginatedContent('artists', 'https://api.spotify.com/v1/me/following', token, {
        type: 'artist',
        limit: '50'
    }).then((data) => callback(data.map((artist) => artist.id)))
}

function fetchPaginatedContent(type, url, token, params) {
    let allResults = []
    const initialUrl = `${url}?${qs.stringify(params)}`
    const fetchResults = (url, token) => {
        return axios.get(`${url}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then((res) => {
            if (res.data[type].items)
                allResults = allResults.concat(res.data[type].items)
            if (res.data[type].next) {
                return fetchResults(res.data[type].next, token)
            }
            else {
                return allResults
            }
        }).catch((err) => console.log('Error:', err))
    }
    return fetchResults(initialUrl, token).then((data) => data)
}

function filteredReleases(albums, artists) {
    return albums.filter((album) =>
        album.artists
            .map((artist) => artist.id)
            .some((id) => artists.includes(id))
    )
}