export default class SortableTable {
  sortOrder = 'asc';
  sortValue = null;

  constructor(
    header = [],
    {data = []} = {}
  ) {
    this.headerData = this.parseHeaderData(header);
    this.bodyData = data;

    this.render();
  }

  parseHeaderData(header) {
    return header.reduce((accum, item) => {
      const {
        title,
        sortable = false,
        sortType,
        template = this.getHeaderElementTemplate,
        customSorting,
      } = item;

      accum[ item.id ] = {
        title,
        sortable,
        sortType,
        template,
        customSorting,
      };

      return accum;
    }, {});
  }

  render() {
    // Дефолтная сортировка по первой sortable колонке в header
    const firstSortable = Object.entries(this.headerData).find(([id, data]) => (data.sortable === true));
    this.sortValue = firstSortable[0];

    const element = document.createElement('div');

    element.innerHTML = this.getTable();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.sortingElements = this.getSortingElements(this.element);

    this.initEventListeners();
  }

  getTable() {
    // Сортировка по умолчанию
    const sortedBody = this.bodyData.sort(this.makeSorting(this.sortValue, this.sortOrder));

    return `<div class="sortable-table">
              <div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.getHeader()}
              </div>
              <div data-element="body" class="sortable-table__body">
                ${this.getBody(sortedBody)}
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
    return Object.entries(this.headerData).map(([id, data]) => {
      return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${data.sortable}" data-order="asc">
                <span>${data.title}</span>
                ${this.getSortArrow(id)}
              </div>`;
    }).join('');
  }

  getSortArrow(id) {
    return (id === this.sortValue) ? `<span data-element="arrow" class="sortable-table__sort-arrow">
                                        <span class="sort-arrow"></span>
                                      </span>` : '';
  }

  getBody(data) {
    return data.map((productData) => {
      return `<a href="/products/${productData.id}" class="sortable-table__row">
                ${this.getBodyColumns(productData)}
              </a>`;
    }).join('');
  }

  getBodyColumns(data) {
    return Object.entries(this.headerData).map(([id, headerItem]) => {
      return headerItem.template(data[ id ]);
    }).join('');
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
    // Перемещаем стрелку в сортируемую колонку
    if (value !== this.sortValue) {
      this.subElements.arrow.remove();

      this.sortingElements[ value ].append(this.subElements.arrow);
    }

    // Выбираем поле для сортировки и задаём ему направление
    this.sortingElements[ value ].dataset.order = order;

    // Заменяем таблицу на вновь отсортированную
    const sortedBody = this.bodyData.sort(this.makeSorting(value, order));
    this.subElements.body.innerHTML = this.getBody(sortedBody);

    this.sortValue = value;
    this.sortOrder = order;
  }

  makeSorting(value, order) {
    const orderObj = {
      asc: 1,
      desc: -1
    }

    return (a, b) => {
      let result;

      switch (this.headerData[value].sortType) {
        case 'string':
          result = a[ value ].localeCompare(b[ value ], ['ru-RU', 'en-US'], {caseFirst: 'upper'});
          break;
        case 'number':
          result = a[ value ] - b[ value ];
          break;
        case 'custom':
          result = this.headerData[value].customSorting(a, b);
          break;
      }

      return orderObj[ order ] * result;
    }
  }

  initEventListeners() {
    // События сортировки
    this.element.addEventListener('pointerdown', this.sortingEventListeners.bind(this));
  }

  sortingEventListeners(event) {
    const sortable = event.target.closest('[data-sortable=true]');

    if (!sortable)
      return;

    const sortOrder = this.toggleSortOrder(sortable.dataset.order);
    const sortValue = sortable.dataset.id;

    this.sort(sortValue, sortOrder);
  }

  toggleSortOrder(order) {
    const arSort = {
      asc: 'desc',
      desc: 'asc',
    }

    return arSort [ order ];
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
