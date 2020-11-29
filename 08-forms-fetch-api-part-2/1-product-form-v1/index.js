import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import productData from "./__mocks__/product-data";
import categoriesData from "./__mocks__/categories-data";

const IMGUR_API_URL = 'https://api.imgur.com/3/image';
const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements;
  productData;
  categoriesData;
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0
  };

  behaviorDeleteImage = e => {
    const target = e.target;

    if (!target.hasAttribute('data-delete-handle'))
      return;

    target.closest('li').remove();
  }

  handlerUploadImageDialogue = e => {
    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.addEventListener('input', this.handlerUploadImage);

    fileInput.dispatchEvent(new MouseEvent('click'));
  }

  handlerUploadImage = async e => {
    const [file] = e.target.files;

    if (file) {
      const button = this.element.querySelector('[name=uploadImage]');
      button.disabled = true;

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(
        IMGUR_API_URL,
        {
          method: 'POST',
          headers: {
            authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success === true) {
        const image = {
          url: result.data.link,
          source: file.name,
        }

        this.subElements.imageListContainer.firstElementChild
          .insertAdjacentHTML('beforeend', this.getProductSingleImage(image));
      } else
        console.error('An error occurred while uploading image'); // TODO поведение, если сервер не сохранил картинку

      button.disabled = false;
    }
  }

  handlerSaveProduct = async e => {
    e.preventDefault();

    await this.save();
  }

  constructor (productId) {
    this.productId = productId;
  }

  async render () {
    const element = document.createElement('div');

    // редактирование
    if (this.productId)
    {
      const [formData, categories] = await Promise.all([this.loadData(this.productId), this.loadCategories()]);
      this.productData = (formData.length > 0) ? formData[0] : this.defaultFormData;
      this.categoriesData = categories;
    }
    // создание
    else
    {
      this.productData = this.defaultFormData;
      this.categoriesData = await this.loadCategories();
    }

    // console.log(this.productData);
    // console.log(this.categoriesData);

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.initEventListeners();

    return this.element;
  }

  async loadData(id) {
    const url = new URL('/api/rest/products', BACKEND_URL);
    url.searchParams.set('id', id);

    return await fetchJson(url);
  }

  async loadCategories() {
    const url = new URL('/api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    return await fetchJson(url);
  }

  initEventListeners() {
    this.subElements.productForm.addEventListener('click', this.behaviorDeleteImage);
    this.element.querySelector('[name=uploadImage]').addEventListener('click', this.handlerUploadImageDialogue);
    this.subElements.productForm.addEventListener('submit', this.handlerSaveProduct);
  }

  async save() {
    const url = new URL('/api/rest/products', BACKEND_URL);
    const form = this.subElements.productForm;
    const sendData = {
      title: escapeHtml(form.title.value),
      description: escapeHtml(form.description.value),
      discount: Number(form.discount.value),
      price: Number(form.price.value),
      quantity: Number(form.quantity.value),
      status: Number(form.status.value),
      subcategory: form.subcategory.value,
      images: [],
    }

    if (this.productId)
      sendData.id = this.productId;

    const images = this.subElements.imageListContainer.querySelectorAll('li');
    if (images.length > 0) {
      for (const image of images) {
        sendData.images.push({
          url: image.querySelector('[name=url]').value,
          source: image.querySelector('[name=source]').value,
        })
      }
    }

    const response = await fetchJson(url, {
      method: 'PATCH',
      body: JSON.stringify(sendData),
      headers: {
        'content-type': 'application/json',
      }
    });

    if (response.ok) {
      const eventName = (this.productId) ? 'product-updated' : 'product-saved';
      this.element.dispatchEvent(new Event(eventName));
    }
  }

  get template() {
    const data = this.productData;

    return `<div class="product-form">
              <form data-element="productForm" class="form-grid" id="productForm">
                <div class="form-group form-group__half_left">
                  <fieldset>
                    <label class="form-label">Название товара</label>
                    <input required=""
                           type="text"
                           name="title"
                           class="form-control"
                           placeholder="Название товара"
                           value="${this.getSafeString(data.title)}">
                  </fieldset>
                </div>
                <div class="form-group form-group__wide">
                  <label class="form-label">Описание</label>
                  <textarea required=""
                            class="form-control"
                            name="description"
                            data-element="productDescription"
                            placeholder="Описание товара">${this.getSafeString(data.description)}</textarea>
                </div>
                <div class="form-group form-group__wide" data-element="sortable-list-container">
                  <label class="form-label">Фото</label>
                  <div data-element="imageListContainer">
                    <ul class="sortable-list">${this.getProductImages(data.images)}</ul>
                  </div>
                  <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
                </div>
                <div class="form-group form-group__half_left">
                  <label class="form-label">Категория</label>
                  <select class="form-control" name="subcategory" id="subcategory">${this.getProductCategories()}</select>
                </div>
                <div class="form-group form-group__half_left form-group__two-col">
                  <fieldset>
                    <label class="form-label">Цена ($)</label>
                    <input required=""
                           type="number"
                           name="price"
                           class="form-control"
                           placeholder="100"
                           value="${data.price}">
                  </fieldset>
                  <fieldset>
                    <label class="form-label">Скидка ($)</label>
                    <input required=""
                           type="number"
                           name="discount"
                           class="form-control"
                           placeholder="0"
                           value="${data.discount}">
                  </fieldset>
                </div>
                <div class="form-group form-group__part-half">
                  <label class="form-label">Количество</label>
                  <input required=""
                         type="number"
                         class="form-control"
                         name="quantity"
                         placeholder="1"
                         value="${data.quantity}">
                </div>
                <div class="form-group form-group__part-half">
                  <label class="form-label">Статус</label>
                  <select class="form-control" name="status">
                    <option value="1">Активен</option>
                    <option value="0">Неактивен</option>
                  </select>
                </div>
                <div class="form-buttons">
                  <button type="submit" name="save" class="button-primary-outline">
                    ${(this.productId) ? `Сохранить товар` : `Добавить товар`}
                  </button>
                </div>
              </form>
            </div>`;
  }

  getSafeString(string) {
    return (string) ? escapeHtml(string) : '';
  }

  getProductImages(arImg = []) {
    return arImg.map(image => {
      return this.getProductSingleImage(image);
    }).join('');
  }

  getProductSingleImage(image) {
    return `<li class="products-edit__imagelist-item sortable-list__item" style="">
                <input type="hidden" name="url" value="${image.url}">
                <input type="hidden" name="source" value="${image.source}">
                <span>
                  <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                  <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
                  <span>${image.source}</span>
                </span>
                <button type="button">
                  <img src="icon-trash.svg" data-delete-handle="" alt="delete">
                </button>
              </li>`
  }

  getProductCategories() {
    const arReturn = [];

    for (const category of this.categoriesData) {
      if (category.subcategories) {
        category.subcategories.map(subcategory => {
          arReturn.push(`<option value="${subcategory.id}">${category.title} &gt; ${subcategory.title}</option>`);
        });
      }
    }

    return arReturn.join('');
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
