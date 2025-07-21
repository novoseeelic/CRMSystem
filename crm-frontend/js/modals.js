import * as dataServer from './data.js';
import { createTableBody } from './table.js'
import { createElement } from './createElement.js';

const TYPE = {
  new: 'new',
  change: 'change',
};

const INPUT_TYPES = {
  tel: 'tel',
  mail: 'mail',
  link: 'link',
  text: 'text',
};

const CONTACT_TYPES = {
  tel: 'Телефон',
  mail: 'Email',
  vk: 'Vk',
  facebook: 'Facebook',
  other: 'Другое',
};

// Удалить пользователя
export function deleteUser(id) {
  const modal = createElement('div', ['modal', 'modal__delete']);
  const modalContent = createElement('div', ['modal__content']);
  const title = createElement('h2', ['modal__title', 'modal__title_delete']);
  const text = createElement('p', ['modal__text']);
  const deleteButton = createElement('button', ['modal__submit']);
  const cancelButton = createElement('button', ['modal__cancel']);
  const closeButton = createElement('button', ['modal__close']);

  title.textContent ='Удалить клиента';
  text.textContent = 'Вы действительно хотите удалить данного клиента?';
  deleteButton.textContent = 'Удалить';
  cancelButton.textContent = 'Отмена';

  setTimeout(() => {
    modal.classList.add('active');
  }, 300);
  modal.append(modalContent);

  deleteButton.addEventListener('click', async () => {
    deleteButton.classList.toggle('modal__submit_loading');

    try {
      await dataServer.deleteUserToServer(id);
      createTableBody();
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
    } finally {
      deleteButton.classList.toggle('modal__submit_loading');
      modal.remove();
    }
  });

  closeButton.addEventListener('click', () => {
    modal.remove();
  });

  modalContent.append(title, text, closeButton, deleteButton, cancelButton);
  modalContent.addEventListener('click', (e) => { e._isClickWithimModal = true; });

  document.querySelector('.wrapper').append(modal);

  cancelButton.addEventListener('click', () => { modal.remove(); });

  modal.addEventListener('click', (e) => {
    if (e._isClickWithimModal) { return; }
    modal.remove();
  });
};

// Добавление нового контакта
const addContact = (block, button, data = { type: '', value: '' }) => {
  // Настройка селекта
  const setupSelect = (element) => {
    new Choices(element, {
      shouldSort: false,
      searchEnabled: false,
      itemSelectText: '',
      silent: true,
      choices: [{
        value: CONTACT_TYPES.tel,
        label: CONTACT_TYPES.tel,
        selected: data.type === CONTACT_TYPES.tel,
      },
      {
        value: CONTACT_TYPES.mail,
        label: CONTACT_TYPES.mail,
        selected: data.type === CONTACT_TYPES.mail,
      },
      {
        value: CONTACT_TYPES.vk,
        label: CONTACT_TYPES.vk,
        selected: data.type === CONTACT_TYPES.vk,
      },
      {
        value: CONTACT_TYPES.facebook,
        label: CONTACT_TYPES.facebook,
        selected: data.type === CONTACT_TYPES.facebook,
      },
      {
        value: CONTACT_TYPES.other,
        label: CONTACT_TYPES.other,
        selected: data.type === CONTACT_TYPES.other,
      },
      ],
    });
  };

  const types = {
    'Телефон': INPUT_TYPES.tel,
    'Email': INPUT_TYPES.mail,
    'Vk': INPUT_TYPES.link,
    'Facebook': INPUT_TYPES.link,
    'Другое': INPUT_TYPES.text,
  };

  const contactBlock = createElement('div', ['modal-contacts__item']);
  const select = createElement('select');
  const input = createElement('input', ['modal-contacts__input'], { placeholder: 'Введите данные контакта', value: data.value });
  const cancel = createElement('button', ['modal-contacts__cancel']);

  input.type = types[data.type] || INPUT_TYPES.tel;

  // Добавить маску для записи телефона или по умолчанию
  if (data.type === CONTACT_TYPES.tel || data.type === '') {
    const im = new Inputmask('+7(999) 999-99-99');
    im.mask(input);
  }

  // Создать подсказку для кнопки
  tippy(cancel, {
    content: 'Удалить контакт',
    delay: [300, 200],
  });

  block.classList.add('modal__contacts_active');

  cancel.addEventListener('click', (e) => {
    const maxContacts = 10;
    e.preventDefault();
    button.dataset.index = button.dataset.index - 1;
    if (button.dataset.index < maxContacts) {
      button.style.display = 'block';
    }
    if (button.dataset.index === 0) {
      block.classList.remove('modal__contacts_active');
    }
    contactBlock.remove();
  });

  select.addEventListener('change', (e) => {
    input.type = types[e.currentTarget.value] || INPUT_TYPES.tel;
    input.value = '';

    if (input.type !== INPUT_TYPES.tel) {
      if (input.inputmask) { input.inputmask.remove(); }
    } else {
      const im = new Inputmask('+7(999) 999-99-99');
      im.mask(input);
    }
  });

  contactBlock.append(select, input, cancel);
  setupSelect(select);
  button.before(contactBlock);
};

