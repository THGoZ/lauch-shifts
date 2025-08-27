import React from 'react';
import { TimelineList, TimelineProps } from 'react-native-calendars';

interface EventProps {
    events: {
        [date: string]: TimelineProps['events'];
    },
    timelineProps: Partial<TimelineProps>,
    initialTime: TimelineProps['initialTime'],
}

const TimelineCalendar = ({ events, timelineProps, initialTime }: EventProps) => {
  return (
        <TimelineList
          events={events}
          timelineProps={timelineProps}
          showNowIndicator
          // scrollToNow
          scrollToFirst
          initialTime={initialTime}
        />
  )
}

export default TimelineCalendar