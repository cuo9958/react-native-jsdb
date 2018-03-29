'use strict';

import { AsyncStorage } from 'react-native';

exports.getItem = async (key) => {
    let item = await AsyncStorage.getItem(key);
    if (!item) {
        return null;
    }
    return JSON.parse(item).v || null;
}

exports.setItem = async (key, value) => {
    let item = JSON.stringify({
        v: value
    });
    return await AsyncStorage.setItem(key, item);
}

exports.removeItem = async (key) => await AsyncStorage.removeItem(key);

exports.removeItems = async (keys) => await AsyncStorage.multiRemove(keys);

exports.allKeys = async () => await AsyncStorage.getAllKeys();

exports.getlist = async (keys) => {
    let list = await AsyncStorage.multiGet(keys);
    list = list.map(item => JSON.parse(item[1]).v || null);
    return list;
}


