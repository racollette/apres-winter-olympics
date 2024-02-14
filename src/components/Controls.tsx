type ControlsProps = {
  spacebar?: boolean;
  wasdInstruction?: string;
  spaceInstruction?: string;
};

export const Controls = ({
  spacebar = true,
  wasdInstruction = "Move",
  spaceInstruction = "Jump",
}: ControlsProps) => {
  return (
    <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/50 p-4">
      <h1 className="py-2 text-xl">Controls</h1>
      <div className="flex flex-row items-center">
        <div className="mr-4 flex items-center justify-end">
          <p className="p-2 text-xl">{wasdInstruction}</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center justify-center gap-2">
            <Key letter="W" />
          </div>
          <div className="flex flex-row items-center justify-center gap-2">
            <Key letter="A" />
            <Key letter="S" />
            <Key letter="D" />
          </div>
        </div>
      </div>
      {spacebar && (
        <div className="flex flex-row items-center justify-center">
          <div className="flex flex-row items-center">
            <div className="mr-4 flex items-center justify-end">
              <p className="p-2 text-xl">{spaceInstruction}</p>
            </div>
            <div className="flex h-[40px] w-[200px] items-center justify-center rounded-md bg-gray-400 text-lg">
              Space
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Key = ({ letter }: { letter: string }) => {
  return (
    <div className="flex h-[40px] w-[40px] items-center justify-center rounded-md bg-gray-400 text-lg">
      {letter}
    </div>
  );
};
