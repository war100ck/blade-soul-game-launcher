const { ipcRenderer, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const toastr = require('toastr');

// Настройка toastr
toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": true,
  "positionClass": "toast-top-left custom-toast-position", // Добавляем пользовательский класс
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
};

// Настройки шифрования
const algorithm = 'aes-256-cbc';
// Пример ключа (должен быть длиной 32 байта)
const secretKey = crypto.scryptSync('my_secret_key', 'salt', 32); // Генерация ключа длиной 32 байта
const iv = crypto.randomBytes(16); // Инициализационный вектор

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decrypt(text) {
  const [ivHex, encryptedText] = text.split(':');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(ivHex, 'hex'));
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Функции для работы с конфигурацией
function getConfigFilePath() {
  // Если существует папка 'src', значит, мы в режиме разработки
  const isDev = fs.existsSync(path.join(__dirname, '..', '..'));

  if (isDev) {
    return path.join(process.cwd(), 'data', 'config.json');
  } else {
    return path.join(__dirname, 'data', 'config.json');
  }
}

function loadConfiguration() {
  const filePath = getConfigFilePath();
  console.log('Config file path:', filePath); // Для отладки
  if (fs.existsSync(filePath)) {
    const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    document.getElementById('architecture32').checked = config.architecture === 'x32';
    document.getElementById('architecture64').checked = config.architecture === 'x64';
    document.getElementById('serverIp').value = config.serverIp || '127.0.0.1';
  } else {
    console.warn('Config file does not exist.');
  }
}

function saveConfiguration() {
  const filePath = getConfigFilePath();

  // Убедитесь, что директория существует
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const config = {
    architecture: document.getElementById('architecture32').checked ? 'x32' : 'x64',
    serverIp: document.getElementById('serverIp').value
  };

  try {
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
    toastr.success('Configuration saved. Please restart the launcher to apply the settings.'); // Уведомление при успешном сохранении
  } catch (error) {
    console.error('Ошибка при сохранении конфигурации:', error);
    toastr.error('Failed to save configuration'); // Уведомление при ошибке сохранения
  }
}

// Обработчик нажатия на кнопку сохранения конфигурации
document.getElementById('saveConfigButton').addEventListener('click', () => {
  saveConfiguration(); // Уведомление будет показано только в этой функции
  const settingsPage = document.getElementById('settingsPage');
  settingsPage.classList.remove('open'); // Закрываем панель
});


// Функция для загрузки данных регистрации
function loadRegistrationData() {
  const filePath = path.join(process.cwd(), 'data', 'data.json');

  if (fs.existsSync(filePath)) {
    const encryptedData = fs.readFileSync(filePath, 'utf8');
    try {
      const decryptedData = decrypt(encryptedData);
      const { nickname } = JSON.parse(decryptedData);
      return nickname; // Возвращаем никнейм
    } catch (error) {
      console.error('Ошибка при дешифровании данных:', error);
      toastr.error('Failed to load nickname.'); // Уведомление об ошибке
    }
  } else {
    console.warn('Файл данных не существует.');
  }
  return null; // Если файл не существует или произошла ошибка
}


// Функция для получения пути к файлу данных регистрации
function getRegistrationDataFilePath() {
  // Если существует папка 'src', значит, мы в режиме разработки
  const isDev = fs.existsSync(path.join(__dirname, '..', '..'));

  if (isDev) {
    return path.join(process.cwd(), 'data', 'data.json');
  } else {
    return path.join(__dirname, 'data', 'data.json');
  }
}

// Функция для сохранения данных регистрации
function saveRegistrationData(nickname) {
  const filePath = getRegistrationDataFilePath(); // Получаем путь к файлу данных

  // Убедитесь, что директория существует
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const data = JSON.stringify({ nickname });
  const encryptedData = encrypt(data); // Предполагается, что функция encrypt определена

  try {
    fs.writeFileSync(filePath, encryptedData, 'utf8');
    toastr.success('Registration data saved'); // Уведомление при успешном сохранении
  } catch (error) {
    console.error('Ошибка при сохранении данных регистрации:', error);
    toastr.error('Failed to save registration data'); // Уведомление при ошибке сохранения
  }
}

// Отображение версии игры
const versionElement = document.getElementById('client-version');
versionElement.style.display = 'none';

