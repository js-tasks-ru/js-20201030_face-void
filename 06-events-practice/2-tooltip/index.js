class Tooltip {
  static instance = null;

  addTooltipBehavior = e => {
    const target = e.target;

    // Работает только на элементах с data-tooltip
    if (!target.dataset.tooltip)
      return;

    // Добавляем элемент
    this.render(target.dataset.tooltip);

    // Размещаем элемент
    this.moveAt(e.pageX, e.pageY);

    // Перемещаем элемент за курсором
    document.addEventListener('pointermove', this.moveTooltip);
  }

  moveTooltip = e => {
    this.moveAt(e.pageX, e.pageY);
  }

  destroy = () => {
    this.element.remove();
    document.removeEventListener('pointermove', this.moveTooltip);
  }

  constructor() {
    if (Tooltip.instance)
      return Tooltip.instance;

    Tooltip.instance = this;
  }

  initialize() {
    const wrap = document.createElement('div');

    wrap.innerHTML = this.template;
    this.element = wrap.firstElementChild;

    this.initEventListeners();
  }

  get template() {
    return `<div class="tooltip"></div>`;
  }

  render(text) {
    this.element.textContent = text;
    document.body.append(this.element);
  }

  initEventListeners() {
    document.addEventListener('pointerover', this.addTooltipBehavior);
    document.addEventListener('pointerout', this.destroy);
  }

  moveAt(pageX, pageY) {
    const tooltip = this.element;

    tooltip.style.left = pageX + 10 + 'px';
    tooltip.style.top = pageY + 10 + 'px';
  }
}

const tooltip = new Tooltip();

export default tooltip;
