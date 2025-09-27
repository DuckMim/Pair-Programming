const SAVED_THEME = localStorage.getItem('theme');
const PREFERS_DARK = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute(
    'data-theme',
    SAVED_THEME ? SAVED_THEME : (PREFERS_DARK ? 'dark' : 'light')
);