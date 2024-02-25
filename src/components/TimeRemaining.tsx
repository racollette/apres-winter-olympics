import React, { useState, useEffect } from "react";
import { ZodNumber } from "zod";

type RemainingTime = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const TimeRemaining = ({ endDate }: { endDate: Date }) => {
  const difference = +endDate - +new Date();
  const calculateTimeRemaining = (timeToEnd: number) => {
    let remainingTime: RemainingTime = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (timeToEnd > 0) {
      remainingTime = {
        days: Math.floor(timeToEnd / (1000 * 60 * 60 * 24)),
        hours: Math.floor((timeToEnd / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((timeToEnd / 1000 / 60) % 60),
        seconds: Math.floor((timeToEnd / 1000) % 60),
      };
    }

    return remainingTime;
  };

  const [timeRemaining, setTimeRemaining] = useState(
    calculateTimeRemaining(difference)
  );

  let timeElapsed = 0;

  useEffect(() => {
    const interval = setInterval(() => {
      timeElapsed += 1000;
      setTimeRemaining(calculateTimeRemaining(difference - timeElapsed));
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  const { days, hours, minutes, seconds } = timeRemaining;

  return (
    <div>
      {days > 0 && <span>{days}d </span>}
      {hours > 0 && <span>{hours}h </span>}
      {minutes > 0 && <span>{minutes}m </span>}
      {seconds > 0 && <span>{seconds}s </span>}
      {days === 0 && hours === 0 && minutes === 0 && seconds === 0 && (
        <span>Event Ended</span>
      )}
    </div>
  );
};

export default TimeRemaining;
