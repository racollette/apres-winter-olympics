export const handleUserPFPDoesNotExist: React.EventHandler<
  React.SyntheticEvent<HTMLImageElement, Event>
> = (event) => {
  event.currentTarget.onerror = null; // Avoid infinite loop in case of multiple errors

  const random = Math.floor(Math.random() * 7); // Random number between 1 and 7
  const dinos = [
    "stego",
    "trice",
    "raptor",
    "rex",
    "bronto",
    "dactyl",
    "ankylo",
  ];
  event.currentTarget.src = `/icons/${dinos[random]}_colored.svg`;
};