const getContacts = (container) => {
  const contacts = [];
  const data = container.querySelectorAll('.modal-contacts__item');

  for (const item of data) {
    if (item.querySelector('.modal-contacts__input').value) {
      contacts.push({
        type: item.querySelector('.choices__item--selectable').textContent,
        value: item.querySelector('.modal-contacts__input').value,
      });
    }
  }
  return contacts;
};

//Валидация обязательных полей
const validateField = (form) => {
  //Настроить выводимые ошибки
  const setupError = (error, elem, text, className) => {
    error.classList.add('modal__error', `modal__error_${className}`);
    error.textContent = text;
    elem.append(error);
  };

  //Проверка ошибок для имени и фамилии
  const validateInputs = (form, contactBlock) => {
    const isInputError = (error, elem) => {
      if (elem.value.length < 1) {
        elem.classList.add('modal__input_error');
        return false;
      } else {
        error.remove();
        elem.classList.remove('modal__input_error');
        return true;
      }
    };

    try {
      const surname = form.querySelector('#surName');
      const firstname = form.querySelector('#firstName');
      const surnameError = contactBlock.querySelector('.modal__error_surname') || createElement('div');
      const firstnameError = contactBlock.querySelector('.modal__error_firstname') || createElement('div');

      setupError(surnameError, contactBlock, 'Введите фамилию', 'surname');
      setupError(firstnameError, contactBlock, 'Введите имя', 'firstname');

      const er1 = isInputError(surnameError, surname);
      const er2 = isInputError(firstnameError, firstname);

      validate = er1 && er2;

      surname.addEventListener('input', (e) => {
        isInputError(surnameError, e.currentTarget, 'surname', contactBlock, 'Введите фамилию');
      });

      firstname.addEventListener('input', (e) => {
        isInputError(firstnameError, e.currentTarget, 'firstname', contactBlock, 'Введите имя');
      });
    } catch (error) {
      console.error('Ошибка при валидации полей формы:', error);
    }
  };

  const validateContact = (contacts, errorBlock) => {
    const isContactError = (condition, contact) => {
      let isValidate = true;

      if (condition) {
        isValidate = false;
        validate = false;
        contact.classList.add('modal-contacts__item_active');
      } else {
        contact.classList.remove('modal-contacts__item_active');
      }

      return isValidate;
    };

    const choseSelectType = (selectType, input, contact) => {
      const error = errorBlock.querySelector('.modal__error_contact') || createElement('div');

      let isValidate = true;

      if (selectType === CONTACT_TYPES.tel) {
        const length = input.inputmask.unmaskedvalue().length;

        isValidate = isContactError(length < 10, contact);
      } else if (selectType === CONTACT_TYPES.mail) {
        const re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

        isValidate = isContactError(!re.test(String(input.value).toLowerCase()), contact);
      } else if (selectType === CONTACT_TYPES.vk || selectType === CONTACT_TYPES.facebook) {
        const re = /([\w-]{1,32}\.[\w-]{1,32})/;

        isValidate = isContactError(!re.test(String(input.value).toLowerCase()), contact);
      } else {
        isValidate = isContactError(input.value.length <= 0, contact);
      }

      if (isValidate === false) {
        setupError(error, errorBlock, 'Неверное значение контакта(ов)', 'contact');
      }
    };

    for (const contact of contacts) {
      const input = contact.querySelector('.modal-contacts__input');
      let selectType = contact.querySelector('.choices__input').value;
      contact.querySelector('.choices__input').addEventListener('change', (e) => {
        selectType = e.currentTarget.value;
      });

      choseSelectType(selectType, input, contact);

      input.addEventListener('input', (e) => {
        choseSelectType(selectType, e.currentTarget, contact);
      });
    }
  };

  let validate = true;
  const contacts = form.querySelectorAll('.modal-contacts__item');
  const errorBlock = form.querySelector('.modal__error-block') || createElement('div');

  errorBlock.classList.add('modal__error-block');
  form.querySelector('.modal__submit').before(errorBlock);

  validateInputs(form, errorBlock);
  validateContact(contacts, errorBlock);

  return validate;
};

