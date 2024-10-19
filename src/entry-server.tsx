// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          {assets}
        </head>
        <body class="bg-primaryBackground text-primaryText h-screen w-screen font-mono relative">
          <div id="app" class="w-full h-full">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
