export default class ColumnChart {
  constructor(data) {
    this.chartHeight = 50;

    if (data) {
      // Заголовок чарта
      this.label = (data.label && typeof data.label == 'string') ?
        data.label[0].toUpperCase() + data.label.substr(1) : '';
      // Ссылка чарта
      this.link = (data.link) ? `<a href="/${data.link}" class="column-chart__link">View all</a>` : '';
      // Значение на чарте
      this.value = (data.value) ? data.value : '';
      // Значения для
      this.data = (data.data) ? data.data : [];
    }

    this.render();
    this.update(this.data);
  }

  render() {
    const element = document.createElement('div');
    element.className = 'column-chart';
    element.style.cssText = `--chart-height: ${this.chartHeight}`;

    element.innerHTML = `
      <div class="column-chart__title">
        ${this.label}
        ${this.link}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
        <div data-element="body" class="column-chart__chart">
        </div>
      </div>
    `;

    this.element = element;
  }

  update(values) {
    this.loading();

    if (values) {
      const columnsData = this.getColumnProps(values);
      const chartsColumns = columnsData.reduce((accum, obj) => {
        accum += `<div style="--value: ${obj.value}" data-tooltip="${obj.percent}%"></div>`;
        return accum;
      }, '');

      this.element.querySelector('.column-chart__chart').innerHTML = chartsColumns;

      if (chartsColumns)
        this.loaded();
    }
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