// Обработка завершения загрузки
const loadingBar = document.getElementById('loadingBar');
loadingBar.addEventListener('animationend', () => {
  loadingBar.classList.add('hidden'); // Добавляем класс для скрытия полосы загрузки
  versionElement.style.display = 'block'; // Показываем версию после завершения загрузки
});

// Обработка события версии игры
ipcRenderer.on('game-version', (event, version) => {
  versionElement.textContent = `Client version: ${version}`;
});

// Обработка кнопок
document.getElementById('closeButton').addEventListener('click', () => {
  ipcRenderer.send('window-control', 'close');
});

document.getElementById('minimizeButton').addEventListener('click', () => {
  ipcRenderer.send('window-control', 'minimize');
});

document.getElementById('settingsButton').addEventListener('click', () => {
  const settingsPage = document.getElementById('settingsPage');
  const registerPage = document.getElementById('registerPage');
  settingsPage.classList.toggle('open');
  if (settingsPage.classList.contains('open')) {
    registerPage.classList.remove('open');
  }
});

document.getElementById('registrationButton').addEventListener('click', () => {
  const registrationButton = document.getElementById('registrationButton');
  
  // Проверяем, зарегистрирован ли пользователь (наличие класса 'nickname')
  if (registrationButton.classList.contains('nickname')) {
    return; // Не открываем форму регистрации
  }

  const registerPage = document.getElementById('registerPage');
  const settingsPage = document.getElementById('settingsPage');
  registerPage.classList.toggle('open');
  if (registerPage.classList.contains('open')) {
    settingsPage.classList.remove('open');
  }
});

document.getElementById('closeRegisterPage').addEventListener('click', () => {
  document.getElementById('registerPage').classList.remove('open');
});

document.getElementById('closeSettingsPage').addEventListener('click', () => {
  document.getElementById('settingsPage').classList.remove('open');
});

loadingBar.addEventListener('animationend', () => {
  const playButton = document.getElementById('playButton');
  playButton.classList.add('loading-complete');
});

const mainTextImage = document.getElementById('mainTextImage');
loadingBar.addEventListener('animationend', () => {
  mainTextImage.src = '../assets/images/text-black.png';
});

const architecture32Checkbox = document.getElementById('architecture32');
const architecture64Checkbox = document.getElementById('architecture64');

architecture32Checkbox.addEventListener('click', () => {
  if (architecture32Checkbox.checked) {
    architecture64Checkbox.checked = false;
    ipcRenderer.send('select-architecture', 'x32');
  }
});

architecture64Checkbox.addEventListener('click', () => {
  if (architecture64Checkbox.checked) {
    architecture32Checkbox.checked = false;
    ipcRenderer.send('select-architecture', 'x64');
  }
});

document.getElementById('checkIpButton').addEventListener('click', () => {
  const serverIp = document.getElementById('serverIp').value;
  
  // Проверяем доступность введенного адреса
  ipcRenderer.send('check-connection', serverIp);
});


document.querySelectorAll('.social-icon').forEach(icon => {
  icon.addEventListener('click', (event) => {
    event.preventDefault();
    shell.openExternal(icon.href);
  });
});

document.getElementById('playButton').addEventListener('click', () => {
  ipcRenderer.send('launch-game');
});

// Обработка сообщений и ошибок
ipcRenderer.on('show-toast', (event, { type, message }) => {
  if (type === 'success') {
    toastr.success(message);
  } else if (type === 'error') {
    toastr.error(message);
  } else {
    toastr.info(message);
  }
});

// Функция для обновления кнопки регистрации
function updateRegistrationButton(nickname) {
  const registrationButton = document.getElementById('registrationButton');
  registrationButton.innerHTML = `<span class="welcome-text">Welcome,</span> <span class="nickname-text">${nickname}</span>`;
  registrationButton.classList.add('nickname'); // Добавляем общий класс для стилей
}

// Загрузка данных регистрации при старте
const nickname = loadRegistrationData();
if (nickname) {
  updateRegistrationButton(nickname); // Обновляем кнопку с никнеймом
}


