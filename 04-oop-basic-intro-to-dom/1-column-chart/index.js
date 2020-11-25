export default class ColumnChart {
  chartHeight = 50;

  constructor({
                label = '',
                link = '',
                value = '',
                data = [],
              } = {}) {

    this.label = label;
    this.link = link;
    this.value = value;
    this.data = data;

    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    if (this.data.length > 0) {
      this.loaded();
    }
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" --chart-height="${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.value}</div>
          <div data-element="body" class="column-chart__chart">
            ${this.getBody(this.data)}
          </div>
        </div>
      </div>
    `;
  }

  getLink() {
    return (this.link !== '') ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
  }

  getBody(data) {
    const columnProps = this.getColumnProps(data);

    return columnProps.map(obj => {
      return `<div style="--value: ${obj.value}" data-tooltip="${obj.percent}%"></div>`
    }).join('');
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  update(values = []) {
    this.loading();

    this.subElements.body.innerHTML = this.getBody(values);

    if (values.length > 0)
      this.loaded();
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0),
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
