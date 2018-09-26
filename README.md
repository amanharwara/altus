# Altus

**Altus** is an Electron-based WhatsApp client that works on almost all of the desktop platforms, i.e., Windows, Mac and Linux.

![Altus Banner](/img/altus-banner.png)

The name **Altus** comes from the Latin adjective _altus_ meaning "high, deep, noble or profound". The name was actually suggested by one of my friends.

## Features

**Altus** uses the GitHub-produced Electron framework to wrap around WhatsApp Web and add extra features to it.

- **Native notification support** for all of the platforms.
- **Dark mode** for when you need to chill out your eyes in the night (or even in the day)
- **Custom Theme Support** If you know how to write CSS themes, you can create and use your own theme for WhatsApp.
- **Available for most desktop platforms** including Windows (7 or above), Linux and MacOS.

### Planned Features

- [ ] **Theme Customizer** so you don't have to learn CSS to create themes
- [ ] **Import/Export Settings** to import/export settings as JSON files
- [ ] **Inbuilt YouTube Video Preview** to view YouTube videos without having to open your browser
- [ ] **Multiple Account Support** to use multiple WhatsApp accounts simultaneously.

## Screenshots

![Altus](/img/altus.png)

![altus-dark-mode](/img/altus-dark-mode.png)

![altus-custom-theme-window](/img/altus-custom-theme.png)

![altus-preferences](/img/altus-preferences.png)

## Downloads

Downloads for any of the platforms are available on the [releases page](https://github.com/ShadyThGod/altus/releases/) on the [repository](https://github.com/ShadyThGod/altus). Help for installation regarding any of the platforms is provided below.

#### Windows

To install the app for Windows, simply run the setup which will probably be named as `Altus-Setup-x.x.x.exe` where *x.x.x* is the version number. The setup will guide you through your installation. Currently, the setup will add a shortcut to the desktop and the start menu and install to `C:\Program Files\Altus` or `C:\Users\(User)\AppData\Local\Programs\Altus` depending on what you select during the installation.

#### Linux

Installation will be different depending on your Linux distribution. You can download either of the Linux file available i.e. `altus-x.x.x-x86_64.AppImage` or `altus_x.x.x_amd64.deb` according to your distribution.

It is recommended you use the file with `.AppImage` extension as it an almost-universal file distribution format for linux which is very convenient. If you use the `AppImage` file you will not have to worry about what distribution you are using; you can just run the `AppImage` file and it will run the program.

If you have a Debian-based distribution like Ubuntu, you can use Debian-specific `.deb` file. On some distros like Ubuntu, you can just double-click to install the file or you can use `dpkg` to install it. E.g.: `sudo dpkg -i path\to\deb`

#### Mac

Mac packages will take more time to get released because I do not own a proper Mac and have to use a virtual machine to package the app. Installation for Mac is simple. All you have to do is install the provided `.dmg` file.

### For Developers

I use electron-builder to build and distribute my app. However, it is not included as a dependency in the source code. Once you maybe clone this repo and make whatever changes you want to the app, you will need to either install electron-builder as a dependency using `npm install electron-builder --save-dev` or globally using `npm install -g electron-builder`. If you install electron-builder globally, you can just use `build -wml` or `build --dir` to package the app.