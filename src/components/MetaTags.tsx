import Head from "next/head";

const MetaTags = ({
  title = "Clayno.club",
  description = "Unofficial Claynosaurz Community Tools",
  ogTitle = "Unofficial Claynosaurz Community Tools",
  ogDescription = "Explore the dinos, herds and tribes of Claynotopia! Collectors collect.",
  ogImage = "/images/og.jpeg",
  ogUrl = "https://clayno.club",
  twitterCard = "Explore the dinos, herds and tribes of Claynotopia! Collectors collect.",
  twitterImage = "/images/og.jpeg",
}) => {
  return (
    <Head>
      {/* Page title */}
      <title>{title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Description */}
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />

      <meta name="twitter:image" content={twitterImage} />
      <link rel="icon" href="/icons/dactyl_colored.svg" />
    </Head>
  );
};

export default MetaTags;
