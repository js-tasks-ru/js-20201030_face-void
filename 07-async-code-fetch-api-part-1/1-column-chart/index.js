export default class ColumnChart {
  chartHeight = 50;
  apiUrl = `https://course-js.javascript.ru/`;

  constructor({
                label = '',
                link = '',
                url = '',
                range = {
                  from: new Date('2020-04-06'),
                  to: new Date('2020-05-06'),
                },
                formatHeading = (data) => `${data}`,
              } = {}) {

    this.label = label;
    this.link = link;
    this.url = url;
    this.range = range;
    this.formatHeading = formatHeading;

    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.update(this.range.from, this.range.to);
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" --chart-height="${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart">
          </div>
        </div>
      </div>
    `;
  }

  getLink() {
    return (this.link !== '') ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  getBody(data) {
    const columnProps = this.getColumnProps(data);

    return columnProps.map(obj => {
      return `<div style="--value: ${obj.value}" data-tooltip=""></div>`
    }).join('');
  }

  getValue(data) {
    const value = Object.values(data).reduce((accum, value) => {
      return accum + value;
    }, 0);

    return this.formatHeading(value);
  }

  async update(from, to) {
    this.range.from = from;
    this.range.to = to;

    this.loading();

    const data = await this.apiRequest();

    this.subElements.header.innerHTML = this.getValue(data);
    this.subElements.body.innerHTML = this.getBody(data);

    this.loaded();
  }

  apiRequest() {
    const url = this.apiUrl + this.url;
    const queryString = '?' + Object.entries(this.range).map(([key, value]) => {
      return `${key}=${value.toISOString()}`;
    }).join('&');

    return this.getJson(`${url}/${queryString}`);
  }

  getJson(url) {
    return fetch(url)
      .then(response => response.json());
  }

  getColumnProps(data) {
    const maxValue = Math.max(...Object.values(data));
    const scale = 50 / maxValue;

    return Object.values(data).map(item => {
      return {
        value: String(Math.floor(item * scale))
      };
    });
  }

  loading() {
    this.element.classList.add('column-chart_loading');
  }

  loaded() {
    this.element.classList.remove('column-chart_loading');
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
