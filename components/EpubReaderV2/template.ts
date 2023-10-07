export default `
<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>foliate.js</title>
    <script id="jszip"></script>
    <script id="foliate"></script>

    <style type="text/css">
      html {
        height: 100%;
        display: flex;
        overflow: hidden !important;
        justify-content: center;
        align-items: center;
      }
      body {
        margin: 0 auto;
        height: 100%;
        font: menu;
        font-family: system-ui, sans-serif;
      }
      .foliate-view {
        height: 100vh;
        width: 100%;
      }
    </style>
  </head>

  <body oncopy='return false' oncut='return false'>
    <script>
      let reader;
      const bookPath = undefined;
      const bookLocation = undefined;

      try {
        reader = new foliate(bookPath, bookLocation);
      } catch (err) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: "epubjs", message: "[INDEX_HTML] ERROR " + err })
        );
      }

    </script>
  </body>
</html>
`;
