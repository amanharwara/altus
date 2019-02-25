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
- **Tray icon** so you can minimize the app completely and still receive notifications.
- **Multiple Account Support** As of v2.0, you can now use multiple WhatsApp accounts simultaneously!

### Planned Features

- [x] ~~**Theme Customizer** so you don't have to learn CSS to create themes~~
- [ ] **Inbuilt YouTube Video Preview** to view YouTube videos without having to open your browser
- [x] ~~**Multiple Account Support** to use multiple WhatsApp accounts simultaneously.~~
- [x] ~~**Tray Icon** so the app runs without you having to keep the window open~~

## Screenshots

### First Start
![Altus First Start](/img/Altus-First-Start.png)
### Add New WhatsApp Instance
![Altus Add Instance](/img/Altus-Add-Instance.png)
### Default WhatsApp Theme
![Altus Default Theme](/img/Altus-Default-Theme.png)
### Dark WhatsApp Theme
![Altus Dark Theme](/img/Altus-Dark-Theme.png)
### Custom WhatsApp Theme Example
![Altus Custom Theme](/img/Altus-Custom-Theme.png)


## Releases

To download the latest releases, you can [click here](https://github.com/ShadyThGod/altus/tree/rewrite-2.0/#latest-releases). Alternatively, you can visit the [releases page](https://github.com/ShadyThGod/altus/releases) on the repository or the [downloads page](https://shadythgod.github.io/downloads/) on my website for all the releases available.

---

### Installation :-

#### Windows

- Run the `.exe` file provided in the release. E.g.: `Altus-Setup-2.0.0.exe`
- If Windows displays a warning saying **'Windows protected your PC'**, click on **More info** and then click **Run Anyway**
- Once the Altus Setup starts, you will be asked to select from two choices which are **Anyone who uses this computer (all users)** and **Only for me (username)**
  - If you select **Anyone who uses this computer (all users)**, Altus will be installed to `C:\Program Files\Altus` and will be available for all the users on that machine.
  - If you select **Only for me (username)**, Altus will be installed to `C:\Users\(username)\AppData\Local\Programs\Altus` and will only be available for that user (username).
- Click **Install**. If it asks for admin privileges (UAC), click **Yes**
- The installation will Altus will be installed to the path according to what you selected. You can select **Run Altus** if you want to start Altus after closing the setup.

#### Linux

Installation will be different depending on your Linux distribution. You can download either of the Linux file available i.e. `altus-x.x.x-x86_64.AppImage` or `altus_x.x.x_amd64.deb` according to your distribution.

It is recommended you use the file with `.AppImage` extension as it an almost-universal file distribution format for linux which is very convenient. If you use the `AppImage` file you will not have to worry about what distribution you are using; you can just run the `AppImage` file and it will run the program.

If you have a Debian-based distribution like Ubuntu, you can use Debian-specific `.deb` file. On some distros like Ubuntu, you can just double-click to install the file or you can use `dpkg` to install it. E.g.: `sudo dpkg -i path\to\deb`

#### Mac

Mac packages will take more time to get released because I do not own a proper Mac and have to use a virtual machine to package the app. Installation for Mac is simple. All you have to do is open the provided `.dmg` file and once it is opened, drag the Altus icon into the "Applications" folder.

---

### Latest Releases:

#### Windows - v2.0.0 - Not available yet

#### Linux - v2.0.0 - Not available yet

#### MacOS - v2.0.0 - Not available yet

## For Developers

Altus is an open-source app and I really appreciate other developers adding new features and/or helping fix bugs. If you want to contribute to Altus, you can fork this repository, make the changes and create a pull request. You can check out [this tutorial](https://help.github.com/en/articles/creating-a-pull-request-from-a-fork) to learn how to create a pull request.

However, please make sure you follow a few rules listed below to ensure that your changes get merged into the main repo. The rules listed below are enforced to make sure the changes made are well-documented and can be easily kept track of.

- Make sure your pull request has a informative title. You should use prefixes like `ADD:`, `FIX:`, etc at the start of the title which describe the changes followed by a one-line description of the changes. Example: `ADD: Added a new feature to Altus`

- Your pull request's description should be in-depth. Make sure you document all the changes you made as in-depth and informative as possible. Dependency changes and major code changes must be thoroughly described and given priority in your description.

- Commits in your fork should be informative, as well. Make sure you don't combine too many changes into a single commit.

## Acknowledgements

Below is the list of the dependencies that helped me greatly to create this app.

#### clipboard.js [(zenorocha/clipboard.js)](https://github.com/zenorocha/clipboard.js) - used for copying generated CSS to the clipboard

---

#### custom-electron-titlebar [(AlexTorresSk/custom-electron-titlebar)](https://github.com/AlexTorresSk/custom-electron-titlebar) - used to create a custom titlebar instead of the plain titlebar that Electron has by default

---

#### electron-store [(sindresorhus/electron-store)](https://github.com/sindresorhus/electron-store) - used to store information of settings, tabs and themes

---

#### Mousetrap [(ccampbell/mousetrap)](https://github.com/ccampbell/mousetrap) - used for creating local shortcuts without registering accelerators
