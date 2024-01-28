import { Dropdown } from "flowbite-react";
import { HiCog, HiLogout, HiViewGrid, HiUser } from "react-icons/hi";
import Image from "next/image";
import { useRouter } from "next/router";
import { handleUserPFPDoesNotExist } from "~/utils/images";

type ProfileButtonProps = {
  imageURL: string;
  username: string;
  handleSignout: () => void;
  sessionKey: string;
};

export default function ProfileButton(props: ProfileButtonProps) {
  const { imageURL, username, handleSignout, sessionKey } = props;
  const router = useRouter();

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
          <div className="hidden font-clayno text-sm md:block">{username}</div>
        </div>
      }
    >
      {/* <Dropdown.Header></Dropdown.Header> */}
      <Dropdown.Item
        className="text-white hover:bg-neutral-900 focus:bg-neutral-900"
        icon={HiUser}
        onClick={() => router.push(`/profile/${sessionKey}`)}
      >
        Profile
      </Dropdown.Item>
      <Dropdown.Item
        className="text-white hover:bg-neutral-900 focus:bg-neutral-900"
        icon={HiViewGrid}
        onClick={() => router.push(`/inventory/${sessionKey}`)}
      >
        Inventory
      </Dropdown.Item>
      <Dropdown.Item
        className="text-white hover:bg-neutral-900 focus:bg-neutral-900"
        icon={HiCog}
        onClick={() => router.push(`/profile/${sessionKey}/settings`)}
      >
        Settings
      </Dropdown.Item>
      <Dropdown.Divider className="bg-neutral-700" />
      <Dropdown.Item
        className="text-white hover:bg-neutral-900 focus:bg-neutral-900"
        icon={HiLogout}
        onClick={handleSignout}
      >
        Sign out
      </Dropdown.Item>
    </Dropdown>
  );
}
