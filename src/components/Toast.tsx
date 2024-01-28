import { Toast } from "flowbite-react";
import { useEffect, useState } from "react";
import { HiCheck, HiExclamationCircle } from "react-icons/hi";

type ToastProps = {
  message: string;
  type: string;
};

export default function DefaultToast(props: ToastProps) {
  const { message, type } = props;
  const [showToast, setShowToast] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  }, []);

  return (
    <>
      {showToast && (
        <Toast className="bg-neutral-800">
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg  text-orange-500 dark:bg-orange-700 dark:text-orange-200">
            {type === "error" ? (
              <HiExclamationCircle className="h-7 w-7" />
            ) : (
              <HiCheck className="h-5 w-5" />
            )}
          </div>
          <div className="ml-3 text-sm font-normal text-white">{message}</div>
          <Toast.Toggle className="bg-neutral-800" />
        </Toast>
      )}
    </>
  );
}
