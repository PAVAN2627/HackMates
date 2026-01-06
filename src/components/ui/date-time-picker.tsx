import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  className?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  className,
  disabled = false
}: DateTimePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.date-time-picker-container')) {
        setShowDatePicker(false);
        setShowTimePicker(false);
      }
    };

    if (showDatePicker || showTimePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDatePicker, showTimePicker]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Select date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Select date';
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Select date';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Select time';
    try {
      const [hours, minutes] = timeString.split(':');
      if (!hours || !minutes) return 'Select time';
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Select time';
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (day: number) => {
    const today = new Date();
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return checkDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const isSelectedDate = (day: number) => {
    if (!date) return false;
    const selectedDate = new Date(date);
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = selectedDate.toISOString().split('T')[0];
    onDateChange(dateString);
    setShowDatePicker(false);

    // If selected date is today, ensure time is not in the past
    const today = new Date();
    if (selectedDate.toDateString() === today.toDateString() && time) {
      const currentTime = today.toTimeString().slice(0, 5);
      if (time < currentTime) {
        const nextHour = today.getHours() + 1;
        const nextTime = `${nextHour.toString().padStart(2, '0')}:00`;
        onTimeChange(nextTime);
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const commonTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
  ];

  const handleTimeChange = (newTime: string) => {
    const today = new Date();
    const selectedDate = date ? new Date(date) : null;
    
    // If selected date is today, ensure time is not in the past
    if (selectedDate && selectedDate.toDateString() === today.toDateString()) {
      const currentTime = today.toTimeString().slice(0, 5);
      if (newTime < currentTime) {
        alert('Please select a future time for today\'s date');
        return;
      }
    }
    
    onTimeChange(newTime);
    setShowTimePicker(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isPast = isPastDate(day);
      const isSelected = isSelectedDate(day);
      const isTodayDate = isToday(day);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isPast && handleDateSelect(day)}
          disabled={isPast}
          className={cn(
            "h-8 w-8 text-sm rounded-md transition-colors",
            isPast && "text-muted-foreground cursor-not-allowed opacity-50",
            !isPast && !isSelected && "hover:bg-muted",
            isSelected && "bg-primary text-primary-foreground",
            isTodayDate && !isSelected && "bg-accent text-accent-foreground font-semibold"
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={cn('space-y-4 date-time-picker-container', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Picker */}
        <div className="relative">
          <Label className="text-sm font-medium">Date *</Label>
          <div className="relative mt-1">
            <Button
              type="button"
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal h-10',
                !date && 'text-muted-foreground'
              )}
              disabled={disabled}
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowTimePicker(false);
              }}
            >
              <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{formatDate(date)}</span>
              <ChevronDown className="ml-auto h-4 w-4 flex-shrink-0" />
            </Button>
            
            {showDatePicker && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg p-4">
                <div className="space-y-4">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="font-semibold">
                      {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Days of Week */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDatePicker(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Time Picker */}
        <div className="relative">
          <Label className="text-sm font-medium">Time *</Label>
          <div className="relative mt-1">
            <Button
              type="button"
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal h-10',
                !time && 'text-muted-foreground'
              )}
              disabled={disabled}
              onClick={() => {
                setShowTimePicker(!showTimePicker);
                setShowDatePicker(false);
              }}
            >
              <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{formatTime(time)}</span>
              <ChevronDown className="ml-auto h-4 w-4 flex-shrink-0" />
            </Button>
            
            {showTimePicker && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg p-4 max-h-80 overflow-y-auto">
                <div className="space-y-3">
                  <Label htmlFor="time-input" className="text-sm font-medium">Select Time</Label>
                  <Input
                    id="time-input"
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full"
                  />
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Quick Select</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {commonTimes.map((timeValue) => {
                        const today = new Date();
                        const selectedDate = date ? new Date(date) : null;
                        const isDisabled = selectedDate && 
                          selectedDate.toDateString() === today.toDateString() && 
                          timeValue < today.toTimeString().slice(0, 5);
                        
                        const displayTime = (() => {
                          try {
                            return new Date(`2000-01-01T${timeValue}`).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            });
                          } catch {
                            return timeValue;
                          }
                        })();
                        
                        return (
                          <Button
                            key={timeValue}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "justify-center text-xs h-8 p-1",
                              isDisabled && "opacity-50 cursor-not-allowed"
                            )}
                            disabled={isDisabled}
                            onClick={() => {
                              if (!isDisabled) {
                                handleTimeChange(timeValue);
                              }
                            }}
                          >
                            {displayTime}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTimePicker(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}