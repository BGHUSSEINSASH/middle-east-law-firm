// ==================== Multi-Language System ====================

class LanguageSystem {
  constructor() {
    this.currentLang = 'ar';
    this.translations = {};
    this.initialized = false;
    this.supportedLanguages = {
      'ar': { name: 'العربية', dir: 'rtl', flag: '🇮🇶' },
      'en': { name: 'English', dir: 'ltr', flag: '🇺🇸' },
      'ku': { name: 'کوردی', dir: 'rtl', flag: '🟨🟥🟩' },
      'tr': { name: 'Türkçe', dir: 'ltr', flag: '🇹🇷' },
      'fa': { name: 'فارسی', dir: 'rtl', flag: '🇮🇷' },
      'fr': { name: 'Français', dir: 'ltr', flag: '🇫🇷' },
      'de': { name: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
      'es': { name: 'Español', dir: 'ltr', flag: '🇪🇸' },
      'ru': { name: 'Русский', dir: 'ltr', flag: '🇷🇺' },
      'zh': { name: '中文', dir: 'ltr', flag: '🇨🇳' }
    };
  }

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    // Load saved language or detect browser language
    const savedLang = localStorage.getItem('preferredLanguage');
    const browserLang = this.detectBrowserLanguage();
    
    this.currentLang = savedLang || browserLang || 'ar';
    
    // Load translation file
    await this.loadLanguage(this.currentLang);
    
    // Apply language
    this.applyLanguage();
    
    // Setup language switchers
    this.setupLanguageSwitchers();
  }

  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    
    return this.supportedLanguages[langCode] ? langCode : 'ar';
  }

  async loadLanguage(langCode) {
    // Use embedded data first (works on file:// and offline)
    if (window.LANG_DATA && window.LANG_DATA[langCode]) {
      this.translations = window.LANG_DATA[langCode];
      return true;
    }

    // Fallback: try loading from file
    const url = `lang/${langCode}.json`;
    
    try {
      if (window.location.protocol !== 'file:') {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Language file not found');
        this.translations = await response.json();
        return true;
      }
      
      // Fallback to XMLHttpRequest for file:// protocol
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = () => {
          if (xhr.status === 0 || xhr.status === 200) {
            try {
              this.translations = JSON.parse(xhr.responseText);
              resolve(true);
            } catch (e) {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        };
        xhr.onerror = () => resolve(false);
        xhr.send();
      });
    } catch (error) {
      console.error(`Failed to load language ${langCode}:`, error);
      
      // Fallback to Arabic if error
      if (langCode !== 'ar') {
        return await this.loadLanguage('ar');
      }
      return false;
    }
  }

  applyLanguage() {
    const langInfo = this.supportedLanguages[this.currentLang];
    
    // Set document direction
    document.documentElement.setAttribute('dir', langInfo.dir);
    document.documentElement.setAttribute('lang', this.currentLang);
    
    // Update all translatable elements
    this.translatePage();
    
    // Update language selectors
    this.updateLanguageSelectors();
    
    // Update page title
    this.updatePageTitle();
  }

  translatePage() {
    // Translate elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.getTranslation(key);
      
      if (translation) {
        // Check if it's a placeholder
        if (element.hasAttribute('placeholder')) {
          element.setAttribute('placeholder', translation);
        } else {
          element.textContent = translation;
        }
      }
    });

    // Translate elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.getTranslation(key);
      if (translation) {
        element.setAttribute('placeholder', translation);
      }
    });

    // Translate elements with data-i18n-html attribute (for HTML content)
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
      const key = element.getAttribute('data-i18n-html');
      const translation = this.getTranslation(key);
      
      if (translation) {
        element.innerHTML = translation;
      }
    });

    // Translate aria-label attributes
    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
      const key = element.getAttribute('data-i18n-aria');
      const translation = this.getTranslation(key);
      
      if (translation) {
        element.setAttribute('aria-label', translation);
      }
    });

    // Translate meta content attributes
    document.querySelectorAll('[data-i18n-content]').forEach(element => {
      const key = element.getAttribute('data-i18n-content');
      const translation = this.getTranslation(key);
      if (translation) {
        element.setAttribute('content', translation);
      }
    });
  }

  getTranslation(key) {
    // Support nested keys like "nav.home"
    const keys = key.split('.');
    let value = this.translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return null;
      }
    }
    
    return value;
  }

  async switchLanguage(langCode) {
    if (!this.supportedLanguages[langCode]) {
      console.error(`Language ${langCode} is not supported`);
      return false;
    }

    // Add transition class
    document.body.classList.add('language-switching');
    
    // Load new language
    const loaded = await this.loadLanguage(langCode);
    
    if (loaded) {
      this.currentLang = langCode;
      localStorage.setItem('preferredLanguage', langCode);
      
      // Apply new language
      this.applyLanguage();
      
      // Show notification
      if (window.toast) {
        setTimeout(() => {
          toast.success(
            this.getTranslation('notifications.languageChanged'),
            this.supportedLanguages[langCode].name
          );
        }, 300);
      }
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: langCode }
      }));
    }
    
    // Remove transition class
    setTimeout(() => {
      document.body.classList.remove('language-switching');
    }, 300);
    
    return loaded;
  }

  setupLanguageSwitchers() {
    // Setup <select> dropdowns
    const selectors = document.querySelectorAll('.language-select, .footer-select select, [data-language-selector]');
    
    selectors.forEach(selector => {
      selector.innerHTML = '';
      
      Object.entries(this.supportedLanguages).forEach(([code, info]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${info.flag} ${info.name}`;
        option.selected = code === this.currentLang;
        selector.appendChild(option);
      });
      
      selector.addEventListener('change', (e) => {
        this.switchLanguage(e.target.value);
      });
    });

    // Setup header button-based language dropdown
    const langDropdownBtns = document.querySelectorAll('.lang-dropdown button[data-lang]');
    langDropdownBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchLanguage(btn.dataset.lang);
        const currentLangSpan = document.getElementById('currentLang');
        if (currentLangSpan) currentLangSpan.textContent = btn.dataset.lang.toUpperCase();
        const dropdown = btn.closest('.lang-dropdown');
        if (dropdown) dropdown.classList.remove('show');
      });
    });
  }

  updateLanguageSelectors() {
    const selectors = document.querySelectorAll('.language-select, .footer-select select, [data-language-selector]');
    
    selectors.forEach(selector => {
      selector.value = this.currentLang;
    });
  }

  updatePageTitle() {
    const titleKey = document.body.getAttribute('data-page-title');
    if (titleKey) {
      const title = this.getTranslation(titleKey);
      if (title) {
        document.title = title;
      }
    }
  }

  getCurrentLanguage() {
    return {
      code: this.currentLang,
      ...this.supportedLanguages[this.currentLang]
    };
  }

  isRTL() {
    return this.supportedLanguages[this.currentLang].dir === 'rtl';
  }

  // Get formatted text with dynamic values
  format(key, params = {}) {
    let text = this.getTranslation(key);
    
    if (!text) return '';
    
    // Replace placeholders like {name}, {count}, etc.
    Object.keys(params).forEach(param => {
      text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });
    
    return text;
  }

  // Get array of translations (for lists)
  getArray(key) {
    const value = this.getTranslation(key);
    return Array.isArray(value) ? value : [];
  }
}

// ==================== Theme Manager (Enhanced) ====================

class ThemeManager {
  constructor() {
    this.currentTheme = 'dark';
    this.init();
  }

  init() {
    // Load saved theme or detect system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    // Apply theme
    this.applyTheme(this.currentTheme, false);
    
    // Setup theme toggle buttons
    this.setupThemeToggles();
    
    // Listen for system theme changes
    this.listenToSystemTheme();
  }

  applyTheme(theme, animate = true) {
    // Add transition class
    if (animate) {
      document.body.classList.add('theme-transitioning');
    }
    
    // Set theme attribute
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Update Three.js background if exists
    if (window.scene) {
      const bgColor = theme === 'dark' ? 0x0a1628 : 0xf0f4f8;
      window.scene.background = new THREE.Color(bgColor);
    }
    
    // Update toggle buttons
    this.updateThemeToggles();
    
    // Remove transition class
    if (animate) {
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
      }, 300);
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme }
    }));
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme, true);
    
    // Show notification
    if (window.toast && window.i18n) {
      setTimeout(() => {
        toast.info(
          window.i18n.getTranslation('notifications.themeChanged'),
          newTheme === 'dark' ? '🌙' : '☀️'
        );
      }, 100);
    }
  }

  setupThemeToggles() {
    // Theme toggle click is handled by script.js - we only update icons here
    this.updateThemeToggles();
  }

  updateThemeToggles() {
    const toggles = document.querySelectorAll('.theme-toggle, .footer-theme-toggle, [data-theme-toggle]');
    
    toggles.forEach(toggle => {
      const icon = toggle.querySelector('i');
      const text = toggle.querySelector('span');
      
      if (icon && window.i18n) {
        if (this.currentTheme === 'dark') {
          icon.className = 'fas fa-sun';
          if (text) text.textContent = window.i18n.getTranslation('nav.theme.dark');
        } else {
          icon.className = 'fas fa-moon';
          if (text) text.textContent = window.i18n.getTranslation('nav.theme.light');
        }
      }
    });
  }

  listenToSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        this.applyTheme(e.matches ? 'dark' : 'light', true);
      }
    });
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  isDark() {
    return this.currentTheme === 'dark';
  }
}

// ==================== Initialize Systems ====================

let i18n;
let themeManager;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Language System
  i18n = new LanguageSystem();
  window.i18n = i18n; // Make globally accessible
  
  // Initialize Theme Manager
  themeManager = new ThemeManager();
  window.themeManager = themeManager; // Make globally accessible
  
  // Wait for language to load
  await i18n.init();
  
  console.log('✅ Language System initialized:', i18n.getCurrentLanguage());
  console.log('✅ Theme Manager initialized:', themeManager.getCurrentTheme());
});

// ==================== Language Switching Transition ====================

// Add smooth transition styles
const style = document.createElement('style');
style.textContent = `
  .language-switching * {
    transition: opacity 0.2s ease !important;
  }
  
  .language-switching {
    opacity: 0.7;
  }
  
  .theme-transitioning {
    transition: background-color 0.3s ease, color 0.3s ease !important;
  }
`;
document.head.appendChild(style);

// ==================== Export for use in other scripts ====================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LanguageSystem, ThemeManager };
}
