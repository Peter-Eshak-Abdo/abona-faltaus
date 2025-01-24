import Head from "next/head";
import Script from "next/script";
import Link from "next/link";

function HeadPage() {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Abona Faltaos</title>
        <meta name="description" content="Chritian things like: Tranim, Al7an, W3zat and 3geda" />
        <meta name="author" content="Peter Eshak Abdo" />
        <Link href="https://cdn.jsdelivr.net/npm/@docsearch/css@3" rel="stylesheet" />
        <Link href="../../src/css/bootstrap/bootstrap.rtl.min.css" rel="stylesheet" />
        <Link href="../../src/css/bootstrap/main.css" rel="stylesheet" />
      </Head>
      <Script src="../../src/js/bootstrap/color-modes.js"></Script>
    </>
  );
}

export default HeadPage;

