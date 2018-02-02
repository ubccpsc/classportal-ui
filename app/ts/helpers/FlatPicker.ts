const flatpickr: any = require('flatpickr');

export default class FlatPicker { 

  public static setFlatPickerField(unixTime: number, htmlIdSelector: string) {
        try {

          if (typeof htmlIdSelector === 'undefined' || htmlIdSelector === '') {
            throw `FlatPicker::setFlatPickerField ERROR htmlIdSelector cannot be undefined or empty string`;
          }

            let dateFilter = flatpickr(htmlIdSelector, {
                enableTime:  true,
                time_24hr:   true,
                utc: true,
                dateFormat:  "Y/m/d @ H:i",
                defaultDate: new Date(unixTime || new Date().getTime())
            });
            console.log('ResultView::configure() - done');
        } catch (err) {
            console.error('ResultView::configure() - flatpickr ERROR: ' + err.message);
        }
  }
}