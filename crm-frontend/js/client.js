import { getUserToIdFromServer } from './data.js';
import { createElement } from './createElement.js';

document.addEventListener('DOMContentLoaded', async () => {
  const wrapper = document.querySelector('.client__wrapper');
  const main = document.querySelector('.client__main');
  const container = createElement('div', ['container', 'client__container']);
  const clientInfo = createElement('div', ['client__info']);
  const clientPhoto = createElement('div', ['client__photo']);

  main.classList.add('main');

  const id = document.location.search.substring(4);
  const user = await getUserToIdFromServer(id);

  const createClientHeader = (parent) => {
    const header = document.querySelector('.client__header');
    const headerContainer = createElement('div', ['container', 'header__container']);
    const logo = createElement('div', ['header__logo']);
    const headerTitle = createElement('h2', ['client__header-title']);

    header.classList.add('header');
    headerTitle.innerText = 'Карточка клиента';

    headerContainer.append(logo, headerTitle);
    header.append(headerContainer);
    parent.append(header);
  };

  const createClientTitle = () => {
    const titleContainer = createElement('div', ['client__title-container']);
    const title = createElement('h1', ['client__title']);
    title.innerHTML = `${user.surname} ${user.name} ${user.lastName}`;

    const clientID = createElement('span', ['client__id']);
    clientID.innerHTML = `id: ${id}`;

    titleContainer.append(title, clientID);
    clientInfo.append(titleContainer);
  };

  const getDate = async (date, label, container) => {
    const getMonth = date.getMonth() + 1;
    const year = date.getFullYear();
    const month = getMonth < 10 ? '0' + getMonth : getMonth;
    const day = date.getDate();

    const time =
      `${date.getHours() < 10 ? '0' + date.getHours() :
        date.getHours()}:${date.getMinutes() < 10 ?
          '0' + date.getMinutes() : date.getMinutes()}`;

    const html = createElement('span', ['client__data-date']);
    html.innerHTML = `${day}.${month}.${year}г. <span class="client__data-time">${time}</span>`;

    container.append(label, html);
  };

  const getClientDate = async (parent) => {
    const dateCreateContainer = createElement('div', ['client__data-date']);
    const dateChangeContainer = createElement('div', ['client__data-date']);
    const labelCreate = createElement('span', ['client__data-label']);
    const labelChange = createElement('span', ['client__data-label']);
    const dateCreate = await new Date(user.createdAt);
    const dateChange = await new Date(user.updatedAt);

    labelCreate.innerText = 'Дата и время создания: ';
    labelChange.innerText = 'Последние изменения: ';

    getDate(dateCreate, labelCreate, dateCreateContainer);
    getDate(dateChange, labelChange, dateChangeContainer);

    parent.append(dateCreateContainer, dateChangeContainer);
  };

  const createClientIfno = async () => {
    const info = createElement('div', ['client__data']);

    getClientDate(info);
    clientInfo.append(info);
  };

  const createClientContact = async (parent) => {
    const contacts = await user.contacts;

    const addContact = (item) => {
      const contactsType = {
        phone: 'img/phone.svg',
        vk: 'img/vk.svg',
        facebook: 'img/facebook.svg',
        mail: 'img/mail.svg',
        other: 'img/other.svg',
      };

      const contactContainer = createElement('div', ['client__contacts-container']);
      const contact = createElement('img', ['client__contacts-item']);
      const contactDescr = createElement('span', ['client__contacts-descr']);

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

      contactDescr.innerHTML = `${item.type}: <a href=${linkType} target="_blank">${item.value}</a>`;

      contactContainer.append(contact, contactDescr);

      return contactContainer;
    };

    const contactsContainer = createElement('div', ['client__contacts']);

    for (let i = 0; i < contacts.length; i++) {
      contactsContainer.append(addContact(contacts[i]));
    }

    parent.append(contactsContainer);
  };

  const getClientPhoto = (parent) => {
    const clientAvatar = createElement('div', ['client__avatar']);

    parent.append(clientAvatar);
  };

  const getClientBtn = (parent) => {
    const btnContainer = createElement('div', ['client__btn-container']);
    const clientBtn = createElement('a', ['client__btn'], { href: 'javascript:history.back()' });
    clientBtn.textContent = 'Назад';

    btnContainer.append(clientBtn);
    parent.append(btnContainer);
  };

  createClientHeader(wrapper);

  createClientTitle(clientInfo);
  createClientIfno(clientInfo);
  createClientContact(clientInfo);

  getClientPhoto(clientPhoto);

  container.append(clientInfo, clientPhoto);

  main.append(container);

  getClientBtn(main);

  wrapper.append(main);
});