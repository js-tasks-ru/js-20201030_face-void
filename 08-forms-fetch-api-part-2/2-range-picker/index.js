const RANGEPICKER_OPEN_CLASS = 'rangepicker_open';
const RANGEPICKER_CELL_FROM_CLASS = 'rangepicker__selected-from';
const RANGEPICKER_CELL_TO_CLASS = 'rangepicker__selected-to';
const RANGEPICKER_CELL_BETWEEN_CLASS = 'rangepicker__selected-between';

export default class RangePicker {
  element;
  subElements;
  range;
  selectState = {
    from: true,
    to: true,
  };
  currentShownDates = {};
  timezoneOffset = (new Date()).getTimezoneOffset() * 60000;
  daysOfWeek = ['Пн', "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

  formatInputDate = (date) => {
    return `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()}`;
  }

  eventHandlerToggleRangepicker = () => {
    this.element.classList.toggle(RANGEPICKER_OPEN_CLASS);
    this.updateCalendar(this.currentShownDates.from, this.currentShownDates.to);
  }

  eventHandlerCloseRangepicker = (e) => {
    if (!e.target.closest('.rangepicker') && this.element.classList.contains('rangepicker_open'))
      this.element.classList.remove('rangepicker_open');
  }

  behaviorRangePick = (e) => {
    const target = e.target;

    if (!target.classList.contains('rangepicker__cell'))
      return;

    const dateValue = new Date(target.dataset.value);

    if (this.isRangeSelected()) {
      this.selectState.to = false;

      this.range.from = new Date(new Date(dateValue).getTime() + this.timezoneOffset);
      this.clearSelection();
      target.classList.add(RANGEPICKER_CELL_FROM_CLASS);

      return;
    }

    if (this.selectState.to === false) {
      this.selectState.to = true;

      this.range.to = new Date(new Date(dateValue).getTime() + this.timezoneOffset);
      target.classList.add(RANGEPICKER_CELL_TO_CLASS);
      this.element.classList.toggle(RANGEPICKER_OPEN_CLASS);
      this.updateDateInput();

      this.element.dispatchEvent(new Event('date-select', {bubbles: true}));

      return;
    }
  }

  previousMonth = () => {
    const dateFrom = this.currentShownDates.from;

    this.currentShownDates.to = this.currentShownDates.from;
    this.currentShownDates.from = new Date(dateFrom.getFullYear(), dateFrom.getMonth() - 1, dateFrom.getDate());


    this.updateCalendar(this.currentShownDates.from, this.currentShownDates.to);
  }

  nextMonth = () => {
    const dateTo = this.currentShownDates.to;

    this.currentShownDates.from = this.currentShownDates.to;
    this.currentShownDates.to = new Date(dateTo.getFullYear(), dateTo.getMonth() + 1, dateTo.getDate());

    this.updateCalendar(this.currentShownDates.from, this.currentShownDates.to);
  }

  constructor({
                from = new Date(),
                to = new Date(),
              } = {})
  {
    this.range = {
      from: from,
      to: to,
    };

    this.currentShownDates.from = from;
    this.currentShownDates.to = to;

    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.initEventListeners();
  }

  get template() {
    return `<div class="rangepicker">
              <div class="rangepicker__input rangepicker_open" data-element="input">
                ${this.getDateInput()}
              </div>
              <div class="rangepicker__selector" data-element="selector"></div>
            </div>`;
  }

  getDateInput() {
    return Object.entries(this.range).map(([key, val]) => {
      return `<span data-element="${key}">${this.formatInputDate(val)}</span>`;
    }).join(' - ');
  }

  updateDateInput() {
    this.subElements.input.innerHTML = this.getDateInput();
  }

  updateCalendar(from, to) {
    if (from.getMonth() === to.getMonth())
      to = new Date(to.getFullYear(), to.getMonth() + 1, to.getDate());

    this.subElements.selector.innerHTML = `${this.getCalendarNav()}
                                           ${this.getCalendarMonth(from)}
                                           ${this.getCalendarMonth(to)}`;

    this.subElements.selector.querySelector('.rangepicker__selector-control-left').addEventListener('click', this.previousMonth);
    this.subElements.selector.querySelector('.rangepicker__selector-control-right').addEventListener('click', this.nextMonth);
  }

  getCalendarNav() {
    return `<div class="rangepicker__selector-arrow"></div>
            <div class="rangepicker__selector-control-left"></div>
            <div class="rangepicker__selector-control-right"></div>`;
  }

  getCalendarMonth(date) {
    const monthName = this.months[ date.getMonth() ].toLowerCase();

    return `<div class="rangepicker__calendar">
              <div class="rangepicker__month-indicator">
                <time datetime="${monthName}">${monthName}</time>
              </div>
              <div class="rangepicker__day-of-week">${this.getCalendarWeek()}</div>
              <div class="rangepicker__date-grid">${this.getCalendarDays(date)}</div>
            </div>`;
  }

  getCalendarWeek() {
    return this.daysOfWeek.map(item => `<div>${item}</div>`).join('');
  }

  getCalendarDays(date) {
    const curMonth = date.getMonth();
    const curYear = date.getFullYear();
    const lastDay = new Date(curYear, curMonth + 1, 0).getDate();
    let startDay = new Date(curYear, curMonth, 1).getDay();
    const arReturn = [];

    if (startDay === 0)
      startDay = 7;

    for (let i = 1; i <= lastDay; i++) {
      const iterationDate = new Date(curYear, curMonth, i);
      const selectClass = this.getCalendarDaySelectClass(iterationDate);
      const startFrom = (i === 1) ? `style="--start-from: ${startDay}"` : '';

      arReturn.push(`<button type="button"
                             class="rangepicker__cell${selectClass}"
                             data-value="${new Date(iterationDate.getTime() - this.timezoneOffset).toISOString()}"
                             ${startFrom}>${i}</button>`);
    }

    return arReturn.join('');
  }

  getCalendarDaySelectClass(date) {
    const dateTimestamp = date.getTime();
    const fromTimestamp = this.range.from.getTime();
    const toTimestamp = this.range.to.getTime();

    if (dateTimestamp === fromTimestamp)
      return ` ${RANGEPICKER_CELL_FROM_CLASS}`;

    if (dateTimestamp > fromTimestamp && dateTimestamp < toTimestamp)
      return ` ${RANGEPICKER_CELL_BETWEEN_CLASS}`;

    if (dateTimestamp === toTimestamp)
      return ` ${RANGEPICKER_CELL_TO_CLASS}`;

    return '';
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners() {
    this.subElements.input.addEventListener('click', this.eventHandlerToggleRangepicker);
    document.addEventListener('click', this.eventHandlerCloseRangepicker, true);
    document.addEventListener('click', this.behaviorRangePick);
  }

  isRangeSelected() {
    return (this.selectState.from === true && this.selectState.to === true);
  }

  clearSelection() {
    this.subElements.selector.querySelectorAll('.rangepicker__cell').forEach(element => {
      element.classList.remove(RANGEPICKER_CELL_FROM_CLASS);
      element.classList.remove(RANGEPICKER_CELL_TO_CLASS);
      element.classList.remove(RANGEPICKER_CELL_BETWEEN_CLASS);
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
