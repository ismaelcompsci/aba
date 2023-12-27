# aba
[Audiobookshelf](https://github.com/advplyr/audiobookshelf) react native client


### Patches
- **react-native-wagmi-charts**
    - https://github.com/coinjar/react-native-wagmi-charts/pull/151
- **react-native-webview**
    - custom patch that opens a UIMenuController on ios and a ActionMode on android

### Todo's
- [ ] Offline mode
- [ ] fix view jumping around on orientation change
- [ ] better android support

- [ ] fix in book reader when switching to previous chapter and then switching scroll view it goes to start of chapter

- [ ] better audioplayer
    - [x] better seeking
    - [x] better fast forwarding
    - [x] play from chapter

- [ ] better tts

- [x] fix performance when change epub reader settings ex. (changing font size)
- [ ] move book annotations to sql database

- [ ] better playlist implementation
    - [ ] show playlist in the audioplayer
    - [x] play one after the other
    - [ ] movable playlist rows

- [x] add server info
- [x] lazy render audio player

- [x] Implement socket updates
    - [x]  change the refresh user hook to a socket update

- [ ] fix unnecessary rerenders when we get a user update from the socket

- [ ] better error handleing for requests
    - [ ] show toast on error for all request



