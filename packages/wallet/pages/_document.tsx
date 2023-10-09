import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="byor icon" href="/static/favicon.svg" type="image/svg+xml" />
        <link
          rel="byor icon"
          href="/static/favicon-dark.png"
          type="image/png"
          media="(prefers-color-scheme: dark)"
        />
        <link
          rel="byor icon"
          href="/static/favicon-light.png"
          type="image/png"
          media="(prefers-color-scheme: light)"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
