window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector);
      if (element) element.innerText = text;
    };
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency]);
    }
  });

  window.addEventListener('DOMContentLoaded', () => {
    // Запрещаем перетаскивание всех изображений и ссылок
    document.addEventListener('dragstart', function(event) {
      if (event.target.tagName === 'IMG' || event.target.tagName === 'A') {
        event.preventDefault();
      }
    });
  });
  
  