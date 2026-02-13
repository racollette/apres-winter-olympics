import { Dropdown } from "flowbite-react";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { handleUserPFPDoesNotExist } from "~/utils/images";
import { shortAccount } from "~/utils/addresses";

type ProfileButtonProps = {
  imageURL: string;
  username: string;
  handleSignout: () => void;
  sessionKey: string;
};

export default function ProfileButton(props: ProfileButtonProps) {
  const { imageURL, username, handleSignout, sessionKey } = props;
  const displayName = username?.length > 30 ? shortAccount(username) : username;

  return (
    <Dropdown
      className="border-none bg-neutral-700 font-clayno"
      label={
        <div className="flex flex-row">
          <Image
            className="mr-2 rounded-md"
            src={imageURL}
            alt="Avatar"
            width={20}
            height={20}
            onError={handleUserPFPDoesNotExist}
          />
          <div className="hidden font-clayno text-sm md:block">
            {displayName}
          </div>
        </div>
      }
    >
      {/* <Dropdown.Header></Dropdown.Header> */}

      <Dropdown.Item
        className="text-white hover:bg-neutral-900 focus:bg-neutral-900"
        icon={LogOut}
        onClick={handleSignout}
      >
        Sign out
      </Dropdown.Item>
    </Dropdown>
  );
}