document.addEventListener('DOMContentLoaded', function () {
  const openRegistrationButton = document.getElementById('registrationButton');
  const closeRegisterPage = document.getElementById('closeRegisterPage');
  const registrationButtonSubmit = document.getElementById('registrationButtonSubmit');
  const accountNameInput = document.getElementById('accountName');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const registerPage = document.getElementById('registerPage');

  let serverIp = ''; // Переменная для хранения IP сервера



// Функция для загрузки конфигурационного файла
async function loadConfig() {
  const filePath = getConfigFilePath(); // Получаем путь к файлу конфигурации

  try {
    // Чтение файла с использованием fs
    const data = await fs.promises.readFile(filePath, 'utf8');
    const config = JSON.parse(data); // Парсинг JSON

    // Присваиваем значение serverIp из конфигурации
    serverIp = config.serverIp || '127.0.0.1'; // Если serverIp отсутствует, подставляем localhost
    document.getElementById('serverIp').value = serverIp; // Отображаем IP в поле ввода

    // Обновляем адрес для Blade & Soul
    const bnsLink = document.getElementById('bns-link');
    bnsLink.href = `http://${serverIp}:3000/`;
    console.log('Ссылка обновлена на:', bnsLink.href);

    // Применяем загруженные данные к элементам формы
    document.getElementById('architecture32').checked = config.architecture === 'x32';
    document.getElementById('architecture64').checked = config.architecture === 'x64';

    // Уведомление об успешной загрузке конфигурации
    toastr.success('Configuration loaded successfully!');
  } catch (error) {
    console.error('Ошибка при загрузке конфигурации:', error);
    toastr.error('Error loading configuration: ' + error.message); // Уведомление об ошибке
  }
}


// Загрузка конфигурации при инициализации
loadConfig();

  // Открытие формы регистрации
  openRegistrationButton.addEventListener('click', function () {
    registerPage.style.display = 'block'; // Показываем панель регистрации
    accountNameInput.value = '';
    emailInput.value = '';
    passwordInput.value = '';
    toastr.clear(); // Очищаем предыдущие сообщения
  });

  // Закрытие панели регистрации
  closeRegisterPage.addEventListener('click', function () {
    registerPage.style.display = 'none'; // Скрываем панель регистрации
  });


  // Обработчик нажатия на кнопку регистрации
  registrationButtonSubmit.addEventListener('click', async function () {
    const accountName = accountNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!accountName || !email || !password) {
      toastr.error('All fields are required to be filled out!'); // Сообщение об ошибке
      return; // Прекращаем выполнение функции, если есть пустые поля
    }

    try {
      const response = await fetch(`http://${serverIp}:3000/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account_name: accountName,
          email: email,
          account_password: password
        })
      });

      if (response.ok) {
        const data = await response.text();
        registerPage.style.display = 'none'; // Закрываем панель регистрации после успешной регистрации
        toastr.success('Registration was successful!');
        saveRegistrationData(accountName); // Сохраняем никнейм
        updateRegistrationButton(accountName); // Обновляем кнопку
        console.log(data); // Выводим ответ сервера в консоль
      } else {
        const errorMessage = await response.text();
        toastr.error(`Registration error: ${errorMessage}`);
      }
    } catch (error) {
      toastr.error('There was an error signing in. Please restart the launcher.');
      console.error('Ошибка:', error);
    }
  });

  // Обработчик нажатия на кнопку закрытия окна
  document.getElementById('closeButton').addEventListener('click', function() {
    window.close(); // Закрыть лаунчер
  });

  // Обработчик нажатия на кнопку сворачивания окна
  document.getElementById('minimizeButton').addEventListener('click', function() {
    window.minimize(); // Свернуть лаунчер
  });
});

//-----------------------Функция входа -----------------------//

document.addEventListener('DOMContentLoaded', () => {
  // Объявление переменных для ввода данных
  const registrationEmailInput = document.getElementById('email'); // Поле ввода email для регистрации
  const registrationPasswordInput = document.getElementById('password'); // Поле ввода пароля для регистрации
  const loginEmailInput = document.getElementById('loginEmail'); // Поле ввода email для входа
  const loginPasswordInput = document.getElementById('loginPassword'); // Поле ввода пароля для входа
  let serverIp = '127.0.0.1'; // Значение по умолчанию



// Функция для загрузки конфигурационного файла
async function loadConfig() {
  const filePath = getConfigFilePath(); // Получаем путь к файлу конфигурации

  try {
    const data = await fs.promises.readFile(filePath, 'utf8'); // Чтение файла с использованием fs
    const config = JSON.parse(data); // Парсинг JSON

    // Присваиваем значение serverIp из конфигурации
    serverIp = config.serverIp || '127.0.0.1'; // Если serverIp отсутствует, подставляем localhost
    console.log('Конфигурация загружена:', config); // Вывод загруженной конфигурации для отладки
  } catch (error) {
    console.error('Ошибка при загрузке конфигурации:', error);
    toastr.error('Failed to load configuration: ' + error.message); // Уведомление об ошибке
  }
}

  // Открытие формы регистрации
  document.getElementById('registrationButton').addEventListener('click', function () {
    registerPage.style.display = 'block'; // Показываем панель регистрации
    registrationEmailInput.value = ''; // Очищаем поле email
    registrationPasswordInput.value = ''; // Очищаем поле пароля
    toastr.clear(); // Очищаем предыдущие сообщения
  });

  // Показать форму входа
  document.getElementById('showLoginForm').addEventListener('click', function () {
    document.getElementById('registrationForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    toastr.clear(); // Очищаем предыдущие сообщения
  });

  // Показать форму регистрации
  document.getElementById('showRegistrationForm').addEventListener('click', function () {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registrationForm').style.display = 'block';
    toastr.clear(); // Очищаем предыдущие сообщения
  });

  // Обработчик нажатия на кнопку входа
  document.getElementById('loginButtonSubmit').addEventListener('click', async function () {
    const signin_email = loginEmailInput.value.trim(); // Получаем email из формы входа
    const signin_password = loginPasswordInput.value.trim(); // Получаем пароль из формы входа

    if (!signin_email || !signin_password) {
      toastr.error('All fields are required!'); // Сообщение об ошибке
      return; // Прекращаем выполнение функции, если есть пустые поля
    }

    console.log('Отправляем данные на сервер:', {
      signin_email: signin_email,
      signin_password: signin_password
    });

    try {
      // Используем загруженный IP-адрес для запроса на сервер
      const response = await fetch(`http://${serverIp}:3000/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signin_email: signin_email,
          signin_password: signin_password
        })
      });

      if (response.ok) {
        const userName = await response.text(); // Получаем имя пользователя
        registerPage.style.display = 'none'; // Закрываем панель регистрации после успешного входа
        toastr.success('Login successful! Enjoy the game!');
        saveRegistrationData(userName); // Сохраняем имя пользователя
        updateRegistrationButton(userName); // Обновляем кнопку
        console.log(userName); // Выводим ответ сервера в консоль
      } else {
        const errorMessage = await response.text();
        console.error('Ошибка входа:', errorMessage); // Логируем ошибку в консоль
        toastr.error(`Login error: ${errorMessage}`);
      }
    } catch (error) {
      toastr.error('An error occurred during login. After the initial setup, restart the launcher.');
      console.error('Ошибка:', error);
    }
  });

  // Закрытие панели регистрации
  closeRegisterPage.addEventListener('click', function () {
    registerPage.style.display = 'none'; // Скрываем панель регистрации
  });

  // Загружаем конфигурацию при запуске скрипта
  loadConfig();
});

