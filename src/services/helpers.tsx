import { globals } from '@globals/globals';
import { Profile } from '@types';
import { Dimensions } from 'react-native';
import { api } from './api/api';

export function calculateDurationUntilNow(p_timeStampNanoSeconds: number): string {
    const milliseconds = p_timeStampNanoSeconds / 1000000;
    const durationUntilNowInMilliseconds = new Date().getTime() - milliseconds;
    const durationInMinutes = durationUntilNowInMilliseconds / 1000 / 60;
    const durationInSeconds = durationInMinutes * 60;

    if (durationInSeconds < 60) {
        return Math.floor(durationInSeconds) + 's';
    }

    if (durationInMinutes < 60) {
        return Math.floor(durationInMinutes) + 'm';
    }

    const durationInHours = durationInMinutes / 60;

    if (durationInHours < 24) {
        return Math.floor(durationInHours) + 'h';
    }

    const durationInDays = durationInHours / 24;

    return Math.floor(durationInDays) + 'd';
}

export function getCurrentTime(timeStampNanoSeconds: number): string {
    const milliseconds = timeStampNanoSeconds / 1000000;
    const date = new Date(milliseconds);
    let hours: string | number = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    hours = hours < 10 ? '0' + hours : hours;
    const am_pm = date.getHours() >= 12 ? 'PM' : 'AM';
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    return `${hours}:${minutes} ${am_pm}`;
}

export function getAnonymousProfile(p_publicKey: string) {
    const profile = {
        CoinEntry: {
            CoinWatermarkNanos: 0,
            CoinsInCirculationNanos: 0,
            CreatorBasisPoints: 0,
            DeSoLockedNanos: 0
        },
        Username: 'anonymous',
        PublicKeyBase58Check: p_publicKey,
        Description: '',
        ProfilePic: 'https://i.imgur.com/vZ2mB1W.png',
        CoinPriceDeSoNanos: 0,
    } as Profile;

    return profile;
}

export function checkProfilePicture(p_profile: Profile) {
    if (p_profile.ProfilePic === '/assets/img/default_profile_pic.png') {
        p_profile.ProfilePic = 'https://i.imgur.com/vZ2mB1W.png';
    }
}


export function formatNumber(p_number: number, p_includeDecimalPlaces = true, p_decimalPlaces = 2) {
    const number = p_number.toFixed(1).split('.');
    return p_includeDecimalPlaces ? number[0].replace(/(\d)(?=(\d\d)+\d$)/g, "$1,") + '.' + number[1] : number[0].replace(/(\d)(?=(\d\d)+\d$)/g, "$1,");
}

export function isNumber(p_value: any) {
    return !isNaN(p_value) &&
        !isNaN(parseFloat(p_value));
}

export function generatePostHashHex(): string {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 64; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export async function checkIsFollowedBack(publicKey: string): Promise<boolean> {
    const response = await api.checkFollowBack(publicKey, globals.user.publicKey).catch(() => { });
    return response.IsFollowing;
}

export function isPortrait(): boolean {
    const dim = Dimensions.get('window');
    return dim.height >= dim.width;
}
