<p align="center">
  <img src="https://github.com/user-attachments/assets/0a647523-00be-4b7d-a9f8-bbdb582b31ae" alt="App screenshot" width="128" />
</p>

### Quick Test Guide
- **Web**: https://notetaker.kfung.dev/
- **Mobile builds**: https://drive.google.com/file/d/165tnxlZbBVrrBrFSWOwFZZbPmolDdSEg/view
  - Please download this zip file (**File** ➔ **Download**)

Note:
  - iOS build is targeted for Simulators only (drag & drop to install)
  - Android apk file can be side-loaded on device, or be dragged & dropped onto emulators

### Development Setup Guide
**Prerequisites**
- Install pnpm, if not already available
  - `npm install -g pnpm@10`
- Mobile development tools to build & run apps
- To test microphone features, it is **highly recommend** that you test this on a physical device as simulators/emulators often have permission & connectivity issues or requiring resets of current macOS Privacy ➔ Microphone settings.

Then:
- Install dependencies
  - `pnpm install`
- To run the **web** version:
  - `pnpm dev` and launch the localhost address shown in terminal
- To run iOS version:
  - `pnpm build-and-sync`
  - `pnpm notetaker-ios`
    - You will be required to change the `Team` signing profile from Xcode, simply open `apps/notetaker/ios/App/App.xcodeproj` with Xcode and change the Team / name to your development account
- To run android version:
  - `pnpm build-and-sync`
  - `pnpm notetaker-android`
- To run tests:
  - `pnpm test`
- To run lint:
  - `pnpm lint`
- To simply build the web app:
  - `pnpm build`
  - ... and then the files will be located in `apps/notetaker/dist`

Alternatively you can open each mobile projects in Xcode and Android Studio to run and build manually. For Xcode, open `apps/notetaker/ios/App/NoteTaker.xcodeproj`. For Android, you can open the `apps/notetaker/android` folder within Android Studio.

### Project Overview
This project runs on multiple platforms using [Ionic Capacitor](https://capacitorjs.com/docs) as the PWA wrapper. Underneath, it is powered by [TanStack Router](https://tanstack.com/router/latest/docs/overview) for basic routing needs.

It is a simple note-taker app, allowing users to create/edit/delete notes with a title, description, as well as attaching an audio recording like a voice memo. If running on devices, the recording will also work with the screen off or with the app backgrounded.

In order to allow the audio recording to continue in the background, for iOS, I had to declare the app's `UIBackgroundModes` to `audio` in the `Info.plist` file. Android on the other hand, does not require special treatments to keep the recorder running in the background, other than the standard microphone permission.

This app also have a simple search function that will perform a string match to the note titles found in the local storage.

This app does not require internet connection, and all data is stored locally on the device. The audio input is captured as a `MediaStream` via `navigator.mediaDevices.getUserMedia()`, which is fed into a `MediaRecorder` that emits 1-second chunks through its `ondataavailable` event, converting each chunk to an `ArrayBuffer`. Each buffer is then written sequentially to `IndexedDB`'s (via `idb` dependency) chunks object store with a session ID and incrementing sequence number, and once recording stops, those chunks are sorted, finalized into a single recording, and the temporary chunks are cleaned up.

### NoteTaker PWA Architecture
```
src/                      # apps/notetaker/src
├── assets/              # Static SVG icons
├── common/              # Common UI/hooks location for the project
│   ├── Header/
│   ├── audioPlayer/
│   ├── timestamp/
│   ├── toast/
│   ├── uiShell/
│   ├── useAndroidBackButton/
│   ├── useNewNote/
│   └── voiceMemoDB/
├── components/          # UI components for this project
│   ├── ConfirmDeleteModal/
│   ├── NoteListItem/
│   └── Toast/
├── constants/           # Constant values used throughout the project
├── features/            # Larger React components holding app features
│   ├── audioRecorder/
│   ├── noteView/
│   ├── notesForm/
│   ├── notesListing/
│   └── search/
├── routes/              # Route definitions mapping URL paths to feature views
├── schemas/             # Data validation schemas for note objects
└── testSetups/          # Test runner configuration and setup files
```

This architecture enforces encapsulation of each modules into its own folder (some containing a `hooks` and `utils` folder within). And it is generally easier to maintain if we categorize the _purpose_ of each modules into a few major folders: `common`, `components`, and `features`.