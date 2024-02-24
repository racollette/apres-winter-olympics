import React, { useState, useEffect } from "react";

type RemainingTime = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const TimeRemaining = ({ endDate }: { endDate: Date }) => {
  const calculateTimeRemaining = () => {
    const difference = +new Date(endDate) - +new Date();
    let remainingTime: RemainingTime = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      remainingTime = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return remainingTime;
  };

  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
