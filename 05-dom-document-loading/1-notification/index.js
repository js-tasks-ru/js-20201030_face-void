export default class NotificationMessage {
  static existedElement = null;

  constructor(mes = '',
              {
                duration = 1000,
                type = 'success',
              } = {})
  {
    this.duration = duration;
    this.type = type;
    this.message = mes;

    this.render();
  }

  get template() {
    return `<div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
              <div class="timer"></div>
              <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">${this.message}</div>
              </div>
            </div>`;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;

    this.element = element.firstElementChild;
  }

  show(target = document.body) {
    if (NotificationMessage.existedElement)
      NotificationMessage.existedElement.remove();

    target.append(this.element);
    NotificationMessage.existedElement = this.element;

    setTimeout(() => this.remove(), this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
