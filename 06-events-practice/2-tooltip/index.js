class Tooltip {
  static instance = null;

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

  addTooltipBehavior(e) {
    const target = e.target;

    // Работает только на элементах с data-tooltip
    if (!target.dataset.tooltip)
      return;

    const tooltip = new Tooltip();

    // Добавляем элемент
    tooltip.render(target.dataset.tooltip);

    // Размещаем элемент
    tooltip.moveAt(e.pageX, e.pageY);

    // Перемещаем элемент за курсором
    document.addEventListener('pointermove', tooltip.moveTooltip);
  }

  moveAt(pageX, pageY) {
    const tooltip = this.element;

    tooltip.style.left = pageX + 2 + 'px';
    tooltip.style.top = pageY + 2 + 'px';
  }

  moveTooltip(e) {
    const tooltip = new Tooltip();

    tooltip.moveAt(e.pageX, e.pageY);
  }

  destroy() {
    const tooltip = new Tooltip();

    tooltip.element.remove();
    document.removeEventListener('pointermove', tooltip.moveTooltip);
  }
}

const tooltip = new Tooltip();

export default tooltip;