// Модальное окно добавления или редактирования пользователя
export async function mainModal(type = TYPE.new, id = '') {
  const hidePlaceholder = (elem, placeholder) => {
    if (elem.value.length >= 1) {
      placeholder.classList.add('modal__placeholder_active');
    } else {
      placeholder.classList.remove('modal__placeholder_active');
    }
  };

  const modal = createElement('div', ['modal']);
  const modalContent = createElement('div', ['modal__content']);
  const title = createElement('h2', ['modal__title']);
  const form = createElement('form', ['modal__form', 'modal-form']);

  const firstName = createElement('input', ['modal__input'], { id: 'firstName', type: 'text' });
  const firstNameLabel = createElement('label', ['modal__placeholder'], { for: 'firstName' });
  const firstNameBlock = createElement('div', ['modal__input-container']);

  const surName = createElement('input', ['modal__input'], { id: 'surName', type: 'text' });
  const surNameLabel = createElement('label', ['modal__placeholder'], { for: 'surName' });
  const surNameBlock = createElement('div', ['modal__input-container']);

  const lastName = createElement('input', ['modal__input'], { id: 'lastName', type: 'text' });
  const lastNameLabel = createElement('label', ['modal__placeholder'], { for: 'lastName' });
  const lastNameBlock = createElement('div', ['modal__input-container']);

  const contactBlock = createElement('div', ['modal__contacts', 'modal-contacts']);
  const addContactButton = createElement('button', ['modal__add-contact']);
  const saveButton = createElement('button', ['modal__submit']);
  const cancelButton = createElement('button', ['modal__cancel']);
  const closeButton = createElement('button', ['modal__close']);

  addContactButton.textContent = 'Добавить контакт';
  saveButton.textContent = 'Сохранить';
  cancelButton.textContent = type === TYPE.new ? 'Отмена' : 'Удалить клиента';

  let user = {};

  // Выполнить, если меняем существующего пользователя
  if (type === TYPE.change) {
    user = await dataServer.getUserToIdFromServer(id);
  }

  if (user.message) {
    const text = createElement('p');
    text.textContent = 'Пользователь не найден';
    modalContent.append(text);
    return;
  }

  setTimeout(() => {
    modal.classList.add('active');
  }, 300);
  modal.addEventListener('click', (e) => {
    if (e._isClickWithimModal) { return; }
    modal.remove();
  });

  modalContent.append(title, closeButton);
  modalContent.dataset.simplebar = true;
  contactBlock.append(addContactButton);

  form.append(surNameBlock, firstNameBlock, lastNameBlock, contactBlock, saveButton, cancelButton);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveButton.classList.toggle('modal__submit_loading');
    const errors = form.querySelector('.modal__error-block');

    if (errors) {
      errors.textContent = '';
    }

    if (!validateField(form)) {
      saveButton.classList.toggle('modal__submit_loading');
      return;
    }

    if (type === TYPE.new) {    // Если создаем нового пользователя
      const data = await dataServer.addUserToServer({
        name: firstName.value,
        surname: surName.value,
        lastName: lastName.value,
        contacts: getContacts(contactBlock),
      });

      if (data.errors) {
        for (const error of data.errors) {
          const er = createElement('div', ['modal__error']);
          er.textContent = error.message;
          errors.append(er);
        }
        saveButton.before(errors);
        return;
      }
    } else if (type === TYPE.change) {    //Если изменяем существующего пользователя
      const data = await dataServer.updateUserToServer(user.id, {
        name: firstName.value,
        surname: surName.value,
        lastName: lastName.value,
        contacts: getContacts(contactBlock),
      });

      if (data.message) {
        saveButton.before(data.message);
        return;
      }
    }

    form.reset();

    saveButton.classList.toggle('modal__submit_loading');

    firstNameLabel.removeAttribute('style');
    surNameLabel.removeAttribute('style');
    lastNameLabel.removeAttribute('style');
    modal.classList.remove('active');
    createTableBody();
  });

  modalContent.append(form);
  modalContent.addEventListener('click', (e) => {
    e._isClickWithimModal = true;
  });

  // surname
  surName.value = user.surname || '';
  surName.autocomplete = 'off';
  surName.addEventListener('blur', () => {
    hidePlaceholder(surName, surNameLabel);
  });

  surNameLabel.innerHTML = 'Фамилия<span class="symbol">*</span>';

  surNameBlock.append(surName, surNameLabel);

  // firstname
  firstName.value = user.name || '';
  firstName.autocomplete = 'off';
  firstName.addEventListener('blur', () => {
    hidePlaceholder(firstName, firstNameLabel);
  });

  firstNameLabel.innerHTML = 'Имя<span class="symbol">*</span>';

  firstNameBlock.append(firstName, firstNameLabel);

  // lastname
  lastName.value = user.lastName || '';
  
  lastName.autocomplete = 'off';
  lastName.addEventListener('blur', () => {
    hidePlaceholder(lastName, lastNameLabel);
  });

  lastNameLabel.innerHTML = 'Отчество';

  lastNameBlock.append(lastName, lastNameLabel);

  hidePlaceholder(surName, surNameLabel);
  hidePlaceholder(firstName, firstNameLabel);
  hidePlaceholder(lastName, lastNameLabel);

  title.innerHTML = type === TYPE.new
    ? 'Новый клиент' : `Изменить данные <span class='modal-title__id'>ID: ${user.id}</span>`;

  if (user.contacts) {
    for (const contact of user.contacts) {
      addContact(contactBlock, addContactButton, contact);
    }
  }

  addContactButton.dataset.index = contactBlock.childNodes.length - 1;
  addContactButton.addEventListener('click', (e) => {
    const index = addContactButton.dataset.index;
    addContactButton.dataset.index = Number(index) + 1;
    e.preventDefault();
    addContact(contactBlock, addContactButton);
    if (index >= 9) {
      addContactButton.style.display = 'none';
    }
  });

  closeButton.addEventListener('click', () => {
    form.reset();
    modal.remove();
  });

  saveButton.type = 'submit';

  cancelButton.addEventListener('click', (e) => {
    if (type === TYPE.change) {
      deleteUser(user.id);
    }
    e.preventDefault();
    modal.remove();
  });

  modal.append(modalContent);
  document.querySelector('.wrapper').append(modal);
}