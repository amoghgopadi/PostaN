import AsyncStorage from '@react-native-async-storage/async-storage';

// STORAGE KEYS
const globalPostStorageKey = "@StorageKeyGlobalPost"
const hotpostStorageKey = "@StorageKeyHotPost"
const followingPostStorageKey = "@StorageKeyFlwPost"
const recentPostStorageKey = "@StorageKeyRecentPost"
const profileStorageKey = "@StorageKeyProfile"

export const setGlobalPost = async (value) => {
    try {
        
        const jsonValue = JSON.stringify(getLatestPost(value))
       
        await AsyncStorage.setItem(globalPostStorageKey, jsonValue)
      } catch (e) {
        // saving error
      }
}

export const getGlobalPost = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(globalPostStorageKey)

        return jsonValue != null ? JSON.parse(jsonValue) : null;
      } catch(e) {
        // error reading value
      }
}


export const setHotPost = async (value)=> {
    try {
        const jsonValue = JSON.stringify(getLatestPost(value))
  
        await AsyncStorage.setItem(hotpostStorageKey, jsonValue)
      } catch (e) {
        // saving error
      }
}

export const getHotPost = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(hotpostStorageKey)

        return jsonValue != null ? JSON.parse(jsonValue) : null;
      } catch(e) {
        // error reading value
      }
}

export const setFollowingPost = async (value)=> {
    try {
        const jsonValue =JSON.stringify(getLatestPost(value))
        await AsyncStorage.setItem(followingPostStorageKey, jsonValue)
      } catch (e) {
        // saving error
      }
}

export const getFollowingPost = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(followingPostStorageKey)
        return jsonValue != null ? JSON.parse(jsonValue) : null;
      } catch(e) {
        // error reading value
      }
}




export const setRecentPost = async (value)=> {
    try {
        const jsonValue = JSON.stringify(getLatestPost(value))
        await AsyncStorage.setItem(recentPostStorageKey, jsonValue)
      } catch (e) {
        // saving error
      }
}

export const getRecentPost = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(recentPostStorageKey)
        return jsonValue != null ? JSON.parse(jsonValue) : null;
      } catch(e) {
        // error reading value
      }
}

export const setProfile = async (value)=> {
  try {
      const jsonValue = JSON.stringify(getLatestPost(value))
      await AsyncStorage.setItem(profileStorageKey, jsonValue)
    } catch (e) {
      // saving error
    }
}

export const getProfile = async () => {
  try {
      const jsonValue = await AsyncStorage.getItem(profileStorageKey)
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
      // error reading value
    }
}

getLatestPost = (value) => {
    if(value.length > 9){
        return value.slice(Math.max(arr.length - 10, 0))
    }
    return value 
}
