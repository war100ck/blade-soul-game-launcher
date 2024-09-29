const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const ping = require('ping'); // Импорт модуля ping

// Функция для получения пути к папке data в зависимости от режима запуска
function getDataDirectory() {
  if (app.isPackaged) {
    // Для собранного приложения
    const exePath = app.getPath('exe');
    const exeDir = path.dirname(exePath);
    return path.join(exeDir, 'data');
  } else {
    // Для режима разработки
    return path.join(__dirname, 'data');
  }
}

// Указываем путь для кэша
function setCachePath() {
  const cachePath = path.join(getDataDirectory(), 'Cache'); // Используем функцию для получения пути
  app.setPath('cache', cachePath);
}

// Вызываем функцию для установки пути к кэшу
setCachePath();

const DATA_DIR = getDataDirectory();
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

function ensureConfigFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true }); // Создание директории, если она не существует
  }

  if (!fs.existsSync(CONFIG_FILE)) {
    const defaultConfig = {
      architecture: 'x32',
      serverIp: '127.0.0.1'
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), 'utf8');
  }
}

// Функция для получения пути к файлу Version.ini в зависимости от режима запуска
function getVersionFilePath() {
  if (app.isPackaged) {
    // Для собранного приложения
    const exePath = app.getPath('exe');
    const exeDir = path.dirname(exePath);
    return path.join(exeDir, 'BIN', 'Version.ini');
  } else {
    // Для режима разработки
    return path.join(__dirname, 'BIN', 'Version.ini');
  }
}

// Функция для чтения версии игры из файла Version.ini
function readGameVersion() {
  const versionFilePath = getVersionFilePath(); // Получаем правильный путь к файлу Version.ini
  try {
    const fileContent = fs.readFileSync(versionFilePath, 'utf8');
    const versionMatch = fileContent.match(/ProductVersion\s*=\s*(.*)/);
    if (versionMatch) {
      return versionMatch[1].trim();
    } else {
      console.error('Не удалось найти версию в файле Version.ini');
      return 'Unknown version';
    }
  } catch (error) {
    console.error('Ошибка при чтении файла Version.ini:', error);
    return 'Error reading version';
  }
}

function createWindow() {
  ensureConfigFile();

  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'src/views/js/preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    },
    titleBarStyle: 'hidden',
    resizable: false,
    maximizable: false,
    backgroundColor: '#000000',
    roundedCorners: false,
  });

  mainWindow.loadFile('src/views/index.html');

  // Открытие DevTools
  //mainWindow.webContents.openDevTools();

  mainWindow.webContents.session.clearCache().then(() => {
    console.log('Кэш очищен');
  }).catch((error) => {
    console.error('Ошибка при очистке кэша:', error);
    mainWindow.webContents.send('show-toast', { type: 'error', message: 'Error clearing cache.' });
  });

  ipcMain.on('window-control', (event, action) => {
    if (action === 'close') {
      mainWindow.close();
    } else if (action === 'minimize') {
      mainWindow.minimize();
    }
  });

  ipcMain.on('select-architecture', (event, architecture) => {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    config.architecture = architecture;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    mainWindow.webContents.send('show-toast', { type: 'success', message: `The architecture is set up: ${architecture}` });
  });

  ipcMain.on('update-server-ip', (event, serverIp) => {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    config.serverIp = serverIp;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    mainWindow.webContents.send('show-toast', { type: 'success', message: 'IP address updated' });
  });

  ipcMain.on('check-connection', async (event, serverIp) => {
    try {
      const { alive } = await ping.promise.probe(serverIp);
      if (alive) {
        mainWindow.webContents.send('show-toast', { type: 'success', message: `IP address ${serverIp} available` });
      } else {
        mainWindow.webContents.send('show-toast', { type: 'error', message: `IP address ${serverIp} unavailable` });
      }
    } catch (error) {
      console.error('Ошибка при проверке подключения:', error);
      mainWindow.webContents.send('show-toast', { type: 'error', message: 'Error checking connection' });
    }
  });

  ipcMain.on('launch-game', () => {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    const architecture = config.architecture || 'x32'; // Значение по умолчанию - x32
    const serverIp = config.serverIp || '127.0.0.1'; // Значение по умолчанию - 127.0.0.1

    console.log('Launching game with architecture:', architecture);

    // Замените имена файлов на реальные, так как они одинаковые
    const executable = 'Client.EXE'; // Используем одно имя файла для обеих архитектур
    const binFolder = architecture === 'x64' ? 'BIN64' : 'BIN'; // Выбор папки в зависимости от архитектуры
    const command = `start "" ".\\${binFolder}\\${executable}" /SessKey /LaunchByLauncher /LoginMode 2 /ProxyIP:${serverIp} -UnAttended`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error launching game:', error);
            mainWindow.webContents.send('show-toast', { type: 'error', message: `Game launch error: ${stderr || error.message}` });
            return; // Не закрываем лаунчер при ошибке
        }
        console.log('Game launched:', stdout);
        mainWindow.webContents.send('show-toast', { type: 'success', message: 'Game successfully launched..' });
        
        // Закрытие лаунчера после успешного запуска
        app.quit();
    });
});

  // Отправка версии игры в рендер-процесс после загрузки окна
  mainWindow.webContents.on('did-finish-load', () => {
    const gameVersion = readGameVersion();
    // Отправляем версию только после окончания загрузки
    mainWindow.webContents.send('load-complete');  // Отправка сигнала о завершении загрузки
    mainWindow.webContents.send('game-version', gameVersion);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
