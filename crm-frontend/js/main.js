import { getUsersFromServer } from './data.js';
import { mainModal } from './modals.js';
import * as getTable from './table.js';
import autocomplete from './search.js';
import { createElement } from './createElement.js';

document.addEventListener('DOMContentLoaded', async () => {
  const wrapper = document.querySelector('.wrapper');
  const main = document.querySelector('.main');
  const container = createElement('div', ['container', 'main__container']);

  main.classList.add('main');

  // Получить ФИ клиентов для поиска
  const autocompleteSearch = async (parent) => {
    const data = await getUsersFromServer();
    const dataUsers = data.users;
    const usersName = dataUsers.map((x) => x.name);
    const usersSurname = dataUsers.map((y) => y.surname);

    const form = createElement('form', ['header__form'], { autocomplete: 'off' });
    const inputContainer = createElement('div', ['header__input-container', 'autocomplete']);
    const search = createElement('input', ['header__search'], { placeholder: 'Введите запрос' });

    let timeout = '';
    search.addEventListener('input', (e) => {
      const value = e.currentTarget.value;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        getTable.createTableBody({ filter: value });
      }, 300);
    });

    autocomplete(search, usersSurname, usersName);

    inputContainer.append(search);
    form.append(inputContainer);
    parent.append(form);
  };

  //создание header'a
  const createHeader = async (parent) => {
    const header = document.querySelector('.header');
    header.classList.add('header');
    const headerContainer = createElement('div', ['container', 'header__container']);
    const logo = createElement('div', ['header__logo']);

    headerContainer.append(logo);
    autocompleteSearch(headerContainer);
    header.append(headerContainer);
    parent.append(header);
  };

  const createTitle = () => {
    const title = createElement('h1', ['title', 'main__title']);
    title.textContent = 'Клиенты';

    container.append(title);
  };

  //создание таблицы
  const createTable = () => {
    const tableContainer = createElement('div', ['table-container'], { 'data-simplebar': true });
    let table;

    if (document.querySelector('.table')) {
      table = document.querySelector('.table');
      table.textContent = '';
    } else {
      table = createElement('table', ['table']);
    }

    getTable.createHeaderTable(table);
    getTable.createTableBody('', table);

    tableContainer.append(table);
    container.append(tableContainer);
  };

  // Создание кнопки "Добавить клиента"
  const createAddButton = () => {
    const button = createElement('button', ['main__button']);
    button.textContent = 'Добавить пользователя';
    button.addEventListener('click', () => {
      mainModal();
    });

    const buttonContainer = createElement('div', ['main__button-container']);

    buttonContainer.append(button);
    container.append(buttonContainer);
  };

  createHeader(wrapper);
  createTitle(container);
  createTable(container);
  createAddButton(container, wrapper);

  main.append(container);

  wrapper.append(main);
});