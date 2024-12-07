![ViewCount](https://hits.sh/github.com/war100ck/blade-soul-game-launcher.svg?style=flat-square)

![Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)![Dev.to blog](https://img.shields.io/badge/dev.to-0A0A0A?style=for-the-badge&logo=dev.to&logoColor=white)![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)

# Blade & Soul Game Launcher

![Blade & Soul Game Launcher](https://raw.githubusercontent.com/war100ck/blade-soul-game-launcher/main/screen/launcher.png)
<p align="center">
<img src="https://raw.githubusercontent.com/war100ck/blade-soul-game-launcher/main/screen/launch.gif" alt="Start Launcer" width="1000px">
</p>

This project is a launcher for the game **Blade & Soul**, designed for connecting to a private game server. The launcher provides users with an intuitive interface for registration, login, and server connection settings.

## ⚠️ Important Note

This launcher is **designed to work only with specific API servers**, which can be downloaded from the following links:

- [BnS-Api-Server (2020)](https://github.com/war100ck/BnS-Api-Server)  
- [Server-Api-BnS (2017)](https://github.com/war100ck/Server-Api-BnS-2017)


## Table of Contents

- [Screenshots](#screenshots)
- [Key Features](#key-features)
- [Requirements](#requirements)
- [Installation](#installation)
  - [For Developers](#for-developers-if-you-want-to-build-the-launcher-manually)
  - [Skip the Build Step](#-skip-the-build-step)
- [Usage](#usage)
  - [Initial Setup Instructions](#initial-setup-instructions)
  - [Configuration](#configuration)
  - [Registration and Login](#registration-and-login)
  - [Starting the Game](#starting-the-game)
  - [Social Media](#social-media)
- [File Structure](#file-structure)
- [Encryption](#encryption)
- [Notifications](#notifications)
- [Dependencies](#dependencies)
- [Latest Release](#latest-release)
- [License](#license)

## Screenshots

<details>
<summary>Click to see more screenshots</summary>

![1.](https://raw.githubusercontent.com/war100ck/blade-soul-game-launcher/main/screen/1.png)

![2.](https://raw.githubusercontent.com/war100ck/blade-soul-game-launcher/main/screen/2.png)

![3.](https://raw.githubusercontent.com/war100ck/blade-soul-game-launcher/main/screen/3.png)

</details>

## Key Features

- **User Registration & Login**: Allows users to create an account and sign in to the game using a secure registration and login system.
- **Configuration Management**: Users can configure server IP addresses and choose between 32-bit or 64-bit architectures for the game client.
- **Data Encryption**: Sensitive data, such as registration information, is encrypted using AES-256-CBC before being saved to disk.
- **Notifications**: Toastr notifications provide feedback to users for various actions like saving settings, registration success, and errors.
- **Server Connectivity Check**: Users can verify server availability by checking the IP address directly from the launcher.
- **Game Version Display**: The launcher displays the current version of the game client upon successful loading.
- **Platform Compatibility**: The launcher can switch between 32-bit and 64-bit game client architectures.
- **Social Links Integration**: Social media icons allow users to open external links directly from the launcher.

## Requirements

- **Node.js**
- **Electron**
- **npm** (Node Package Manager)

## Installation

### For Developers (If you want to build the launcher manually):

1. Clone the repository:

    ```bash
    git clone https://github.com/war100ck/blade-soul-game-launcher.git
    cd blade-soul-game-launcher
    ```

2. Ensure you have all necessary dependencies installed, including Node.js and npm. Before building the launcher, run the following command to install all required packages:

    ```bash
    npm install
    ```

3. Build the launcher using the command:

    ```bash
    npm run build
    ```

---

### 🎉 Skip the Build Step!

If you prefer not to build the launcher manually, you can download the pre-built version from the [Releases section](https://github.com/war100ck/blade-soul-game-launcher/releases) and proceed to [step 6](#file-transfer) in the installation instructions to complete the setup and start using the launcher.

---    

### Note on File Size Optimization

*To reduce the size of the launcher files and improve loading times, it is recommended to compress JavaScript, CSS, HTML, and all image files before building the launcher. This process not only minimizes the file size but also enhances the overall performance of the launcher by speeding up resource loading. Utilizing tools like UglifyJS for JavaScript, CSSNano for CSS, and image optimization tools can help achieve significant reductions in file sizes without compromising quality.*

4. After building, the project release will be located in the folder:

    ```
    blade-soul-game-launcher/release/win-unpacked/
    ```

5. In this folder, you will find the executable file **BNS_Launcher.exe**.

<a name="file-transfer"></a>
6. **File Transfer**: Copy the following files to the Blade & Soul game folder:

```
Blade & Soul game folder
│
├── BIN/                     # folder with 32-bit game files
│   ├── (game files)         # executable files and libraries are located here
│
├── BIN64/                   # folder with 64-bit game files
│   ├── (game files)         # 64-bit versions of executable files and libraries are located here
│
├── ────────────────────────────────
│
│   # Game Launcher Files
│
├── locales/                 # folder with localization files
│   ├── en-US.pak            # localization for English (US)
│   ├── ru-RU.pak            # localization for Russian
│   ├── de-DE.pak            # localization for German
│   ├── fr-FR.pak            # localization for French
│   └── (other localization files)  # translation files for the game
│
├── resources/               # folder with game resources
│   ├── app.asar             # archive containing the application code and game resources
│   └── (other resources)     # various game resources such as graphics and sound files
│
├── BNS_Launcher.exe         # executable file for the game launcher
│
├── chrome_100_percent.pak   # resource package for the user interface
│
├── chrome_200_percent.pak   # resource package for the user interface (high resolution)
│
├── d3dcompiler_47.dll       # Direct3D library for shader compilation
│
├── ffmpeg.dll               # library for audio and video processing
│
├── icudtl.dat               # ICU (International Components for Unicode) data
│
├── libEGL.dll               # OpenGL ES library for graphics management
│
├── libGLESv2.dll            # OpenGL ES 2.0 library
│
├── LICENSE.electron.txt     # license for Electron
│
├── LICENSES.chromium.html    # licenses for Chromium
│
├── resources.pak            # resource package for the game
│
├── snapshot_blob.bin        # binary file with snapshots of the state
│
├── v8_context_snapshot.bin   # snapshot of the V8 context state
│
├── vk_swiftshader.dll       # library for software implementation of Vulkan
│
├── vk_swiftshader_icd.json  # configuration file for SwiftShader
│
└── vulkan-1.dll             # library for Vulkan API
```

## Usage

### Initial Setup Instructions

Follow these steps for the initial setup of the Blade & Soul Game Launcher:

1. **File Transfer**: After building the launcher, copy the contents from the `blade-soul-game-launcher/release/win-unpacked/` folder to your Blade & Soul game directory.

2. **Launch the Launcher**: Open the **BNS_Launcher.exe** file to start the launcher.

3. **Open the Settings Panel**:
   - Click on the settings icon in the top bar to access the configuration panel.

4. **Configure Server Settings**:
   - Enter the IP address of the Blade & Soul private server in the designated field.
   - Click the **Check Connection** button to verify server availability.

5. **Select Game Architecture**:
   - Choose your desired game architecture (32-bit or 64-bit) from the options provided.

6. **Save Configuration**:
   - After entering the server IP and selecting the architecture, click the **Save Configuration** button to apply the changes.
   - **Note**: This step only needs to be done once, prior to the first launch of the game.

7. **Restart the Launcher**:
   - Close the launcher and reopen it to refresh the configuration with your new settings.

8. **User Registration**:
   - Click on the registration icon in the top bar to open the registration panel.
   - Fill in the required fields (nickname, email, and password) and complete the registration process.

9. **Start the Game**:
   - After successful registration or if you already have an account, log in using your credentials.
   - Click the **Play** button to launch the Blade & Soul game client.

By following these steps, you will ensure that the launcher is correctly configured for your game experience.

### Configuration

Upon first launch, the user can configure the following settings:

- **Server IP**: The IP address of the Blade & Soul private server.
- **Architecture**: Select between 32-bit (`x32`) or 64-bit (`x64`) game client.

These settings are saved to a configuration file (`config.json`), which can be found in the `data` folder of the launcher directory. If the folder does not exist, it will be created automatically.

### Registration and Login

- **Registration**: Users can register a new account by providing a nickname, email, and password. The registration data is encrypted and saved locally.
- **Login**: After registering, users can log in with their email and password to start the game.

### Starting the Game

After configuring the settings and logging in, users can launch the game by clicking the "Play" button. The launcher sends a signal to start the Blade & Soul client using the selected configuration (32-bit or 64-bit).

### Social Media

Users can access social media or external links by clicking on the provided icons. These links will open in the user's default web browser.

## File Structure

- **`script.js`**: The core functionality of the launcher is implemented in this file. It handles encryption, configuration management, user registration, and server communication.
- **`data/config.json`**: Stores the user's configuration (e.g., server IP and client architecture).
- **`data/data.json`**: Stores encrypted user registration data (nickname, email, and password).

## Encryption

The launcher uses AES-256-CBC encryption to secure sensitive information like user registration data. The key for encryption is derived from a predefined secret using the `crypto.scryptSync` method, and the data is encrypted before being saved locally.

## Notifications

The launcher utilizes **Toastr** for displaying notifications to users. These notifications inform the user of events such as:

- Successful configuration saves
- Registration and login successes or failures
- Errors during any process

## Dependencies

This project uses the following Node.js modules:

- **electron**: Used for building cross-platform desktop apps.
- **fs**: Node.js built-in module for file system operations.
- **path**: Node.js built-in module for handling file and directory paths.
- **crypto**: Node.js built-in module for cryptographic functions.
- **toastr**: Library for displaying non-blocking notifications.

### Latest Release

You can find the latest version of the Blade & Soul Game Launcher at the [releases page](https://github.com/war100ck/blade-soul-game-launcher/releases). This page includes all available versions.

*Note: The game server for this launcher can be downloaded from https://github.com/war100ck/BnS-Api-Server - 2020 or https://github.com/war100ck/Server-Api-BnS-2017 - 2017.*

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Discussion on Blade & Soul Game API Server + Game Launcher

For further information and discussions related to the **Blade & Soul Game API Server** and **Game Launcher**, visit the active discussion on the forum:

[Discussion on RageZone](https://forum.ragezone.com/threads/blade-soul-game-api-server-game-launcher.1234817/)

Here you will find project details, exchange of experiences, and solutions to various technical issues related to the setup and launch of the Blade & Soul API server.

