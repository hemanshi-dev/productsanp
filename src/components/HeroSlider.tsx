import React from "react";

/** Color product/fashion shots — grayscale until section hover */
const COLOR_SLIDER_IMAGES = [
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/d4007a6e-a58f-44ed-b4c9-464e37894c18.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/803435aa-7540-41de-9a86-890e02e06196.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/c0574fbe-8a3a-4ae1-98b8-9b9a30bbd7a9.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/bf5bff34-ee2b-4286-a67a-40e6d9deee46.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/5e00fa99-d817-4392-8a2f-da7deac92792.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/144652c0-402c-4e74-b369-05205f4bba87.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/406a090c-80dd-4186-bd32-88d68f30876c.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/7203d357-dcaf-40e5-84c7-1d3b9a6f5ff5.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/ab18a524-10cb-49e0-83f3-1b72c28fa576.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/a188815f-6866-42ed-91cd-4bde5bdcdf47.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/d18210ca-f67d-4afc-afb9-0b73032158e8.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/a586ddbd-4b0b-4e4e-9694-40e401c7317b.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/961ad8ea-70ef-4325-b872-837d64722ede.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/37d5f38b-5a93-47e1-b4be-1d7d885b1d18.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/71d1b203-8147-4be2-b864-b84d9c9cc0d9.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/de546e80-778e-442c-bb33-7e62aa3a72c0.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/65538a2e-a3e8-41d9-91a2-8a167eeb3489.jpg",
  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/619661fd-5174-42a6-ba63-96be2f9c1fc9.jpg",
];

const topRowImages = COLOR_SLIDER_IMAGES.slice(0, 9);
const bottomRowImages = COLOR_SLIDER_IMAGES.slice(9, 18);

const topRowLabels = [
  "Editorial Magazine Images",
  "Runway and Fashion Show Frames",
  "Product Photoshoot",
  "Apparel Photoshoot",
  "Jewelry Photoshoot",
  "Footwear Photoshoot",
  "Packshot / Ecommerce Standard",
  "Ads & Promotions",
  "Social Media Creative",
];

const bottomRowLabels = [
  "Apparel Photoshoot",
  "Jewelry Photoshoot",
  "Footwear Photoshoot",
  "Packshot / Ecommerce Standard",
  "Ads & Promotions",
  "Social Media Creative",
  "Product Photoshoot",
  "Festival Themes",
  "Glamour and Beauty Shoots",
];

type SliderItem =
  | { type: "text"; text: string }
  | { type: "image"; src: string; alt: string }
  | { type: "image-pair"; srcs: [string, string]; alt: string };

const buildRowItems = (
  labels: string[],
  images: string[],
  pairAtIndexes: number[] = [],
): SliderItem[] =>
  labels.flatMap((text, index) => {
    const items: SliderItem[] = [{ type: "text", text }];

    if (pairAtIndexes.includes(index)) {
      items.push({
        type: "image-pair",
        srcs: [
          images[index % images.length],
          images[(index + 1) % images.length],
        ],
        alt: text,
      });
    } else {
      items.push({
        type: "image",
        src: images[index % images.length],
        alt: text,
      });
    }

    return items;
  });

const topRowItems = buildRowItems(topRowLabels, topRowImages, [2, 6]);
const bottomRowItems = buildRowItems(bottomRowLabels, bottomRowImages, [1, 5]);

const PILL_IMAGE_CLASS =
  "hs-pill-image inline-block h-[54px] w-[122px] min-h-[54px] min-w-[122px] max-h-[54px] max-w-[122px] shrink-0 overflow-hidden rounded-full bg-[#111111] md:h-[80px] md:w-[180px] md:min-h-[80px] md:min-w-[180px] md:max-h-[80px] md:max-w-[180px]";

const Heroslider: React.FC = () => {
  const renderPillImage = (src: string, alt: string, key: string) => (
    <span key={key} className={PILL_IMAGE_CLASS}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="hs-pill-img block h-full w-full object-cover object-center"
      />
    </span>
  );

  const renderItem = (item: SliderItem, pillPrefix: string) => {
    if (item.type === "image-pair") {
      return (
        <span
          key={`${pillPrefix}-pair`}
          className="inline-flex shrink-0 items-center gap-2 align-middle mx-2 md:mx-3 md:gap-3"
        >
          {renderPillImage(item.srcs[0], item.alt, `${pillPrefix}-a`)}
          {renderPillImage(item.srcs[1], item.alt, `${pillPrefix}-b`)}
        </span>
      );
    }

    if (item.type === "image") {
      return (
        <span key={`${pillPrefix}-img`} className="align-middle mx-2 md:mx-3">
          {renderPillImage(item.src, item.alt, pillPrefix)}
        </span>
      );
    }

    return (
      <span
        key={`${pillPrefix}-text`}
        className="font-clash-display inline-flex shrink-0 items-center px-[10px] text-[20px] font-medium leading-[1.05] tracking-[-0.02em] text-white align-middle md:px-4 md:text-[30px]"
      >
        {item.text}
      </span>
    );
  };

  const loopItems = (items: SliderItem[], rowPrefix: string) =>
    [...items, ...items, ...items].map((item, index) =>
      renderItem(item, `${rowPrefix}-${index}`),
    );

  return (
    <section className="hs-slider-section relative min-h-[84px] w-full cursor-default overflow-hidden bg-black py-[10px] md:min-h-[120px] md:pt-[14px] md:pb-[10px]">
      <div className="hs-track hs-track-left relative z-[1] mb-[8px] flex w-max items-center whitespace-nowrap will-change-transform">
        {loopItems(topRowItems, "top")}
      </div>

      <div className="hs-track hs-track-right hs-track-stagger relative z-[1] flex w-max items-center whitespace-nowrap will-change-transform">
        {loopItems(bottomRowItems, "bottom")}
      </div>

      <style>{`
        .hs-track-left {
          animation: hs-left 36s linear infinite;
        }

        .hs-track-right {
          animation: hs-right 30s linear infinite;
        }

        .hs-slider-section:hover .hs-track-left,
        .hs-slider-section:hover .hs-track-right {
          animation-play-state: paused;
        }

        .hs-track-stagger {
          padding-left: 124px;
        }

        @media (min-width: 768px) {
          .hs-track-stagger {
            padding-left: 228px;
          }
        }

        @media (max-width: 480px) {
          .hs-pill-image {
            height: 42px !important;
            width: 95px !important;
            min-height: 42px !important;
            min-width: 95px !important;
            max-height: 42px !important;
            max-width: 95px !important;
          }
          .hs-slider-section span.font-clash-display {
            font-size: 16px !important;
            padding-left: 6px !important;
            padding-right: 6px !important;
          }
          .hs-track-stagger {
            padding-left: 60px !important;
          }
        }

        .hs-pill-img {
          filter: grayscale(100%);
          transition: filter 0.5s ease;
        }

        .hs-slider-section:hover .hs-pill-img {
          filter: grayscale(0%);
        }

        @keyframes hs-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }

        @keyframes hs-right {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
};

export default Heroslider;
