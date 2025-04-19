# Altus

**Altus** is an Electron-based WhatsApp client with themes and multiple account support, available for Windows, Mac and Linux!

## Installation

### Windows

- Download the `.exe` file from the [latest release](https://github.com/amanharwara/altus/releases/latest)
- Run the file and follow the setup wizard

If you see a "Windows protected your PC" error, it's because Altus is not signed. If you have doubts you can verify the file is safe using something like VirusTotal or any other antivirus software.
To continue with the installation,

- Click on "More info"
- Click "Run anyway"

### macOS

- Download one of the `.dmg` files from [latest release](https://github.com/amanharwara/altus/releases/latest)
  - If you're on an Intel mac, download the regular `.dmg` file
  - If you're on an M-series mac, download the `-arm64.dmg` file
- Open the dmg file
- Drag the `Altus` icon onto the `Applications` icon as instructed

If you're on an M-series (i.e. arm) macOS, you'll need to run the following command, otherwise you'll get a `Altus is damaged and cannot be opened.` error.

```console
sudo xattr -d com.apple.quarantine /Applications/Altus.app
```

### Linux

- Download the `.AppImage` file from the [latest release](https://github.com/amanharwara/altus/releases/latest)
- Make sure it is executable by running `chmod +x ./Altus-*.AppImage` in the same directory
- Run the AppImage by either double-clicking it or running `./Altus-*.AppImage`

There are separate tools like [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) that make it easier to run the file and integrate it into your DE.

## Features

**Altus** uses the GitHub-produced Electron framework to wrap around WhatsApp Web and add extra features to it.

- **Multiple Account Support**: As of v2.0, you can use multiple WhatsApp accounts simultaneously!
- **Native notification support** for all of the platforms. Clicking the notification opens that specific chat!
- **Online Indicator**: Shows an indicator at the bottom-left corner of the chats that are online!
- **Dark mode** for when you need to chill out your eyes in the night (or even in the day)
- **Custom Theme Support**: Write your own CSS theme for WhatsApp or use the in-built Theme Customizer to create a new one just by picking colors!
- **Available for most desktop platforms** including Windows (7 or above), Linux and MacOS.
- **Tray icon** so you can minimize the app completely and still receive notifications.

## Feature Requests

In order to submit a feature request, create a [new issue](https://github.com/amanharwara/altus/issues/new) with the label `enhancement`.

Please make sure that you provide a helpful description of your feature request. If possible, try implementing the feature yourself by forking this repository and then creating a pull request.

## Screenshots

### First Start

![Altus First Start](./img/Altus-First-Start.png)

### Default Theme

![Altus Default Theme](./img/Altus-Default-Theme.png)

### "Dark Plus" Theme

![Altus Dark Theme](./img/Altus-Dark-Theme.png)

## Acknowledgements

Below is the list of the dependencies that helped me greatly to create this app.

#### Dark-Whatsapp [(vednoc/dark-whatsapp)](https://github.com/vednoc/dark-whatsapp) - used as the base for the dark theme. A really cool project, you should definitely check it out!

---

#### Inter [rsms/inter](https://github.com/rsms/inter) - The font used in Altus.

---

#### electron-store [(sindresorhus/electron-store)](https://github.com/sindresorhus/electron-store) - used to store information of settings, tabs and themes

## Contributors

Below is the list of contributors who have contributed to Altus by creating a feature or helping fix an issue.

#### [Melvin-Abraham](https://github.com/Melvin-Abraham) - Helped fix issues #55, #53

#### [Dylan McDougall](https://github.com/dmcdo) - PR #10 (Added feature - Confirmation Dialog on close)

#### [Dafnik](https://github.com/Dafnik) - PR #5 (Helped fix issue #4)

#### [Marcelo Zapatta](https://github.com/MarceloZapatta) - PR #77 (Fixed #23 by adding tray icon support on Linux)

#### [Maicol Battistini](https://github.com/maicol07) - PR #153 (Added Italian translation)

#### [Nicolás González Meneses](https://github.com/ngmoviedo) - PR #163 (Added Spanish translation)

#### [Hugo Rocha de Moura](https://github.com/hugorochaffs) - PR #185 (Added Portuguese(pt) translation)
