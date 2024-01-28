import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/@/components/ui/dialog";
import Link from "next/link";

type ItemProps = {
  item: any;
  type: string;
};

type ImageState = "gif" | "pfp" | "class";

const Item = ({ item, type }: ItemProps) => {
  const [imageState, setImageState] = useState<ImageState>("gif");
  const [imageBlobs, setImageBlobs] = useState({
    pfp: null,
    gif: null,
    class: null,
  });

  const isDino = type === "dino";
  const isClay = type === "clay";
  const isClaymaker = type === "claymaker";
  const isConsumable = type === "consumable";
  const isPizza = item.symbol === "PIZZA";

  const attributesArray = Object.entries(item.attributes ?? {});

  const handleDownload = (name: string, extension: string) => {
    const blob = imageBlobs[imageState];

    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const imageName =
        imageState === "class"
          ? `${item.name}_${item.attributes.class}`
          : item.name;
      link.setAttribute("download", `${imageName}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link?.parentNode?.removeChild(link);
    }
  };

  useEffect(() => {
    const getImageBlob = async (imageType: string) => {
      try {
        const response = await fetch(
          `${
            imageType === "pfp"
              ? item.pfp
              : imageType === "class"
              ? item.classPFP
              : isDino || isClaymaker || isClay
              ? item.gif
              : item.image
          }`
        );

        if (response.ok) {
          const blob = await response.blob();
          setImageBlobs((prevBlobs) => ({ ...prevBlobs, [imageType]: blob }));
        } else {
          throw new Error("Image download failed");
        }
      } catch (error) {
        console.error("Error downloading image:", error);
      }
    };

    getImageBlob("pfp");
    getImageBlob("gif");
    getImageBlob("class");
  }, [
    item.pfp,
    item.gif,
    item.classPFP,
    item.image,
    isDino,
    isClay,
    isClaymaker,
  ]);

  return (
    <div
      key={item.mint}
      className={`relative flex h-24 w-24 cursor-pointer justify-center overflow-clip rounded-md lg:h-40 lg:w-40`}
    >
      <Dialog>
        <DialogTrigger asChild>
          <Image
            className="transform-gpu transition-transform hover:scale-125"
            src={
              isDino
                ? `https://prod-image-cdn.tensor.trade/images/slug=claynosaurz/400x400/freeze=false/${
                    imageState === "pfp"
                      ? item.pfp
                      : imageState === "class"
                      ? item.classPFP
                      : item.gif
                  }`
                : `https://prod-image-cdn.tensor.trade/images/slug=claynosaurz/400x400/freeze=false/${
                    item.image || item.gif
                  }`
            }
            alt={"Clayno"}
            fill
            quality={75}
          />
        </DialogTrigger>
        <DialogContent className="flex w-11/12 max-w-2xl flex-col gap-4 rounded-lg border-none bg-neutral-900/80 p-4">
          <DialogHeader>
            <DialogTitle className="m-0 font-clayno text-white">
              {item.name}
            </DialogTitle>
          </DialogHeader>
          {/* <DialogDescription className="text-neutral-500">
            Filter herds by traits
          </DialogDescription> */}
          <div className="flex flex-col items-start justify-start gap-4 md:grid md:grid-cols-8 md:gap-0">
            <div className="relative flex aspect-square w-full flex-wrap items-center justify-center gap-4 overflow-clip rounded-lg p-4 text-white md:col-span-5">
              <Image
                src={`https://prod-image-cdn.tensor.trade/images/slug=claynosaurz/400x400/freeze=false/${
                  imageState === "pfp"
                    ? item.pfp
                    : imageState === "class"
                    ? item.classPFP
                    : item.gif || item.image
                }`}
                alt={"Clayno"}
                fill
              />
              <div className="absolute bottom-2 flex w-[95%] flex-row justify-between rounded-md bg-black px-2 py-2">
                <div className="flex flex-row gap-2">
                  <button
                    onClick={() => {
                      setImageState("gif");
                    }}
                    className={`rounded-sm px-4 py-1 font-clayno text-xs font-bold ${
                      imageState === "gif" ? `bg-emerald-600` : `bg-neutral-500`
                    }`}
                  >
                    {isClay
                      ? `IMAGE`
                      : isClaymaker
                      ? `GIF`
                      : isDino
                      ? `GIF`
                      : `IMAGE`}
                  </button>
                  {item.pfp && (
                    <button
                      onClick={() => {
                        setImageState("pfp");
                      }}
                      className={`rounded-sm  px-4 py-1 font-clayno text-xs font-bold ${
                        imageState === "pfp"
                          ? `bg-emerald-600`
                          : `bg-neutral-500`
                      }`}
                    >
                      PFP
                    </button>
                  )}

                  {item.classPFP && (
                    <button
                      onClick={() => {
                        setImageState("class");
                      }}
                      className={`rounded-sm px-4 py-1 font-clayno text-xs font-bold ${
                        imageState === "class"
                          ? `bg-emerald-600`
                          : `bg-neutral-500`
                      }`}
                    >
                      CLASS
                    </button>
                  )}
                </div>
                <div>
                  <button
                    className="rounded-sm bg-cyan-600 px-4 py-1 font-clayno text-xs font-bold"
                    onClick={() =>
                      handleDownload(
                        item.name,
                        imageState === "pfp"
                          ? "png"
                          : isDino
                          ? "gif"
                          : isClaymaker
                          ? "gif"
                          : isPizza
                          ? "gif"
                          : "png"
                      )
                    }
                  >
                    DOWNLOAD
                  </button>
                </div>
              </div>
            </div>
            <div className="h-full w-full items-center gap-4 px-4 font-clayno text-lg text-white md:col-span-3">
              <div className="flex h-full flex-col justify-between">
                <div className="flex flex-col">
                  <h1 className="pb-2">TRAITS</h1>
                  {isDino && (
                    <>
                      {attributesArray.map(([key, value]) => {
                        if (key === "mint") return null;
                        return (
                          <div
                            key={key}
                            className="flex flex-row justify-between"
                          >
                            <p className="text-sm text-neutral-500">{key}</p>
                            <p className="text-sm">{value as string}</p>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {isClaymaker && (
                    <div className="flex flex-row justify-between">
                      <p className="text-sm text-neutral-500">Edition</p>
                      <p className="text-sm">{item.edition}</p>
                    </div>
                  )}

                  {isClay && (
                    <div className="flex flex-row justify-between">
                      <p className="text-sm text-neutral-500">Color</p>
                      <p className="text-sm">{item.color}</p>
                    </div>
                  )}

                  {isConsumable && (
                    <>
                      {item.attributes &&
                        item.attributes.map(
                          (
                            trait: { value: string; trait_type: string },
                            idx: number
                          ) => {
                            return (
                              <div
                                key={idx}
                                className="flex flex-row justify-between"
                              >
                                {trait.value.length > 0 && (
                                  <p className="text-sm text-neutral-500">
                                    {trait.trait_type}
                                  </p>
                                )}
                                <p className="text-sm">{trait.value}</p>
                              </div>
                            );
                          }
                        )}
                    </>
                  )}
                </div>
                <div className="flex flex-row gap-2 place-self-end">
                  <Link
                    href={`https://tensor.trade/item/${item.mint}`}
                    target="_blank"
                  >
                    <Image
                      src="/icons/tensor.svg"
                      alt="Tensor"
                      width={24}
                      height={24}
                      className="hover:scale-125"
                    />
                  </Link>
                  <Link
                    href={`https://magiceden.io/item-details/${item.mint}`}
                    target="_blank"
                  >
                    <Image
                      src="/icons/magic_eden.svg"
                      alt="Magic Eden"
                      width={24}
                      height={24}
                      className="hover:scale-125"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Item;