// После загрузки конфигурации
document.addEventListener('DOMContentLoaded', () => {
  // Объявление переменных для загрузки конфигурации
  let serverIp = '127.0.0.1'; // Значение по умолчанию

  // Функция для получения пути к файлу конфигурации
function getConfigFilePath() {
  // Если существует папка 'src', значит, мы в режиме разработки
  const isDev = fs.existsSync(path.join(__dirname, '..', '..'));

  if (isDev) {
    return path.join(process.cwd(), 'data', 'config.json');
  } else {
    return path.join(__dirname, 'data', 'config.json');
  }
}

});



// Обработчик события для клика по тексту SignIn/SignUp
document.getElementById('toggleSignInSignUp').addEventListener('click', function() {
  const registrationForm = document.getElementById('registrationForm');
  const loginForm = document.getElementById('loginForm');

  if (registrationForm.style.display === 'none') {
    registrationForm.style.display = 'block';
    loginForm.style.display = 'none';
  } else {
    registrationForm.style.display = 'none';
    loginForm.style.display = 'block';
  }
});

// Обработчик для кнопки "Показать форму входа"
document.getElementById('showLoginForm').addEventListener('click', function() {
  document.getElementById('registrationForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
});

// Обработчик для кнопки "Показать форму регистрации"
document.getElementById('showRegistrationForm').addEventListener('click', function() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registrationForm').style.display = 'block';
});
