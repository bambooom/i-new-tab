import themeStorage from '@root/src/shared/storages/theme';

async function toggleTheme() {
  console.log('initial theme', await themeStorage.get());
  themeStorage.toggle();
  console.log('toggled theme', await themeStorage.get());
}

void toggleTheme();
