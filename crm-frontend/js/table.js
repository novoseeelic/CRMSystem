import { getUsersFromServer } from './data.js';
import * as modals from './modals.js';
import { createElement } from './createElement.js';

const TYPE = {
  new: 'new',
  change: 'change',
};

let users = [];

// Загрузка пользователей
const loading = (body = document.querySelector('.table-body')) => {
    const row = createElement('tr', ['loader']);
    const item = createElement('td', ['loader__column'], { colSpan: 6 });
    const loader = createElement('div', ['loader__item']);
  
    item.append(loader);
    row.append(item);
    body.append(row);
};

const headerSort = (parent) => {
    const data = {
      id: 'ID',
      fullname: 'Фамилия Имя Отчество',
      createdAt: 'Дата и время создания',
      updatedAt: 'Последние изменения',
      contact: 'Контакты',
      actions: 'Действия',
    };
  
    let i = 0;
  
    for (const key of Object.keys(data)) {
      const item = createElement('th', ['table-header__item', `table-header__item_${key}`]);
      item.textContent = data[key];
  
      const countSortRow = 4;
  
      if (i < countSortRow) {
        item.dataset.filterTop = 1;
        item.classList.add('table-header__sort');
  
        item.addEventListener('click', async (e) => {
          let filterTop = item.dataset.filterTop;
          const items = document.querySelectorAll('.table-header__sort');
  
          for (const item of items) {
            item.classList.remove('table-header__sort_active', 'table-header__sort_active-reverse');
            item.dataset.filterTop = 1;   
            item.removeAttribute('data-active');
          };
  
          e.currentTarget.classList.add(
            filterTop == 1 ? 'table-header__sort_active'
              : 'table-header__sort_active-reverse'
          );
  
          e.currentTarget.dataset.active = key;
  
          users = await sortUsers(users, key, filterTop);
  
          createTableBody({ users });
          item.dataset.filterTop = -filterTop;
        });
  
        const arrow = createElement('span', ['table-header__arrow']);
  
        item.append(arrow);
  
        if (key === 'fullname') {
          arrow.classList.add('table-header__arrow_FIO');
          arrow.textContent = 'А-Я';
        }
      }
      if (key === 'id') {
        item.classList.add('table-header__sort_active');
        item.dataset.filterTop = -1;
        item.dataset.active = key;
      }
      parent.append(item);
      i++;
    }
};

async function sortUsers(users, sortType = 5, direction = 1) {
    const SORT_TYPE = {
      id: 'id',
      fullname: 'fullname',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    };
  
    const sortting = (a, b, flag) => {
      if (a > b) { return flag; }
      if (a < b) { return -flag; }
      return 0;
    };
  
    switch (sortType) {
      case SORT_TYPE.id:
        return users.sort((a, b) => sortting(a.id, b.id, direction));
      case SORT_TYPE.fullname:
        return users.sort((a, b) => {
          const fullname1 = `${a.surname} ${a.name} ${a.lastName}`;
          const fullname2 = `${b.surname} ${b.name} ${b.lastName}`;
          return sortting(fullname1, fullname2, direction);
        });
  
      case SORT_TYPE.createdAt:
        return users.sort((a, b) => sortting(a.createdAt, b.createdAt, direction));
  
      case SORT_TYPE.updatedAt:
        return users.sort((a, b) => sortting(a.updatedAt, b.updatedAt, direction));
  
      default:
        break;
    }
}

//Создание header'a таблицы
export const createHeaderTable = async (table) => {
    const header = createElement('thead', ['table__header', 'table-header']);
    const row = createElement('tr');
  
    headerSort(row);
    header.append(row);
    table.append(header);
};

//Создание тела таблицы
export async function createTableBody(tableData = '', table = document.querySelector('.table')) {
    let body;
    if (document.querySelector('.table__body')) {
      body = document.querySelector('.table__body');
      body.textContent = '';
      users = tableData.users;
    } else {
      body = createElement('tbody', ['table__body', 'table-body']);
      table.append(body);
    }
  
    if (!tableData.users) {
      await loading(body);
  
      document.querySelector('.loader').classList.toggle('loader_active');
  
      const data = await getUsersFromServer(tableData.filter);
      users = data.users;
      const sortType = document.querySelector('[data-active]').dataset.active;
  
      sortUsers(users, sortType);
  
      document.querySelector('.loader').classList.toggle('loader_active');
    }
  
    for (const user of users) {
      createTableItem(user, body);
    }
}

