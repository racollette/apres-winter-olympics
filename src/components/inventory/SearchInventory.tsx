import { type ChangeEvent, useState } from "react";
import { api } from "~/utils/api";
import Link from "next/link";
import { HiExternalLink, HiXCircle } from "react-icons/hi";

export const SearchInventory = () => {
  const [inputText, setInputText] = useState("");

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const { data: existingInventories } =
    api.inventory.findHolder.useQuery(inputText);

  const inventoryFound =
    existingInventories &&
    existingInventories?.length > 0 &&
    existingInventories.filter((holder) => holder.owner !== "").length > 0;

  console.log(existingInventories);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <h1 className="font-clayno text-xl">Inventory Search</h1>
      <div className="flex w-full flex-col gap-2 md:w-1/2">
        <h2 className="text-xs uppercase">Search Address</h2>
        <div className="relative w-full">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Solana Address"
            className="w-full rounded-lg text-sm text-black"
          />
          <HiXCircle
            className="absolute right-2 top-2 cursor-pointer"
            size={24}
            color="black"
            onClick={() => setInputText("")}
          />
        </div>
      </div>
      <div>
        <div className="flex flex-col items-center justify-center gap-4">
          {inventoryFound ? (
            <>
              <p className="pt-4 text-xs uppercase">Wallets found</p>
              {existingInventories?.map((inventory) => (
                <Link
                  href={`/inventory/${inventory.owner}`}
                  target="_blank"
                  key={inventory.owner}
                >
                  <div className="flex flex-row items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 hover:bg-cyan-600">
                    <p className="text-sm">{inventory.owner}</p>
                    <HiExternalLink size={24} />
                  </div>
                </Link>
              ))}
            </>
          ) : (
            <p>No wallets found</p>
          )}
        </div>
      </div>
    </div>
  );
};
