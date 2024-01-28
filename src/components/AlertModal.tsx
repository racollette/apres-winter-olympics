import { type CustomFlowbiteTheme, Modal } from "flowbite-react";
import { HiTrash } from "react-icons/hi";
import { useState } from "react";

const customTheme: CustomFlowbiteTheme["modal"] = {
  content: {
    inner: "bg-neutral-900 rounded-lg",
    base: "relative w-full p-4 h-auto",
  },
};

type AlertModalProps = {
  button: string;
  title: string;
  message: string;
  accept: string;
  onDelete: () => void;
};

export default function AlertModal({
  button,
  title,
  message,
  accept,
  onDelete,
}: AlertModalProps) {
  const [openModal, setOpenModal] = useState<string | undefined>();

  return (
    <>
      <button
        className="flex flex-row items-center justify-center rounded-md bg-red-700 px-2 py-1 align-middle text-sm hover:bg-red-800"
        onClick={() => {
          setOpenModal("dismissible");
        }}
      >
        <HiTrash className="mr-1 self-center" width={20} height={20} />
        <div className="md:text-md text-xs font-extrabold">{button}</div>
      </button>
      <Modal
        theme={customTheme}
        dismissible
        show={openModal === "dismissible"}
        onClose={() => setOpenModal(undefined)}
        position={"center"}
      >
        {/* <Modal.Header>Create Account or Log In</Modal.Header> */}
        <Modal.Body className="rounded-lg bg-neutral-900">
          <div className="m-2 flex flex-col space-y-4 text-white">
            <div className="flex flex-col">
              <div className="text-lg font-extrabold">{title}</div>
              <div className="py-4 text-zinc-400">{message}</div>
            </div>
            <div className="flex flex-row justify-end gap-4">
              <button
                className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-extrabold hover:bg-neutral-800"
                onClick={() => setOpenModal(undefined)}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-extrabold hover:bg-red-800"
                onClick={onDelete}
              >
                {accept}
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