// Создание строки таблицы
const createTableItem = (user, body) => {
    const addContact = (item) => {
      const contactsType = {
        phone: 'img/phone.svg',
        vk: 'img/vk.svg',
        facebook: 'img/facebook.svg',
        mail: 'img/mail.svg',
        other: 'img/other.svg',
      };
      const contact = createElement('img', ['contacts__item']);
      let linkType = '';
  
      switch (item.type) {
        case 'Телефон':
          contact.src = contactsType.phone;
          linkType = 'tel:' + item.value;
          break;
        case 'Email':
          contact.src = contactsType.mail;
          linkType = 'mailto:' + item.value;
          break;
        case 'Vk':
          contact.src = contactsType.vk;
          linkType = 'http://' + item.value;
          break;
        case 'Facebook':
          contact.src = contactsType.facebook;
          linkType = 'http://' + item.value;
          break;
        case 'Другое':
          contact.src = contactsType.other;
          linkType = '#';
          break;
        default:
          break;
      }
  
      tippy(contact, {
        allowHTML: true,
        content: `${item.type}: <a href=${linkType} target="_blank">${item.value}</a>`,
        interactive: true,
      });
      return contact;
    };
  
    const createContacts = (contacts, container) => {
      const contactContainer = createElement('div', ['table-row__contacts', 'contacts']);
      const maxContactsShows = 4;
  
      const count = contacts.length > maxContactsShows ? maxContactsShows : contacts.length;
      for (let i = 0; i < count; i++) {
        contactContainer.append(addContact(contacts[i]));
      }
  
      if (contacts.length > maxContactsShows) {
        const contact = createElement('div', ['contacts__item_more'], { textContent: '+' + (contacts.length - maxContactsShows) });
  
        contactContainer.append(contact);
        contact.addEventListener('click', () => {
          contact.remove();
          for (let i = maxContactsShows; i < contacts.length; i++) {
            contactContainer.append(addContact(contacts[i]));
          }
        });
      }
      container.append(contactContainer);
    };
  
    const getDate = (date) => {
      const getMonth = date.getMonth() + 1;
      const year = date.getFullYear();
      const month = getMonth < 10 ? '0' + getMonth : getMonth;
      const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  
      const time =
        `${date.getHours() < 10 ? '0' + date.getHours() :
          date.getHours()}:${date.getMinutes() < 10 ?
            '0' + date.getMinutes() : date.getMinutes()}`
      return `${day}.${month}.${year} <span class = 'table-row__time'>${time}</span>`;
    };
  
    const row = createElement('tr', ['table-row', 'table-body__row']);
    const id = createElement('td', ['table-row__elem', 'table-row__elem_id']);
    const fullname = createElement('td', ['table-row__elem', 'table-row__elem_fullname']);
    const createDate = createElement('td', ['table-row__elem', 'table-row__elem_createDate']);
    const lastUpdateDate = createElement('td', ['table-row__elem', 'table-row__elem_lastUpdateDate']);
    const contacts = createElement('td', ['table-row__elem', 'table-row__elem_contacts']);
    const buttons = createElement('td', ['table-row__elem', 'table-buttons']);

    id.textContent = user.id;
  
    const actions = {
      changeButton: createElement('button', ['table-buttons__button', 'table-buttons__button_change']),
      deleteButton: createElement('button', ['table-buttons__button', 'table-buttons__button_delete']),
    };

    actions.changeButton.textContent = 'Изменить';
    actions.deleteButton.textContent = 'Удалить';
  
    actions.changeButton.addEventListener('click', async () => {
      await modals.mainModal(TYPE.change, user.id);
    });
  
    actions.deleteButton.addEventListener('click', async () => {
      modals.deleteUser(user.id);
    });
  
    fullname.innerHTML =
      `<a class="table-row__elem-link" href="client.html?id=${user.id}">
    ${user.surname} ${user.name} ${user.lastName}
    </a>`;
    createDate.innerHTML = getDate(new Date(user.createdAt));
    lastUpdateDate.innerHTML = getDate(new Date(user.updatedAt));
  
    createContacts(user.contacts, contacts);
  
    buttons.append(actions.changeButton, actions.deleteButton);
  
    row.append(id, fullname, createDate, lastUpdateDate, contacts, buttons);
    body.append(row);
};
  