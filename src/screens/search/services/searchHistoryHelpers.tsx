import { constants } from '@globals/constants';
import { globals } from '@globals/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SearchHistoryProfile } from '@types';

function sortHistory(searchHistory: SearchHistoryProfile[], profile: SearchHistoryProfile): SearchHistoryProfile[] {
    return searchHistory.sort(
        (a: SearchHistoryProfile, b: SearchHistoryProfile) => a.PublicKeyBase58Check === profile.PublicKeyBase58Check ? -1 : b.PublicKeyBase58Check === profile.PublicKeyBase58Check ? 1 : 0);
}

export async function updateSearchHistory(profile: SearchHistoryProfile): Promise<void> {
    const historyProfilesObj: any = {};
    const key = `${globals.user.publicKey}_${constants.localStorage_searchHistoryProfiles}`;
    try {
        const historyProfilesJson = await AsyncStorage.getItem(key);
        if (historyProfilesJson) {
            const historyProfiles = JSON.parse(historyProfilesJson);
            if (historyProfiles) {
                for (let i = 0; i < historyProfiles.length; i++) {
                    historyProfilesObj[historyProfiles[i].PublicKeyBase58Check] = historyProfiles[i];
                }
            }
            const profileExists = historyProfilesObj[profile.PublicKeyBase58Check]?.PublicKeyBase58Check === profile?.PublicKeyBase58Check;
            let newSearchHistoryProfiles = historyProfiles;
            if (!profileExists) {
                newSearchHistoryProfiles = [profile, ...historyProfiles];
                if (historyProfiles.length > 7) {
                    historyProfiles?.splice(historyProfiles?.length - 1);
                    newSearchHistoryProfiles = historyProfiles;
                    newSearchHistoryProfiles?.unshift(profile);
                }
            }

            const newHistoryProfiles = sortHistory(newSearchHistoryProfiles, profile);
            const newSearchHistoryProfilesJson = JSON.stringify(newHistoryProfiles);
            await AsyncStorage.setItem(key, newSearchHistoryProfilesJson);
        } else {
            const newSearchHistoryProfilesJson = JSON.stringify([profile]);
            await AsyncStorage.setItem(key, newSearchHistoryProfilesJson);
        }
    } catch { }
}

export async function updateCloutTagHistory(clouttag: string): Promise<void> {

    const key = `${globals.user.publicKey}_${constants.localStorage_searchHistoryCloutTags}`;
    try {
        const historyCloutTagsJson = await AsyncStorage.getItem(key);
        if (historyCloutTagsJson) {
            const historyCloutTags = JSON.parse(historyCloutTagsJson);
            let newSearchHistoryCloutTags = historyCloutTags;
            if (!historyCloutTags.includes(clouttag)) {
                newSearchHistoryCloutTags = [clouttag, ...historyCloutTags];
                if (historyCloutTags.length > 7) {
                    historyCloutTags?.splice(historyCloutTags?.length - 1);
                    newSearchHistoryCloutTags = historyCloutTags;
                    newSearchHistoryCloutTags?.unshift(clouttag);
                }
            }
            const newHistoryCloutTags = newSearchHistoryCloutTags.sort((a: string, b: string) => a === clouttag ? -1 : b === clouttag ? 1 : 0);
            const newSearchHistoryProfilesJson = JSON.stringify(newHistoryCloutTags);
            await AsyncStorage.setItem(key, newSearchHistoryProfilesJson);
        } else {
            const newSearchHistoryProfilesJson = JSON.stringify([clouttag]);
            await AsyncStorage.setItem(key, newSearchHistoryProfilesJson);
        }
    } catch { }
}
