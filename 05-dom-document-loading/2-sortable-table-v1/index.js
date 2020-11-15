export default class SortableTable {
  constructor(
    header = [],
    {data = []} = {}
  ) {
    this.headerData = this.parseHeaderData(header);
    this.bodyData = data;

    this.sortOrder = 'asc';
    this.sortValue = null;

    this.render();
  }

  parseHeaderData(header) {
    return header.reduce((accum, item) => {
      const {
        title,
        sortable = false,
        sortType,
        template = this.getHeaderElementTemplate
      } = item;

      accum[ item.id ] = {
        title,
        sortable,
        sortType,
        template,
      };

      return accum;
    }, {});
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.sortingElements = this.getSortingElements(this.element);
  }

  get template() {
    return `<div class="sortable-table">
              <div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.getHeader()}
              </div>
              <div data-element="body" class="sortable-table__body">
                ${this.getBody(this.bodyData)}
              </div>

              <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

              <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                <div>
                  <p>No products satisfies your filter criteria</p>
                  <button type="button" class="button-primary-outline">Reset all filters</button>
                </div>
              </div>

            </div>`;
  }

  getHeader() {
    return Object.entries(this.headerData).reduce((accum, [id, data]) => {
      accum += `<div class="sortable-table__cell" data-id="${id}" data-sortable="${data.sortable}">
                  <span>${data.title}</span>
                  <span data-element="arrow" class="sortable-table__sort-arrow">
                    <span class="sort-arrow"></span>
                  </span>
                </div>`;

      return accum;
    }, '');
  }

  getBody(data) {
    return data.reduce((accum, productData) => {
        accum += `<a href="/products/${productData.id}" class="sortable-table__row">
                    ${this.getBodyColumns(productData)}
                  </a>`;

      return accum;
    }, '');
  }

  getBodyColumns(data) {
    return Object.entries(this.headerData).reduce((accum, [id, headerItem]) => {
      accum += headerItem.template(data[ id ]);

      return accum;
    }, '');
  }

  getHeaderElementTemplate(value) {
    return `<div class="sortable-table__cell">${value}</div>`;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  getSortingElements(element) {
    const elements = element.querySelectorAll('[data-sortable=true]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.id] = subElement;

      return accum;
    }, {});
  }

  sort(value, order = 'asc') {
    // Если значение и направление сортировки прежние или нельзя сортировать по
    // переданному свойству - ничего не делаем
    if ((this.sortValue === value && this.sortOrder === order) ||
        !this.sortingElements[ value ])
      return;

    // Выбираем поле для сортировки и задаём ему направление
    Object.entries(this.sortingElements).map(([id, item]) => {
      item.dataset.order = (id === value) ? order : '';
    });

    // Заменяем таблицу на вновь отсортированную
    const sortedBody = this.bodyData.sort(this.makeSorting(value, order));
    this.subElements.body.innerHTML = this.getBody(sortedBody);

    this.sortValue = value;
    this.sortOrder = order;
  }

  makeSorting(value, order) {
    return (a, b) => {
      let result;

      switch (this.headerData[value].sortType) {
        case 'string':
          result = a[ value ].localeCompare(b[ value ], ['ru-RU', 'en-US'], {caseFirst: 'upper'});
          break;
        case 'number':
          result = a[ value ] - b[ value ];
          break;
      }

      switch (order) {
        case 'asc':
          return result;
        case 'desc':
          return -result;
      }
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
