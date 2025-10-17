import React from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
      <div>
        <label htmlFor="startDate" className="text-sm font-medium text-light-700 dark:text-dark-300 mr-2">De:</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="input-style px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="endDate" className="text-sm font-medium text-light-700 dark:text-dark-300 mr-2">Até:</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="input-style px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
